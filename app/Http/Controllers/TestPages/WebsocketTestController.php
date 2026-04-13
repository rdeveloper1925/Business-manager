<?php

namespace App\Http\Controllers\TestPages;

use App\Events\TestPages\WebsocketMessageSent;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WebsocketTestController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('testPages/ws');
    }

    public function emit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:200'],
        ]);

        $user = $request->user();

        event(new WebsocketMessageSent([
            'message' => $validated['message'],
            'sent_at' => now()->toIso8601String(),
            'sender' => $user?->email ?? 'guest',
        ]));

        return response()->json([
            'ok' => true,
            'message' => 'Broadcast sent.',
        ]);
    }
}
