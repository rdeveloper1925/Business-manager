<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DataLoaderController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'LandingPages/index')->name('home');
Route::inertia('/overview', 'LandingPages/overview')->name('landing.overview');
Route::inertia('/contact', 'LandingPages/contact')->name('landing.contact');
Route::inertia('/demo', 'LandingPages/demo')->name('landing.demo');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('customers', CustomerController::class)->except(['create', 'edit']);
    Route::resource('suppliers', SupplierController::class);

    Route::get('data-load/customers', [DataLoaderController::class, 'customersPage'])->name('data-load.customers');
    Route::get('data-load/customers/template', [DataLoaderController::class, 'customersTemplate'])->name('data-load.customers.template');
    Route::post('data-load/customers', [DataLoaderController::class, 'customersUpload'])->name('data-load.customers.upload');
    Route::get('data-load/suppliers', [DataLoaderController::class, 'suppliersPage'])->name('data-load.suppliers');
    Route::get('data-load/suppliers/template', [DataLoaderController::class, 'suppliersTemplate'])->name('data-load.suppliers.template');
    Route::post('data-load/suppliers', [DataLoaderController::class, 'suppliersUpload'])->name('data-load.suppliers.upload');
    Route::get('data-load/status/{importId}', [DataLoaderController::class, 'status'])->name('data-load.status');
});

require __DIR__.'/settings.php';
