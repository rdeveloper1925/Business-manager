<?php

namespace App\Broadcasting;

use App\Events\DataLoad\DataImportProgressUpdated;
use App\Support\DataImportCache;

final class DataImportProgressNotifier
{
    /**
     * Persist import state and optionally push it to the authenticated owner's private channel.
     *
     * @param  array{user_id: int, status: string, progress: int, processed: int, total: int, rows_loaded: int, message: string|null}  $state
     */
    public static function notify(int $userId, string $importId, array $state, bool $broadcast = true): void
    {
        DataImportCache::put($userId, $importId, $state);

        if ($broadcast) {
            event(new DataImportProgressUpdated($userId, $importId, $state));
        }
    }
}
