<?php

namespace App\Http\Controllers\Inventory;

use App\Contracts\Inventory\InventoryServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\IndexPartsRequest;
use App\Http\Requests\Inventory\StorePartRequest;
use App\Http\Requests\Inventory\UpdatePartRequest;
use App\Models\Inventory;
use App\Models\Part;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class PartController extends Controller
{
    public function __construct(
        private readonly InventoryServiceInterface $inventoryService,
    ) {}

    public function index(IndexPartsRequest $request): Response
    {
        $this->authorize('viewAny', Part::class);

        $validated = $request->validated();
        $search = isset($validated['search']) ? trim((string) $validated['search']) : '';
        $supplierId = isset($validated['supplier_id']) ? (int) $validated['supplier_id'] : null;
        $sort = $validated['sort'] ?? 'part_name';
        $direction = ($validated['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $query = Part::query()->with(['supplier', 'inventory']);

        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function ($q) use ($like) {
                $q->where('part_name', 'like', $like)
                    ->orWhere('part_number', 'like', $like);
            });
        }

        if ($supplierId !== null) {
            $query->where('supplier_id', $supplierId);
        }

        if ($sort === 'quantity_on_hand') {
            $inventoryTable = (new Inventory)->getTable();
            $query->leftJoin($inventoryTable, 'parts.part_id', '=', "{$inventoryTable}.part_id")
                ->orderBy("{$inventoryTable}.quantity_on_hand", $direction)
                ->select('parts.*');
        } else {
            $query->orderBy($sort, $direction);
        }

        $parts = $query->paginate(10)->withQueryString();

        $parts->getCollection()->transform(function (Part $part) {
            $part->setAttribute(
                'stock_summary',
                $this->inventoryService->getStockSummary($part),
            );

            return $part;
        });

        return Inertia::render('inventory/parts/index', [
            'parts' => $parts,
            'suppliers' => Supplier::query()->orderBy('company_name')->get(['id', 'company_name']),
            'filters' => [
                'search' => $search,
                'supplier_id' => $supplierId,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Part::class);

        $search = trim((string) $request->input('q', ''));
        $limit = min((int) $request->input('limit', 25), 50);

        $query = Part::query()
            ->with('inventory')
            ->orderBy('part_name')
            ->limit($limit);

        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function ($q) use ($like) {
                $q->where('part_name', 'like', $like)
                    ->orWhere('part_number', 'like', $like);
            });
        }

        $parts = $query->get(['part_id', 'part_name', 'part_number', 'reorder_point']);

        return response()->json(
            $parts->map(fn (Part $part): array => [
                'part_id' => $part->part_id,
                'part_name' => $part->part_name,
                'part_number' => $part->part_number,
                'reorder_point' => $part->reorder_point,
                'quantity_on_hand' => $part->inventory?->quantity_on_hand ?? 0,
            ])->values(),
        );
    }

    public function create(): Response
    {
        $this->authorize('create', Part::class);

        return Inertia::render('inventory/parts/create', [
            'part' => null,
            'suppliers' => Supplier::query()->orderBy('company_name')->get(['id', 'company_name']),
        ]);
    }

    public function store(StorePartRequest $request): RedirectResponse
    {
        $this->authorize('create', Part::class);

        $part = DB::transaction(function () use ($request): Part {
            $part = Part::query()->create($request->validated());

            Inventory::query()->create([
                'part_id' => $part->part_id,
                'quantity_on_hand' => 0,
                'quantity_reserved' => 0,
                'quantity_on_order' => 0,
            ]);

            return $part;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Part created.')]);

        return to_route('inventory.parts.index');
    }

    public function show(Part $part): Response
    {
        $this->authorize('view', $part);

        $part->load([
            'supplier',
            'inventory',
            'inventoryTransactions' => fn ($query) => $query
                ->with('performer')
                ->latest('transacted_at')
                ->limit(10),
        ]);

        return Inertia::render('inventory/parts/show', [
            'part' => $part,
            'summary' => $this->inventoryService->getStockSummary($part),
        ]);
    }

    public function edit(Part $part): Response
    {
        $this->authorize('update', $part);

        $part->load('supplier');

        return Inertia::render('inventory/parts/edit', [
            'part' => $part,
            'suppliers' => Supplier::query()->orderBy('company_name')->get(['id', 'company_name']),
        ]);
    }

    public function update(UpdatePartRequest $request, Part $part): RedirectResponse
    {
        $this->authorize('update', $part);

        $part->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Part updated.')]);

        return to_route('inventory.parts.show', $part);
    }

    public function destroy(Part $part): RedirectResponse
    {
        $this->authorize('delete', $part);

        $part->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Part removed.')]);

        return to_route('inventory.parts.index');
    }
}
