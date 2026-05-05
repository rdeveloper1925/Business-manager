<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_persists_a_customer_with_auto_incrementing_customer_id(): void
    {
        $customer = Customer::factory()->create([
            'full_name' => 'Jane Doe',
            'email' => 'jane@example.com',
        ]);

        $this->assertDatabaseHas('customers', [
            'customer_id' => 1,
            'full_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'deleted_at' => null,
        ]);

        $this->assertSame('customer_id', $customer->getKeyName());
        $this->assertSame(1, $customer->customer_id);
    }

    public function test_guests_are_redirected_from_customers_index(): void
    {
        $this->get(route('customers.index'))->assertRedirect();
    }

    public function test_customers_index_paginates_ten_per_page_and_exposes_filters(): void
    {
        $user = User::factory()->create();
        Customer::factory()->count(11)->create();

        $this->actingAs($user)
            ->get(route('customers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('customers/index')
                ->has('customers.data', 10)
                ->where('customers.per_page', 10)
                ->where('customers.total', 11)
                ->where('filters.sort', 'full_name')
                ->where('filters.direction', 'asc')
                ->where('filters.search', '')
                ->where('profileCustomer', null)
                ->where('editCustomer', null));
    }

    public function test_customers_index_with_view_includes_profile_customer(): void
    {
        $user = User::factory()->create();
        $customer = Customer::factory()->create([
            'full_name' => 'Modal Person',
            'email' => 'modal@example.com',
        ]);

        $this->actingAs($user)
            ->get(route('customers.index', ['view' => $customer->customer_id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('profileCustomer.customer_id', $customer->customer_id)
                ->where('profileCustomer.full_name', 'Modal Person')
                ->where('profileCustomer.email', 'modal@example.com')
                ->where('editCustomer', null));
    }

    public function test_customers_index_with_edit_includes_edit_customer(): void
    {
        $user = User::factory()->create();
        $customer = Customer::factory()->create([
            'full_name' => 'Edit Modal Person',
            'email' => 'editmodal@example.com',
        ]);

        $this->actingAs($user)
            ->get(route('customers.index', ['edit' => $customer->customer_id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('editCustomer.customer_id', $customer->customer_id)
                ->where('editCustomer.full_name', 'Edit Modal Person')
                ->where('editCustomer.email', 'editmodal@example.com'));
    }

    public function test_customers_index_search_filters_by_name_phone_or_email(): void
    {
        $user = User::factory()->create();
        Customer::factory()->create([
            'full_name' => 'Keep Me',
            'phone_number' => '(555)-000-0001',
            'phone_country_name' => 'United States',
            'email' => 'keep@example.com',
        ]);
        Customer::factory()->create([
            'full_name' => 'Other Person',
            'phone_number' => '(555)-999-9999',
            'phone_country_name' => 'United States',
            'email' => 'findme@example.com',
        ]);

        $this->actingAs($user)
            ->get(route('customers.index', ['search' => 'findme']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('customers.data', 1)
                ->where('customers.data.0.email', 'findme@example.com')
                ->where('filters.search', 'findme'));
    }

    public function test_customers_index_sorts_by_column_and_direction(): void
    {
        $user = User::factory()->create();
        Customer::factory()->create(['full_name' => 'Zebra LLC', 'email' => 'z@example.com']);
        Customer::factory()->create(['full_name' => 'Alpha Co', 'email' => 'a@example.com']);

        $this->actingAs($user)
            ->get(route('customers.index', ['sort' => 'full_name', 'direction' => 'asc']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('customers.data.0.full_name', 'Alpha Co'));

        $this->actingAs($user)
            ->get(route('customers.index', ['sort' => 'full_name', 'direction' => 'desc']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('customers.data.0.full_name', 'Zebra LLC'));
    }

    public function test_authenticated_user_can_list_store_show_update_and_soft_delete_customers(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('customers.index'))
            ->assertOk();

        $response = $this->actingAs($user)
            ->post(route('customers.store'), [
                'full_name' => 'Pat Example',
                'organization_name' => 'Acme Inc',
                'phone_country_name' => 'United States',
                'phone_number' => '(555)-010-0100',
                'email' => 'pat@example.com',
                'address' => '1 Main St',
                'tax_id' => '12-3456789',
            ]);

        $customer = Customer::query()->where('email', 'pat@example.com')->firstOrFail();

        $response->assertRedirect(route('customers.index', ['view' => $customer->customer_id]));

        $this->actingAs($user)
            ->get(route('customers.show', $customer))
            ->assertRedirect(route('customers.index', ['view' => $customer->customer_id]));

        $this->actingAs($user)
            ->patch(route('customers.update', $customer), [
                'full_name' => 'Pat Updated',
                'organization_name' => 'Acme Inc',
                'phone_country_name' => 'United Kingdom',
                'phone_number' => '07700 900123',
                'email' => 'pat@example.com',
                'address' => '2 Oak Ave',
                'tax_id' => '12-3456789',
            ])
            ->assertRedirect(route('customers.index', ['view' => $customer->customer_id]));

        $customer->refresh();
        $this->assertSame('Pat Updated', $customer->full_name);
        $this->assertSame('2 Oak Ave', $customer->address);
        $this->assertSame('United Kingdom', $customer->phone_country_name);
        $this->assertSame('07700 900123', $customer->phone_number);

        $this->actingAs($user)
            ->delete(route('customers.destroy', $customer))
            ->assertRedirect(route('customers.index'));

        $this->assertSoftDeleted('customers', [
            'customer_id' => $customer->customer_id,
        ]);
    }

    public function test_store_accepts_free_form_phone_number(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('customers.store'), [
                'full_name' => 'Free Form Phone',
                'organization_name' => null,
                'phone_country_name' => 'United States',
                'phone_number' => '555-010-0100',
                'email' => 'freeformphone@example.com',
                'address' => '1 Main St',
                'tax_id' => null,
            ]);

        $customer = Customer::where('email', 'freeformphone@example.com')->firstOrFail();

        $response->assertRedirect(route('customers.index', ['view' => $customer->customer_id]));

        $this->assertDatabaseHas('customers', [
            'email' => 'freeformphone@example.com',
            'phone_number' => '555-010-0100',
        ]);
    }

    public function test_store_rejects_unknown_phone_country_name(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('customers.store'), [
                'full_name' => 'Bad Country',
                'organization_name' => null,
                'phone_country_name' => 'Atlantis',
                'phone_number' => '(555)-010-0100',
                'email' => 'badcountry@example.com',
                'address' => '1 Main St',
                'tax_id' => null,
            ])
            ->assertSessionHasErrors('phone_country_name');
    }

    public function test_store_accepts_short_phone_as_plain_text(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('customers.store'), [
                'full_name' => 'Short Intl',
                'organization_name' => null,
                'phone_country_name' => 'United Kingdom',
                'phone_number' => '12345',
                'email' => 'shortintl@example.com',
                'address' => '1 Main St',
                'tax_id' => null,
            ]);

        $customer = Customer::where('email', 'shortintl@example.com')->firstOrFail();

        $response->assertRedirect(route('customers.index', ['view' => $customer->customer_id]));

        $this->assertDatabaseHas('customers', [
            'email' => 'shortintl@example.com',
            'phone_number' => '12345',
        ]);
    }
}
