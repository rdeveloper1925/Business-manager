<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DataLoaderController;
use App\Http\Controllers\TestPages\WebsocketTestController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'LandingPages/index')->name('home');
Route::inertia('/overview', 'LandingPages/overview')->name('landing.overview');
Route::inertia('/contact', 'LandingPages/contact')->name('landing.contact');
Route::inertia('/demo', 'LandingPages/demo')->name('landing.demo');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('customers', CustomerController::class)->except(['create', 'edit']);

    Route::get('data-load/customers', [DataLoaderController::class, 'customersPage'])->name('data-load.customers');
    Route::get('data-load/customers/template', [DataLoaderController::class, 'customersTemplate'])->name('data-load.customers.template');
    Route::post('data-load/customers', [DataLoaderController::class, 'customersUpload'])->name('data-load.customers.upload');
    Route::get('data-load/status/{importId}', [DataLoaderController::class, 'status'])->name('data-load.status');

    Route::get('tests/ws', [WebsocketTestController::class, 'show'])->name('tests.ws');
    Route::post('tests/ws/emit', [WebsocketTestController::class, 'emit'])->name('tests.ws.emit');
});

require __DIR__.'/settings.php';
