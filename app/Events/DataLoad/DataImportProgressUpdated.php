<?php

namespace App\Events\DataLoad;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DataImportProgressUpdated implements ShouldBroadcast, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $broadcastQueue = 'broadcasts';

    /**
     * @param  array{user_id: int|string, status: string, progress: int, processed: int, total: int, rows_loaded: int, message: string|null}  $state
     */
    public function __construct(
        public int|string $userId,
        public string $importId,
        public array $state,
    ) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('data-import.'.$this->importId)];
    }

    public function broadcastAs(): string
    {
        return 'data-import.progress';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'import_id' => $this->importId,
            'status' => $this->state['status'],
            'progress' => (int) $this->state['progress'],
            'processed' => (int) $this->state['processed'],
            'total' => (int) $this->state['total'],
            'rows_loaded' => (int) $this->state['rows_loaded'],
            'message' => $this->state['message'] ?? null,
        ];
    }
}
