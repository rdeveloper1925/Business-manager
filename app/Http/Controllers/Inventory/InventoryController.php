<?php

namespace App\Http\Controllers\Inventory;

use App\Contracts\Inventory\InventoryServiceInterface;
use App\DataTransferObjects\Inventory\AdjustInventoryData;
use App\Exceptions\Inventory\InsufficientStockException;
use App\Exceptions\Inventory\InvalidTransactionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\UpdateInventoryRequest;
use App\Models\InventoryTransaction;
use App\Models\Part;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class InventoryController extends Controller
{
    public function __construct(
        private readonly InventoryServiceInterface $inventoryService,
    ) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Part::class);

        $lowStockParts = $this->inventoryService->getLowStockParts();

        $lowStockParts->each(function (Part $part): void {
            $part->setAttribute('stock_summary', $this->inventoryService->getStockSummary($part));
        });

        return Inertia::render('inventory/index', [
            'summaryCards' => $this->inventoryService->getDashboardSummary(),
            'lowStockParts' => $lowStockParts,
            'recentTransactions' => InventoryTransaction::query()
                ->with(['part:part_id,part_name,part_number', 'performer:id,name'])
                ->latest('transacted_at')
                ->limit(10)
                ->get(),
        ]);
    }

    public function adjust(UpdateInventoryRequest $request): RedirectResponse
    {
        $part = Part::query()->findOrFail($request->validated('part_id'));
        $this->authorize('update', $part);

        $data = AdjustInventoryData::fromRequest($request);

        try {
            $this->inventoryService->adjustInventory($data, $request->user());
        } catch (InsufficientStockException) {
            return back()->withErrors([
                'quantity_on_hand' => __('Insufficient stock for this adjustment.'),
            ]);
        } catch (InvalidTransactionException $exception) {
            $field = str_contains($exception->getMessage(), 'No inventory record')
                ? 'part_id'
                : 'quantity_reserved';

            return back()->withErrors([
                $field => $exception->getMessage(),
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Inventory adjusted.')]);

        return to_route('inventory.parts.show', ['part' => $data->partId]);
    }
}
