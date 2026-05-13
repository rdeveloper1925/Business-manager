<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierRequests\StoreSupplierRequest;
use App\Http\Requests\SupplierRequests\UpdateSupplierRequest;
use App\Http\Requests\Suppliers\IndexSuppliersRequest;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexSuppliersRequest $request): Response
    {
        $this->authorize('viewAny', Supplier::class);

        $validated = $request->validated();

        $search = isset($validated['search']) ? trim((string) $validated['search']) : '';
        $sort = $validated['sort'] ?? 'contact_person_name';
        $direction = ($validated['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $query = Supplier::query()->select([
            'id',
            'contact_person_name',
            'company_name',
            'phone',
            'email',
            'category',
            'created_at',
        ]);

        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function ($q) use ($like) {
                $q->where('contact_person_name', 'like', $like)
                    ->orWhere('company_name', 'like', $like)
                    ->orWhere('phone', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('category', 'like', $like);
            });
        }

        $query->orderBy($sort, $direction);

        return Inertia::render('suppliers/index', [
            'suppliers' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Supplier::class);

        return Inertia::render('suppliers/create_edit', [
            'supplier' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        $supplier = Supplier::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Supplier created.')]);

        return redirect()->route('suppliers.show', $supplier);
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier): Response
    {
        $this->authorize('view', $supplier);

        return Inertia::render('suppliers/view', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier): Response
    {
        $this->authorize('update', $supplier);

        return Inertia::render('suppliers/create_edit', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier): RedirectResponse
    {
        $supplier->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Supplier updated.')]);

        return redirect()->route('suppliers.show', $supplier);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier): RedirectResponse
    {
        $this->authorize('delete', $supplier);

        $supplier->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Supplier removed.')]);

        return to_route('suppliers.index');
    }
}
