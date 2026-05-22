<?php

namespace App\Http\Controllers\Inventory;

use App\Contracts\Inventory\InventoryServiceInterface;
use App\DataTransferObjects\Inventory\RecordTransactionData;
use App\Enums\ConditionType;
use App\Enums\TransactionType;
use App\Exceptions\Inventory\InsufficientStockException;
use App\Exceptions\Inventory\InvalidTransactionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\IndexInventoryTransactionsRequest;
use App\Http\Requests\Inventory\StoreInventoryTransactionRequest;
use App\Http\Requests\Inventory\UpdateInventoryTransactionRequest;
use App\Models\InventoryTransaction;
use App\Models\Part;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class InventoryTransactionController extends Controller
{
    public function __construct(
        private readonly InventoryServiceInterface $inventoryService,
    ) {}

    public function index(IndexInventoryTransactionsRequest $request): Response
    {
        $this->authorize('viewAny', InventoryTransaction::class);

        $validated = $request->validated();
        $partId = isset($validated['part_id']) ? (int) $validated['part_id'] : null;
        $transactionTypes = $this->normalizeTransactionTypesFilter(
            $validated['transaction_types'] ?? $request->input('transaction_types'),
        );
        $condition = $validated['condition'] ?? null;
        $dateFrom = $validated['date_from'] ?? null;
        $dateTo = $validated['date_to'] ?? null;

        $query = InventoryTransaction::query()
            ->with(['part:part_id,part_name,part_number', 'performer:id,name', 'supplier:id,company_name']);

        if ($partId !== null) {
            $query->where('part_id', $partId);
        }

        if ($transactionTypes !== []) {
            $query->whereIn('transaction_type', $transactionTypes);
        }

        if ($condition !== null) {
            $query->where('condition', $condition);
        }

        if ($dateFrom !== null) {
            $query->whereDate('transacted_at', '>=', $dateFrom);
        }

        if ($dateTo !== null) {
            $query->whereDate('transacted_at', '<=', $dateTo);
        }

        return Inertia::render('inventory/transactions/index', [
            'transactions' => $query->latest('transacted_at')->paginate(15)->withQueryString(),
            'parts' => $this->partFilterOptions(),
            'transactionTypes' => $this->transactionTypeOptions(),
            'conditions' => $this->conditionOptions(),
            'filters' => [
                'part_id' => $partId,
                'transaction_types' => $transactionTypes,
                'condition' => $condition,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', InventoryTransaction::class);

        $partId = $request->filled('part_id') ? (int) $request->input('part_id') : null;
        $transactionType = $request->input('transaction_type');
        $allowedTypes = array_map(
            fn (TransactionType $type) => $type->value,
            TransactionType::cases(),
        );

        return Inertia::render('inventory/transactions/create', [
            'parts' => [],
            'suppliers' => Supplier::query()->orderBy('company_name')->get(['id', 'company_name']),
            'transactionTypes' => $this->transactionTypeOptions(),
            'conditions' => $this->conditionOptions(),
            'preselected' => [
                'part_id' => $partId,
                'transaction_type' => is_string($transactionType) && in_array($transactionType, $allowedTypes, true)
                    ? $transactionType
                    : null,
            ],
        ]);
    }

    public function store(StoreInventoryTransactionRequest $request): RedirectResponse
    {
        $this->authorize('create', InventoryTransaction::class);

        try {
            $this->inventoryService->recordTransaction(
                RecordTransactionData::fromRequest($request),
                $request->user(),
            );
        } catch (InsufficientStockException) {
            return back()->withErrors([
                'qty_delta' => __('Insufficient stock for this transaction.'),
            ]);
        } catch (InvalidTransactionException $exception) {
            return back()->withErrors([
                'part_id' => $exception->getMessage(),
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transaction recorded.')]);

        return to_route('inventory.transactions.index');
    }

    public function show(InventoryTransaction $transaction): Response
    {
        $this->authorize('view', $transaction);

        $transaction->load(['part', 'performer', 'supplier']);

        return Inertia::render('inventory/transactions/show', [
            'transaction' => $transaction,
        ]);
    }

    public function edit(InventoryTransaction $transaction): Response
    {
        $this->authorize('update', $transaction);

        $transaction->load(['part', 'performer', 'supplier']);

        return Inertia::render('inventory/transactions/edit', [
            'transaction' => $transaction,
            'suppliers' => Supplier::query()->orderBy('company_name')->get(['id', 'company_name']),
        ]);
    }

    public function update(
        UpdateInventoryTransactionRequest $request,
        InventoryTransaction $transaction,
    ): RedirectResponse {
        $this->authorize('update', $transaction);

        $validated = $request->validated();

        $this->inventoryService->updateTransaction(
            $transaction,
            isset($validated['unit_cost']) ? (float) $validated['unit_cost'] : null,
            isset($validated['supplier_id']) ? (int) $validated['supplier_id'] : null,
            $validated['notes'] ?? null,
            $request->user(),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transaction updated.')]);

        return to_route('inventory.transactions.show', $transaction);
    }

    /**
     * @return list<array{part_id: int, part_name: string, part_number: string}>
     */
    private function partFilterOptions(): array
    {
        return Part::query()
            ->orderBy('part_name')
            ->get(['part_id', 'part_name', 'part_number'])
            ->map(fn (Part $part): array => [
                'part_id' => $part->part_id,
                'part_name' => $part->part_name,
                'part_number' => $part->part_number,
            ])
            ->all();
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function transactionTypeOptions(): array
    {
        return collect(TransactionType::cases())
            ->map(fn (TransactionType $type): array => [
                'value' => $type->value,
                'label' => $type->label(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function conditionOptions(): array
    {
        return collect(ConditionType::cases())
            ->map(fn (ConditionType $type): array => [
                'value' => $type->value,
                'label' => $type->label(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<string>
     */
    private function normalizeTransactionTypesFilter(mixed $input): array
    {
        if (is_string($input) && $input !== '') {
            return [$input];
        }

        if (! is_array($input)) {
            return [];
        }

        $allowed = array_map(
            fn (TransactionType $type) => $type->value,
            TransactionType::cases(),
        );

        return array_values(array_filter(
            $input,
            fn (mixed $value): bool => is_string($value) && in_array($value, $allowed, true),
        ));
    }
}
