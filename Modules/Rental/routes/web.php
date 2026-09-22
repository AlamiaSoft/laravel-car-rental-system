<?php

use Illuminate\Support\Facades\Route;
use Modules\Rental\Http\Controllers\BookingController;
use Modules\Rental\Http\Controllers\BookingRequestController;
use Modules\Rental\Http\Controllers\ClientController;
use Modules\Rental\Http\Controllers\DriverController;
use Modules\Rental\Http\Controllers\MaintenanceController;
use Modules\Rental\Http\Controllers\RentalDashboardController;
use Modules\Rental\Http\Controllers\RentalPaymentController;
use Modules\Rental\Http\Controllers\ThirdPartyVendorController;
use Modules\Rental\Http\Controllers\VehicleController;

Route::middleware(['auth', 'verified'])->prefix('rental')->name('rental.')->group(function () {
    Route::get('dashboard', [RentalDashboardController::class, 'index'])->name('dashboard');

    // Fleet & Maintenance capability group
    Route::middleware('capability:fleet')->group(function () {
        Route::get('vehicles/available', [VehicleController::class, 'available'])->name('vehicles.available');
        Route::resource('vehicles', VehicleController::class)->except(['create', 'show', 'edit']);
        Route::resource('vendors', ThirdPartyVendorController::class)->except(['create', 'show', 'edit']);

        Route::get('maintenance', [MaintenanceController::class, 'index'])->name('maintenance.index');
        Route::post('maintenance', [MaintenanceController::class, 'store'])->name('maintenance.store');
        Route::post('maintenance/scan', [MaintenanceController::class, 'scan'])->name('maintenance.scan');
    });

    // Rentals & Bookings capability group
    Route::middleware('capability:rentals')->group(function () {
        Route::get('drivers/available', [DriverController::class, 'available'])->name('drivers.available');
        Route::resource('drivers', DriverController::class)->except(['create', 'show', 'edit']);
        Route::resource('clients', ClientController::class)->except(['create', 'show', 'edit']);

        Route::resource('bookings', BookingController::class);
        Route::post('bookings/{booking}/pickup', [BookingController::class, 'pickup'])->name('bookings.pickup');
        Route::post('bookings/{booking}/dropoff', [BookingController::class, 'dropoff'])->name('bookings.dropoff');
        Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');

        Route::post('payments', [RentalPaymentController::class, 'store'])->name('payments.store');
        Route::patch('payments/{payment}', [RentalPaymentController::class, 'update'])->name('payments.update');

        Route::get('requests', [BookingRequestController::class, 'index'])->name('requests.index');
        Route::post('requests/simulate', [BookingRequestController::class, 'simulate'])->name('requests.simulate');
        Route::post('requests/{bookingRequest}/rematch', [BookingRequestController::class, 'rematch'])->name('requests.rematch');
        Route::post('requests/{bookingRequest}/convert', [BookingRequestController::class, 'convert'])->name('requests.convert');
        Route::post('requests/{bookingRequest}/reject', [BookingRequestController::class, 'reject'])->name('requests.reject');
    });
});
