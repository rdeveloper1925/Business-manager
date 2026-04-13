<?php

namespace Tests\Feature\DataLoad;

use App\Events\DataLoad\DataImportProgressUpdated;
use App\Jobs\LoadCustomersFromCsvJob;
use App\Models\User;
use App\Services\DataLoad\CustomerLoadService;
use App\Support\DataImportCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CustomerDataLoadTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_download_customer_csv_template(): void
    {
        $this->get(route('data-load.customers.template'))
            ->assertRedirect();
    }

    public function test_authenticated_user_can_download_customer_csv_template(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get(route('data-load.customers.template'));

        $response->assertOk();
        $response->assertHeaderContains('content-type', 'text/csv');

        $body = trim((string) $response->streamedContent());
        $firstLine = explode("\n", $body, 2)[0];
        $this->assertSame(
            implode(',', CustomerLoadService::expectedHeaders()),
            $firstLine,
        );
    }

    public function test_upload_rejects_invalid_headers_and_removes_temp_file(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        Storage::disk('local')->deleteDirectory('tmp/imports');
        Storage::disk('local')->makeDirectory('tmp/imports');

        $csv = "wrong,headers\na,b";
        $file = UploadedFile::fake()->createWithContent('bad.csv', $csv);

        $this->actingAs($user)
            ->postJson(route('data-load.customers.upload'), [
                'file' => $file,
            ])
            ->assertUnprocessable();

        Queue::assertNothingPushed();
        $this->assertSame(
            [],
            Storage::disk('local')->files('tmp/imports'),
        );
    }

    public function test_valid_upload_dispatches_import_job(): void
    {
        Queue::fake();
        Event::fake([DataImportProgressUpdated::class]);

        $user = User::factory()->create();

        $headers = implode(',', CustomerLoadService::expectedHeaders());
        $csv = $headers."\nJane Doe,Acme,United States,(555)-555-5555,jane@example.com,123 Main St,";
        $file = UploadedFile::fake()->createWithContent('good.csv', $csv);

        $response = $this->actingAs($user)
            ->postJson(route('data-load.customers.upload'), [
                'file' => $file,
            ]);

        $response->assertOk()
            ->assertJsonStructure(['import_id']);

        Queue::assertPushed(LoadCustomersFromCsvJob::class, function (LoadCustomersFromCsvJob $job) use ($response): bool {
            return $job->importId === $response->json('import_id');
        });

        Event::assertDispatched(DataImportProgressUpdated::class, function (DataImportProgressUpdated $e) use ($response): bool {
            return $e->importId === $response->json('import_id')
                && $e->state['status'] === 'pending';
        });

        $importId = $response->json('import_id');
        Storage::disk('local')->delete('tmp/imports/'.$importId.'.csv');
    }

    public function test_sync_import_inserts_customers_and_deletes_temp_file(): void
    {
        $user = User::factory()->create();

        $headers = implode(',', CustomerLoadService::expectedHeaders());
        $csv = $headers."\nJane Doe,Acme,United States,(555)-555-5555,jane@example.com,123 Main St,";
        $file = UploadedFile::fake()->createWithContent('good.csv', $csv);

        $response = $this->actingAs($user)
            ->postJson(route('data-load.customers.upload'), [
                'file' => $file,
            ]);

        $response->assertOk();
        $importId = $response->json('import_id');

        $this->assertDatabaseHas('customers', [
            'email' => 'jane@example.com',
            'full_name' => 'Jane Doe',
        ]);

        $this->assertFalse(
            Storage::disk('local')->exists('tmp/imports/'.$importId.'.csv'),
        );
    }

    public function test_status_returns_forbidden_for_another_users_import(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $importId = (string) Str::uuid();

        DataImportCache::put($userA->id, $importId, [
            'user_id' => $userA->id,
            'status' => 'pending',
            'progress' => 0,
            'processed' => 0,
            'total' => 0,
            'rows_loaded' => 0,
            'message' => null,
        ]);

        $this->actingAs($userB)
            ->getJson(route('data-load.status', ['importId' => $importId]))
            ->assertForbidden();
    }

    public function test_customers_data_load_page_renders_inertia(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('data-load.customers'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('data-load/customers'));
    }
}
