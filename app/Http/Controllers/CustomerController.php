<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerRequests\StoreCustomerRequest;
use App\Http\Requests\CustomerRequests\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Customer::class);

        $validated = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sort' => ['sometimes', 'string', Rule::in(['full_name', 'phone_number', 'email'])],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'view' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'edit' => ['sometimes', 'nullable', 'integer', 'min:1'],
        ]);

        $search = isset($validated['search']) ? trim((string) $validated['search']) : '';
        $sort = $validated['sort'] ?? 'full_name';
        $direction = ($validated['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $query = Customer::query();

        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function ($q) use ($like) {
                $q->where('full_name', 'like', $like)
                    ->orWhere('phone_number', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });
        }

        $query->orderBy($sort, $direction);

        $profileCustomer = null;
        if ($request->filled('view')) {
            $candidate = Customer::query()->whereKey((int) $request->input('view'))->first();
            if ($candidate !== null) {
                $this->authorize('view', $candidate);
                $profileCustomer = $candidate;
            }
        }

        $editCustomer = null;
        if ($request->filled('edit')) {
            $candidate = Customer::query()->whereKey((int) $request->input('edit'))->first();
            if ($candidate !== null) {
                $this->authorize('update', $candidate);
                $editCustomer = $candidate;
            }
        }

        return Inertia::render('customers/index', [
            'customers' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'profileCustomer' => $profileCustomer,
            'editCustomer' => $editCustomer,
        ]);
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
