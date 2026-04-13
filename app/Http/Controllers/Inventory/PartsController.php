<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StorePartRequest;
use App\Http\Requests\Inventory\UpdatePartRequest;
use App\Models\Parts;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PartsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Parts::class);

        $validated = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sort' => ['sometimes', 'string', Rule::in(['part_number', 'part_name', 'market_price', 'created_at'])],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'view' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'edit' => ['sometimes', 'nullable', 'integer', 'min:1'],
        ]);

        $search = isset($validated['search']) ? trim((string) $validated['search']) : '';
        $sort = $validated['sort'] ?? 'part_number';
        $direction = ($validated['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $query = Parts::query();

        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function ($q) use ($like) {
                $q->where('part_number', 'like', $like)
                    ->orWhere('part_name', 'like', $like)
                    ->orWhere('description', 'like', $like)
                    ->orWhere('car_make', 'like', $like)
                    ->orWhere('car_model', 'like', $like)
                    ->orWhere('supplier', 'like', $like)
                    ->orWhere('alternatives', 'like', $like);
            });
        }

        $query->orderBy($sort, $direction);

        $profilePart = null;
        if ($request->filled('view')) {
            $candidate = Parts::query()->whereKey((int) $request->input('view'))->first();
            if ($candidate !== null) {
                $this->authorize('view', $candidate);
                $profilePart = $candidate;
            }
        }

        $editPart = null;
        if ($request->filled('edit')) {
            $candidate = Parts::query()->whereKey((int) $request->input('edit'))->first();
            if ($candidate !== null) {
                $this->authorize('update', $candidate);
                $editPart = $candidate;
            }
        }

        return Inertia::render('Inventory/parts-index', [
            'parts' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'profilePart' => $profilePart,
            'editPart' => $editPart,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePartRequest $request): RedirectResponse
    {
        $part = Parts::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Part created.')]);

        return redirect()->route('inventory.parts.index', [
            'view' => $part->getKey(),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Parts $part): RedirectResponse
    {
        $this->authorize('view', $part);

        return redirect()->route('inventory.parts.index', [
            'view' => $part->getKey(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePartRequest $request, Parts $part): RedirectResponse
    {
        $this->authorize('update', $part);

        $part->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Part updated.')]);

        return redirect()->route('inventory.parts.index', [
            'view' => $part->getKey(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Parts $part): RedirectResponse
    {
        $this->authorize('delete', $part);

        $part->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Part removed.')]);

        return to_route('inventory.parts.index');
    }
}
