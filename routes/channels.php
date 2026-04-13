<?php

use App\Models\User;
use App\Support\DataImportCache;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('data-import.{importId}', function (User $user, string $importId) {
    $data = DataImportCache::get($user->id, $importId);
    if ($data === null) {
        return false;
    }

    return (int) ($data['user_id'] ?? 0) === $user->id;
});
