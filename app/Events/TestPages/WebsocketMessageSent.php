<?php

namespace App\Events\TestPages;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WebsocketMessageSent implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  array{message: string, sent_at: string, sender: string}  $payload
     */
    public function __construct(public array $payload) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('tests.ws'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'tests.ws.message';
    }

    /**
     * @return array{message: string, sent_at: string, sender: string}
     */
    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
