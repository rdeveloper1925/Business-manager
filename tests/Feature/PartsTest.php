<?php

namespace Tests\Feature;

use App\Enums\PartDesignation;
use App\Models\Parts;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PartsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_persists_a_part_with_auto_incrementing_id(): void
    {
        $user = User::factory()->create();
        $part = Parts::factory()->for($user, 'creator')->create([
            'part_number' => 'PN-001',
            'part_name' => 'Widget',
            'designation' => PartDesignation::Oem,
        ]);

        $this->assertDatabaseHas('parts', [
            'id' => 1,
            'part_number' => 'PN-001',
            'part_name' => 'Widget',
            'designation' => 'oem',
            'deleted_at' => null,
        ]);

        $this->assertSame('id', $part->getKeyName());
        $this->assertSame(1, $part->id);
    }

    public function test_guests_are_redirected_from_parts_index(): void
    {
        $this->get(route('inventory.parts.index'))->assertRedirect();
    }

    public function test_parts_index_paginates_ten_per_page_and_exposes_filters(): void
    {
        $user = User::factory()->create();
        Parts::factory()->count(11)->for($user, 'creator')->create();

        $this->actingAs($user)
            ->get(route('inventory.parts.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Inventory/parts-index')
                ->has('parts.data', 10)
                ->where('parts.per_page', 10)
                ->where('parts.total', 11)
                ->where('filters.sort', 'part_number')
                ->where('filters.direction', 'asc')
                ->where('filters.search', '')
                ->where('profilePart', null)
                ->where('editPart', null));
    }

    public function test_parts_index_with_view_includes_profile_part(): void
    {
        $user = User::factory()->create();
        $part = Parts::factory()->for($user, 'creator')->create([
            'part_number' => 'VIEW-1',
            'part_name' => 'Modal Part',
        ]);

        $this->actingAs($user)
            ->get(route('inventory.parts.index', ['view' => $part->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('profilePart.id', $part->id)
                ->where('profilePart.part_number', 'VIEW-1')
                ->where('profilePart.part_name', 'Modal Part')
                ->where('editPart', null));
    }

    public function test_parts_index_with_edit_includes_edit_part(): void
    {
        $user = User::factory()->create();
        $part = Parts::factory()->for($user, 'creator')->create([
            'part_number' => 'EDIT-1',
            'part_name' => 'Edit Modal Part',
        ]);

        $this->actingAs($user)
            ->get(route('inventory.parts.index', ['edit' => $part->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('editPart.id', $part->id)
                ->where('editPart.part_number', 'EDIT-1')
                ->where('editPart.part_name', 'Edit Modal Part'));
    }

    public function test_parts_index_search_filters_catalog_fields(): void
    {
        $user = User::factory()->create();
        Parts::factory()->for($user, 'creator')->create([
            'part_number' => 'KEEP-001',
            'part_name' => 'Keep Me',
        ]);
        Parts::factory()->for($user, 'creator')->create([
            'part_number' => 'OTHER-002',
            'part_name' => 'Findme Bearing',
        ]);

        $this->actingAs($user)
            ->get(route('inventory.parts.index', ['search' => 'findme']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('parts.data', 1)
                ->where('parts.data.0.part_name', 'Findme Bearing')
                ->where('filters.search', 'findme'));
    }

    public function test_parts_index_sorts_by_column_and_direction(): void
    {
        $user = User::factory()->create();
        Parts::factory()->for($user, 'creator')->create(['part_number' => 'ZZZ', 'part_name' => 'Zebra']);
        Parts::factory()->for($user, 'creator')->create(['part_number' => 'AAA', 'part_name' => 'Alpha']);

        $this->actingAs($user)
            ->get(route('inventory.parts.index', ['sort' => 'part_number', 'direction' => 'asc']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('parts.data.0.part_number', 'AAA'));

        $this->actingAs($user)
            ->get(route('inventory.parts.index', ['sort' => 'part_number', 'direction' => 'desc']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('parts.data.0.part_number', 'ZZZ'));
    }

    public function test_authenticated_user_can_list_store_show_update_and_soft_delete_parts(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('inventory.parts.index'))
            ->assertOk();

        $response = $this->actingAs($user)
            ->post(route('inventory.parts.store'), [
                'part_number' => 'CRUD-001',
                'part_name' => 'Pat Example Part',
                'unit_of_measure' => 'ea',
                'description' => 'Test description',
                'car_make' => 'Ford',
                'car_model' => 'F-150',
                'car_year' => 2020,
                'designation' => 'oem',
                'supplier' => 'Acme Supply',
                'alternatives' => 'ALT-1,ALT-2',
                'market_price' => '99.50',
            ]);

        $part = Parts::query()->where('part_number', 'CRUD-001')->firstOrFail();

        $response->assertRedirect(route('inventory.parts.index', ['view' => $part->id]));

        $this->assertSame($user->id, $part->created_by);

        $this->actingAs($user)
            ->get(route('inventory.parts.show', $part))
            ->assertRedirect(route('inventory.parts.index', ['view' => $part->id]));

        $this->actingAs($user)
            ->patch(route('inventory.parts.update', $part), [
                'part_number' => 'CRUD-001',
                'part_name' => 'Pat Updated Part',
                'unit_of_measure' => 'box',
                'description' => 'Updated',
                'car_make' => 'Toyota',
                'car_model' => 'Camry',
                'car_year' => 2021,
                'designation' => 'aftermarket',
                'supplier' => 'Beta Supply',
                'alternatives' => 'ALT-9',
                'market_price' => '120.00',
            ])
            ->assertRedirect(route('inventory.parts.index', ['view' => $part->id]));

        $part->refresh();
        $this->assertSame('Pat Updated Part', $part->part_name);
        $this->assertSame(PartDesignation::Aftermarket, $part->designation);
        $this->assertSame('Beta Supply', $part->supplier);

        $this->actingAs($user)
            ->delete(route('inventory.parts.destroy', $part))
            ->assertRedirect(route('inventory.parts.index'));

        $this->assertSoftDeleted('parts', [
            'id' => $part->id,
        ]);
    }

    public function test_store_rejects_duplicate_part_number(): void
    {
        $user = User::factory()->create();
        Parts::factory()->for($user, 'creator')->create(['part_number' => 'DUP-1']);

        $this->actingAs($user)
            ->post(route('inventory.parts.store'), [
                'part_number' => 'DUP-1',
                'part_name' => 'Duplicate',
                'unit_of_measure' => 'ea',
                'designation' => 'oem',
            ])
            ->assertSessionHasErrors('part_number');
    }
}
