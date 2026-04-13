<?php

namespace Tests\Feature\TestPages;

use App\Events\TestPages\WebsocketMessageSent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WebsocketTestPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_websocket_test_page_requires_authentication(): void
    {
        $this->get(route('tests.ws'))
            ->assertRedirect();
    }

    public function test_websocket_test_page_renders_inertia_component(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('tests.ws'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('testPages/ws'));
    }

    public function test_authenticated_user_can_emit_websocket_message(): void
    {
        Event::fake([WebsocketMessageSent::class]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('tests.ws.emit'), [
                'message' => 'Hello from test',
            ])
            ->assertOk()
            ->assertJson([
                'ok' => true,
                'message' => 'Broadcast sent.',
            ]);

        Event::assertDispatched(WebsocketMessageSent::class, function (WebsocketMessageSent $event) use ($user): bool {
            return $event->payload['message'] === 'Hello from test'
                && $event->payload['sender'] === $user->email;
        });
    }
}
