<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'LandingPages/index')->name('home');
Route::inertia('/overview', 'LandingPages/overview')->name('landing.overview');
Route::inertia('/contact', 'LandingPages/contact')->name('landing.contact');
Route::inertia('/demo', 'LandingPages/demo')->name('landing.demo');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
