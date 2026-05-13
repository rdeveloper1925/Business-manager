<?php

use App\Models\User;
use App\Support\DataImportCache;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('data-import.{importId}', function (User $user, string $importId) {
    $data = DataImportCache::get($user->id, $importId);
    if ($data === null) {
        return false;
    }

    return (string) ($data['user_id'] ?? '') === (string) $user->id;
});
