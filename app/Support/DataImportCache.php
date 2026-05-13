<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

final class DataImportCache
{
    public const TTL_SECONDS = 86400;

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function put(int|string $userId, string $importId, array $payload): void
    {
        Cache::put(self::key($userId, $importId), $payload, self::TTL_SECONDS);
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function get(int|string $userId, string $importId): ?array
    {
        $data = Cache::get(self::key($userId, $importId));

        return is_array($data) ? $data : null;
    }

    public static function key(int|string $userId, string $importId): string
    {
        return 'data_import:'.(string) $userId.':'.$importId;
    }
}
