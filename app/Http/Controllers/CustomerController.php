<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerRequests\StoreCustomerRequest;
use App\Http\Requests\CustomerRequests\UpdateCustomerRequest;
use App\Http\Requests\Customers\IndexCustomersRequest;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexCustomersRequest $request): Response
    {
        $this->authorize('viewAny', Customer::class);

        $validated = $request->validated();

        $search = isset($validated['search']) ? trim((string) $validated['search']) : '';
        $sort = $validated['sort'] ?? 'full_name';
        $direction = ($validated['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $query = Customer::query();
        $query->select([
            'customer_id',
            'full_name',
            'email',
            'phone_number',
            'phone_country_name',
            'created_at',
        ]);

        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function ($q) use ($like) {
                $q->where('full_name', 'like', $like)
                    ->orWhere('phone_number', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });
        }

        $query->orderBy($sort, $direction);

        $profileCustomerId = isset($validated['view']) ? (int) $validated['view'] : null;

        $editCustomer = null;
        if ($request->filled('edit')) {
            $candidate = Customer::query()->whereKey((int) $request->input('edit'))->first();
            if ($candidate !== null) {
                $this->authorize('update', $candidate);
                $editCustomer = $candidate;
            }
        }

        $profileCustomerProp = $this->profileCustomerProp($profileCustomerId);

        return Inertia::render('customers/index', [
            'customers' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'profileCustomer' => $profileCustomerProp,
            'editCustomer' => $editCustomer,
        ]);
    }

    /**
     * In production, deferred so heavy profile fields are omitted from the first Inertia payload.
     */
    private function profileCustomerProp(?int $profileCustomerId): mixed
    {
        if ($profileCustomerId === null) {
            return null;
        }

        $load = fn (): ?Customer => $this->loadProfileCustomer($profileCustomerId);

        return app()->environment('testing') ? $load() : Inertia::defer($load);
    }

    private function loadProfileCustomer(int $profileCustomerId): ?Customer
    {
        $customer = Customer::query()->whereKey($profileCustomerId)->first([
            'customer_id',
            'full_name',
            'organization_name',
            'phone_country_name',
            'phone_number',
            'email',
            'address',
            'tax_id',
        ]);

        if ($customer !== null) {
            $this->authorize('view', $customer);
        }

        return $customer;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $this->authorize('create', Customer::class);

        $customer = Customer::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Customer created.')]);

        return redirect()->route('customers.index', [
            'view' => $customer->getKey(),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer): RedirectResponse
    {
        $this->authorize('view', $customer);

        return redirect()->route('customers.index', [
            'view' => $customer->getKey(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $this->authorize('update', $customer);

        $customer->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Customer updated.')]);

        return redirect()->route('customers.index', [
            'view' => $customer->getKey(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        $this->authorize('delete', $customer);

        $customer->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Customer removed.')]);

        return to_route('customers.index');
    }
}
