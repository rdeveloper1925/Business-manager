<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Services\DataLoad\CustomerLoadService;
use App\Support\DataImportCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DataLoaderController extends Controller
{
    public function __construct(
        private CustomerLoadService $customerLoadService,
    ) {}

    /**
     * Inertia page: customer CSV import UI.
     */
    public function customersPage(): Response
    {
        $this->authorize('create', Customer::class);

        return Inertia::render('data-load/customers');
    }

    public function customersTemplate(): StreamedResponse
    {
        $this->authorize('create', Customer::class);

        return $this->customerLoadService->generateDataStructureTemplate();
    }

    public function customersUpload(Request $request): JsonResponse
    {
        $this->authorize('create', Customer::class);

        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ]);

        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        $importId = (string) Str::uuid();
        $relativePath = $request->file('file')->storeAs('tmp/imports', $importId.'.csv', 'local');
        $absolutePath = Storage::disk('local')->path($relativePath);

        DataImportCache::put($user->id, $importId, [
            'user_id' => $user->id,
            'status' => 'pending',
            'progress' => 0,
            'processed' => 0,
            'total' => 0,
            'rows_loaded' => 0,
            'message' => null,
        ]);

        try {
            $this->customerLoadService->startImport($absolutePath, $importId, $user->id);
        } catch (ValidationException $e) {
            Storage::disk('local')->delete($relativePath);
            throw $e;
        }

        return response()->json(['import_id' => $importId]);
    }

    public function status(Request $request, string $importId): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        $data = DataImportCache::get($user->id, $importId);
        if ($data === null || (int) ($data['user_id'] ?? 0) !== $user->id) {
            abort(403);
        }

        return response()->json([
            'status' => $data['status'],
            'progress' => (int) ($data['progress'] ?? 0),
            'processed' => (int) ($data['processed'] ?? 0),
            'total' => (int) ($data['total'] ?? 0),
            'rows_loaded' => (int) ($data['rows_loaded'] ?? 0),
            'message' => $data['message'] ?? null,
        ]);
    }
}
