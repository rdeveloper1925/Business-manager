<?php

namespace Tests\Feature;

use App\Enums\SupplierCategory;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SupplierTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_persists_a_supplier_with_uuid_primary_key(): void
    {
        $supplier = Supplier::factory()->create([
            'contact_person_name' => 'Jane Doe',
            'company_name' => 'Acme Parts',
            'email' => 'jane@example.com',
        ]);

        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'contact_person_name' => 'Jane Doe',
            'company_name' => 'Acme Parts',
            'email' => 'jane@example.com',
            'deleted_at' => null,
        ]);

        $this->assertSame('id', $supplier->getKeyName());
        $this->assertIsString($supplier->id);
    }

    public function test_guests_are_redirected_from_suppliers_routes(): void
    {
        $supplier = Supplier::factory()->create();

        $this->get(route('suppliers.index'))->assertRedirect();
        $this->get(route('suppliers.create'))->assertRedirect();
        $this->post(route('suppliers.store'), [])->assertRedirect();
        $this->get(route('suppliers.show', $supplier))->assertRedirect();
        $this->get(route('suppliers.edit', $supplier))->assertRedirect();
        $this->patch(route('suppliers.update', $supplier), [])->assertRedirect();
        $this->delete(route('suppliers.destroy', $supplier))->assertRedirect();
    }

    public function test_suppliers_index_paginates_ten_per_page_and_exposes_filters(): void
    {
        $user = User::factory()->create();
        Supplier::factory()->count(11)->create();

        $this->actingAs($user)
            ->get(route('suppliers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('suppliers/index')
                ->has('suppliers.data', 10)
                ->where('suppliers.per_page', 10)
                ->where('suppliers.total', 11)
                ->where('filters.sort', 'contact_person_name')
                ->where('filters.direction', 'asc')
                ->where('filters.search', ''));
    }

    public function test_suppliers_index_search_filters_results(): void
    {
        $user = User::factory()->create();
        Supplier::factory()->create([
            'contact_person_name' => 'Keep Me',
            'company_name' => 'Alpha Co',
            'phone' => '555-0001',
            'email' => 'keep@example.com',
        ]);
        Supplier::factory()->create([
            'contact_person_name' => 'Other Person',
            'company_name' => 'Beta LLC',
            'phone' => '555-9999',
            'email' => 'findme@example.com',
        ]);

        $this->actingAs($user)
            ->get(route('suppliers.index', ['search' => 'findme']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('suppliers.data', 1)
                ->where('suppliers.data.0.email', 'findme@example.com')
                ->where('filters.search', 'findme'));
    }

    public function test_suppliers_index_sorts_by_column_and_direction(): void
    {
        $user = User::factory()->create();
        Supplier::factory()->create([
            'company_name' => 'Zebra Supply',
            'contact_person_name' => 'Z',
            'email' => 'z@example.com',
        ]);
        Supplier::factory()->create([
            'company_name' => 'Alpha Supply',
            'contact_person_name' => 'A',
            'email' => 'a@example.com',
        ]);

        $this->actingAs($user)
            ->get(route('suppliers.index', ['sort' => 'company_name', 'direction' => 'asc']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('suppliers.data.0.company_name', 'Alpha Supply'));

        $this->actingAs($user)
            ->get(route('suppliers.index', ['sort' => 'company_name', 'direction' => 'desc']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('suppliers.data.0.company_name', 'Zebra Supply'));
    }

    public function test_authenticated_user_can_create_view_edit_and_soft_delete_supplier(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('suppliers.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('suppliers/create_edit')
                ->where('supplier', null));

        $response = $this->actingAs($user)
            ->post(route('suppliers.store'), [
                'contact_person_name' => 'Pat Example',
                'company_name' => 'Parts Inc',
                'phone' => '(555) 010-0100',
                'email' => 'pat@example.com',
                'address' => '1 Main St',
                'category' => SupplierCategory::Oem->value,
            ]);

        $supplier = Supplier::query()->where('email', 'pat@example.com')->firstOrFail();

        $response->assertRedirect(route('suppliers.show', $supplier));

        $this->actingAs($user)
            ->get(route('suppliers.show', $supplier))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('suppliers/view')
                ->where('supplier.id', $supplier->id)
                ->where('supplier.email', 'pat@example.com'));

        $this->actingAs($user)
            ->get(route('suppliers.edit', $supplier))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('suppliers/create_edit')
                ->where('supplier.id', $supplier->id));

        $this->actingAs($user)
            ->patch(route('suppliers.update', $supplier), [
                'contact_person_name' => 'Pat Updated',
                'company_name' => 'Parts Inc',
                'phone' => '(555) 010-0101',
                'email' => 'pat@example.com',
                'address' => '2 Oak Ave',
                'category' => SupplierCategory::Aftermarket->value,
            ])
            ->assertRedirect(route('suppliers.show', $supplier));

        $supplier->refresh();
        $this->assertSame('Pat Updated', $supplier->contact_person_name);
        $this->assertSame('2 Oak Ave', $supplier->address);
        $this->assertSame(SupplierCategory::Aftermarket, $supplier->category);

        $this->actingAs($user)
            ->delete(route('suppliers.destroy', $supplier))
            ->assertRedirect(route('suppliers.index'));

        $this->assertSoftDeleted('suppliers', [
            'id' => $supplier->id,
        ]);
    }

    public function test_store_rejects_invalid_category(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('suppliers.store'), [
                'contact_person_name' => 'Bad',
                'company_name' => 'Co',
                'phone' => '1',
                'email' => 'bad@example.com',
                'address' => 'Addr',
                'category' => 'InvalidCategory',
            ])
            ->assertSessionHasErrors('category');
    }

    public function test_store_rejects_duplicate_email(): void
    {
        $user = User::factory()->create();
        Supplier::factory()->create(['email' => 'taken@example.com']);

        $this->actingAs($user)
            ->post(route('suppliers.store'), [
                'contact_person_name' => 'X',
                'company_name' => 'Y',
                'phone' => '1',
                'email' => 'taken@example.com',
                'address' => 'Addr',
                'category' => SupplierCategory::Other->value,
            ])
            ->assertSessionHasErrors('email');
    }
}
