<?php

namespace Tests\Feature;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\Part;
use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\InventorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_inventory_dashboard(): void
    {
        $this->get(route('inventory.dashboard'))->assertRedirect();
    }

    public function test_authenticated_user_can_view_inventory_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('inventory.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('inventory/index')
                ->has('summaryCards')
                ->has('lowStockParts')
                ->has('recentTransactions'));
    }

    public function test_authenticated_user_can_create_part_with_inventory_row(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('inventory.parts.store'), [
                'part_name' => 'Bolt',
                'part_number' => 'PT-10001',
                'unit_of_measure' => 'ea',
                'cost_price' => 1.50,
                'sell_price' => 3.00,
            ])
            ->assertRedirect(route('inventory.parts.index'));

        $part = Part::query()->where('part_number', 'PT-10001')->first();

        $this->assertNotNull($part);
        $this->assertDatabaseHas('inventory', [
            'part_id' => $part->part_id,
            'quantity_on_hand' => 0,
        ]);
    }

    public function test_authenticated_user_can_adjust_inventory_on_part(): void
    {
        $user = User::factory()->create();
        $part = Part::factory()->create();
        Inventory::factory()->create([
            'part_id' => $part->part_id,
            'quantity_on_hand' => 10,
            'quantity_reserved' => 2,
            'quantity_on_order' => 5,
        ]);

        $this->actingAs($user)
            ->post(route('inventory.adjust'), [
                'part_id' => $part->part_id,
                'quantity_on_hand' => 15,
                'quantity_reserved' => 3,
                'quantity_on_order' => 8,
            ])
            ->assertRedirect(route('inventory.parts.show', $part));

        $this->assertDatabaseHas('inventory', [
            'part_id' => $part->part_id,
            'quantity_on_hand' => 15,
            'quantity_reserved' => 3,
            'quantity_on_order' => 8,
        ]);

        $this->assertDatabaseHas('inventory_transactions', [
            'part_id' => $part->part_id,
            'transaction_type' => 'ADJUSTMENT',
            'qty_delta' => 5,
        ]);
    }

    public function test_adjust_rejects_reserved_greater_than_on_hand(): void
    {
        $user = User::factory()->create();
        $part = Part::factory()->create();
        Inventory::factory()->create([
            'part_id' => $part->part_id,
            'quantity_on_hand' => 10,
        ]);

        $this->actingAs($user)
            ->post(route('inventory.adjust'), [
                'part_id' => $part->part_id,
                'quantity_on_hand' => 10,
                'quantity_reserved' => 11,
                'quantity_on_order' => 0,
            ])
            ->assertSessionHasErrors('quantity_reserved');
    }

    public function test_store_transaction_normalizes_positive_sale_delta_to_negative(): void
    {
        $user = User::factory()->create();
        $part = Part::factory()->create();
        Inventory::factory()->create([
            'part_id' => $part->part_id,
            'quantity_on_hand' => 10,
        ]);

        $this->actingAs($user)
            ->post(route('inventory.transactions.store'), [
                'part_id' => $part->part_id,
                'transaction_type' => 'SALE',
                'qty_delta' => 5,
                'condition' => 'GOOD',
                'transacted_at' => now()->format('Y-m-d H:i:s'),
            ])
            ->assertRedirect(route('inventory.transactions.index'));

        $this->assertDatabaseHas('inventory_transactions', [
            'part_id' => $part->part_id,
            'transaction_type' => 'SALE',
            'qty_delta' => -5,
            'qty_after' => 5,
        ]);
        $this->assertDatabaseHas('inventory', [
            'part_id' => $part->part_id,
            'quantity_on_hand' => 5,
        ]);
    }

    public function test_store_transaction_normalizes_negative_restock_delta_to_positive(): void
    {
        $user = User::factory()->create();
        $part = Part::factory()->create();
        Inventory::factory()->create([
            'part_id' => $part->part_id,
            'quantity_on_hand' => 10,
        ]);

        $this->actingAs($user)
            ->post(route('inventory.transactions.store'), [
                'part_id' => $part->part_id,
                'transaction_type' => 'RESTOCK',
                'qty_delta' => -5,
                'condition' => 'GOOD',
                'transacted_at' => now()->format('Y-m-d H:i:s'),
            ])
            ->assertRedirect(route('inventory.transactions.index'));

        $this->assertDatabaseHas('inventory_transactions', [
            'part_id' => $part->part_id,
            'transaction_type' => 'RESTOCK',
            'qty_delta' => 5,
            'qty_after' => 15,
        ]);
    }

    public function test_store_restock_uses_part_supplier_when_supplier_not_selected(): void
    {
        $user = User::factory()->create();
        $supplier = Supplier::factory()->create();
        $part = Part::factory()->create(['supplier_id' => $supplier->id]);
        Inventory::factory()->create([
            'part_id' => $part->part_id,
            'quantity_on_hand' => 10,
        ]);

        $this->actingAs($user)
            ->post(route('inventory.transactions.store'), [
                'part_id' => $part->part_id,
                'transaction_type' => 'RESTOCK',
                'qty_delta' => 2,
                'condition' => 'GOOD',
                'transacted_at' => now()->format('Y-m-d H:i:s'),
            ])
            ->assertRedirect(route('inventory.transactions.index'));

        $this->assertDatabaseHas('inventory_transactions', [
            'part_id' => $part->part_id,
            'supplier_id' => $supplier->id,
            'qty_delta' => 2,
        ]);
    }

    public function test_store_adjustment_preserves_negative_delta(): void
    {
        $user = User::factory()->create();
        $part = Part::factory()->create();
        Inventory::factory()->create([
            'part_id' => $part->part_id,
            'quantity_on_hand' => 10,
        ]);

        $this->actingAs($user)
            ->post(route('inventory.transactions.store'), [
                'part_id' => $part->part_id,
                'transaction_type' => 'ADJUSTMENT',
                'qty_delta' => -3,
                'condition' => 'GOOD',
                'transacted_at' => now()->format('Y-m-d H:i:s'),
            ])
            ->assertRedirect(route('inventory.transactions.index'));

        $this->assertDatabaseHas('inventory_transactions', [
            'part_id' => $part->part_id,
            'transaction_type' => 'ADJUSTMENT',
            'qty_delta' => -3,
            'qty_after' => 7,
        ]);
    }

    public function test_update_transaction_metadata_only_and_sets_performed_by_to_editor(): void
    {
        $creator = User::factory()->create();
        $editor = User::factory()->create();
        $supplier = Supplier::factory()->create();
        $otherSupplier = Supplier::factory()->create();
        $part = Part::factory()->create();
        $inventory = Inventory::factory()->create([
            'part_id' => $part->part_id,
            'quantity_on_hand' => 10,
        ]);
        $transaction = InventoryTransaction::factory()->create([
            'part_id' => $part->part_id,
            'supplier_id' => $supplier->id,
            'performed_by' => $creator->id,
            'transaction_type' => 'SALE',
            'qty_delta' => -2,
            'qty_after' => 8,
            'unit_cost' => '1.00',
            'notes' => 'Original note',
        ]);

        $this->actingAs($editor)
            ->patch(route('inventory.transactions.update', $transaction), [
                'unit_cost' => 4.50,
                'supplier_id' => $otherSupplier->id,
                'notes' => 'Updated note',
                'qty_delta' => 99,
                'transaction_type' => 'RESTOCK',
            ])
            ->assertRedirect(route('inventory.transactions.show', $transaction));

        $transaction->refresh();
        $inventory->refresh();

        $this->assertSame($editor->id, $transaction->performed_by);
        $this->assertEquals(4.5, (float) $transaction->unit_cost);
        $this->assertSame($otherSupplier->id, $transaction->supplier_id);
        $this->assertSame('Updated note', $transaction->notes);
        $this->assertSame(-2, $transaction->qty_delta);
        $this->assertSame(8, $transaction->qty_after);
        $this->assertSame('SALE', $transaction->transaction_type->value);
        $this->assertSame(10, $inventory->quantity_on_hand);
    }

    public function test_authenticated_user_can_view_transactions_edit(): void
    {
        $user = User::factory()->create();
        $transaction = InventoryTransaction::factory()->create();

        $this->actingAs($user)
            ->get(route('inventory.transactions.edit', $transaction))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('inventory/transactions/edit')
                ->has('transaction')
                ->has('suppliers'));
    }

    public function test_parts_search_returns_json_list(): void
    {
        $user = User::factory()->create();
        $part = Part::factory()->create(['part_name' => 'Unique Bolt']);
        Inventory::factory()->create([
            'part_id' => $part->part_id,
            'quantity_on_hand' => 7,
        ]);

        $this->actingAs($user)
            ->getJson(route('inventory.parts.search', ['q' => 'Unique']))
            ->assertOk()
            ->assertJsonFragment([
                'part_id' => $part->part_id,
                'part_name' => 'Unique Bolt',
                'supplier_id' => $part->supplier_id,
                'quantity_on_hand' => 7,
            ]);
    }

    public function test_authenticated_user_can_view_transactions_index(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('inventory.transactions.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('inventory/transactions/index')
                ->has('transactions')
                ->has('parts')
                ->has('filters'));
    }

    public function test_authenticated_user_can_view_transactions_create(): void
    {
        $user = User::factory()->create();
        $part = Part::factory()->create();

        $this->actingAs($user)
            ->get(route('inventory.transactions.create', [
                'part_id' => $part->part_id,
                'transaction_type' => 'RESTOCK',
            ]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('inventory/transactions/create')
                ->where('preselected.part_id', $part->part_id)
                ->where('preselected.transaction_type', 'RESTOCK'));
    }

    public function test_inventory_routes_are_registered(): void
    {
        $router = app('router');

        $this->assertTrue($router->has('inventory.dashboard'));
        $this->assertTrue($router->has('inventory.adjust'));
        $this->assertTrue($router->has('inventory.parts.search'));
        $this->assertTrue($router->has('inventory.parts.index'));
        $this->assertTrue($router->has('inventory.transactions.index'));
        $this->assertTrue($router->has('inventory.transactions.create'));
        $this->assertTrue($router->has('inventory.transactions.store'));
        $this->assertTrue($router->has('inventory.transactions.edit'));
        $this->assertTrue($router->has('inventory.transactions.update'));
        $this->assertFalse($router->has('inventory.transactions.destroy'));
    }

    public function test_inventory_seeder_creates_parts_with_inventory_and_transactions(): void
    {
        $this->seed(InventorySeeder::class);

        $this->assertSame(30, Part::query()->count());
        $this->assertSame(30, Inventory::query()->count());
        $this->assertGreaterThanOrEqual(150, InventoryTransaction::query()->count());
    }
}
