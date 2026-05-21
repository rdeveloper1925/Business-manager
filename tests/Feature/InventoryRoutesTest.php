<?php

namespace Tests\Feature;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\Part;
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

    public function test_store_transaction_rejects_positive_sale_delta(): void
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
            ->assertSessionHasErrors('qty_delta');
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
