<?php

namespace Tests\Feature\Broadcasting;

use App\Broadcasting\DataImportProgressNotifier;
use App\Events\DataLoad\DataImportProgressUpdated;
use App\Models\User;
use App\Support\DataImportCache;
use Illuminate\Broadcasting\BroadcastManager;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Tests\TestCase;

class DataImportChannelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // phpunit.xml sets BROADCAST_CONNECTION=null; channel authorization requires a Pusher-compatible broadcaster.
        config([
            'broadcasting.default' => 'reverb',
            'broadcasting.connections.reverb.key' => 'test-key',
            'broadcasting.connections.reverb.secret' => 'test-secret',
            'broadcasting.connections.reverb.app_id' => 'test-id',
            'broadcasting.connections.reverb.options' => [
                'host' => 'localhost',
                'port' => 8080,
                'scheme' => 'http',
                'useTLS' => false,
            ],
        ]);

        $this->app->make(BroadcastManager::class)->forgetDrivers();
        require base_path('routes/channels.php');
    }

    public function test_notifier_persists_and_dispatches_progress_event(): void
    {
        Event::fake([DataImportProgressUpdated::class]);

        $user = User::factory()->create();
        $importId = (string) Str::uuid();
        $state = [
            'user_id' => $user->id,
            'status' => 'pending',
            'progress' => 0,
            'processed' => 0,
            'total' => 0,
            'rows_loaded' => 0,
            'message' => null,
        ];

        DataImportProgressNotifier::notify($user->id, $importId, $state);

        $this->assertSame($state, DataImportCache::get($user->id, $importId));

        Event::assertDispatched(DataImportProgressUpdated::class, function (DataImportProgressUpdated $e) use ($user, $importId, $state): bool {
            return $e->userId === $user->id
                && $e->importId === $importId
                && $e->state === $state;
        });
    }

    public function test_notifier_can_skip_broadcast_while_persisting_cache(): void
    {
        Event::fake([DataImportProgressUpdated::class]);

        $user = User::factory()->create();
        $importId = (string) Str::uuid();
        $state = [
            'user_id' => $user->id,
            'status' => 'processing',
            'progress' => 50,
            'processed' => 5,
            'total' => 10,
            'rows_loaded' => 5,
            'message' => null,
        ];

        DataImportProgressNotifier::notify($user->id, $importId, $state, broadcast: false);

        $this->assertSame($state, DataImportCache::get($user->id, $importId));
        Event::assertNotDispatched(DataImportProgressUpdated::class);
    }

    public function test_progress_event_rescues_failed_broadcasts_so_http_requests_do_not_500(): void
    {
        $event = new DataImportProgressUpdated(1, '00000000-0000-0000-0000-000000000001', [
            'user_id' => 1,
            'status' => 'pending',
            'progress' => 0,
            'processed' => 0,
            'total' => 0,
            'rows_loaded' => 0,
            'message' => null,
        ]);

        $this->assertInstanceOf(ShouldRescue::class, $event);
    }

    public function test_user_can_authenticate_private_data_import_channel_when_import_exists(): void
    {
        $user = User::factory()->create();
        $importId = (string) Str::uuid();

        DataImportCache::put($user->id, $importId, [
            'user_id' => $user->id,
            'status' => 'pending',
            'progress' => 0,
            'processed' => 0,
            'total' => 0,
            'rows_loaded' => 0,
            'message' => null,
        ]);

        $this->actingAs($user)
            ->postJson('/broadcasting/auth', [
                'socket_id' => '1.1',
                'channel_name' => 'private-data-import.'.$importId,
            ])
            ->assertOk()
            ->assertJsonStructure(['auth']);
    }

    public function test_user_cannot_authenticate_private_data_import_channel_without_cache_entry(): void
    {
        $user = User::factory()->create();
        $importId = (string) Str::uuid();

        $this->actingAs($user)
            ->postJson('/broadcasting/auth', [
                'socket_id' => '1.1',
                'channel_name' => 'private-data-import.'.$importId,
            ])
            ->assertForbidden();
    }

    public function test_user_cannot_authenticate_private_data_import_channel_owned_by_another_user(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $importId = (string) Str::uuid();

        DataImportCache::put($owner->id, $importId, [
            'user_id' => $owner->id,
            'status' => 'pending',
            'progress' => 0,
            'processed' => 0,
            'total' => 0,
            'rows_loaded' => 0,
            'message' => null,
        ]);

        $this->actingAs($other)
            ->postJson('/broadcasting/auth', [
                'socket_id' => '1.1',
                'channel_name' => 'private-data-import.'.$importId,
            ])
            ->assertForbidden();
    }
}
