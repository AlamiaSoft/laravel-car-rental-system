<?php

use Illuminate\Support\Facades\Route;
use Modules\Orders\Http\Controllers\OrdersController;

Route::middleware(['auth', 'verified', 'capability:kds'])->group(function () {
    Route::get('orders/kds-unified', [OrdersController::class, 'unifiedKds'])->name('orders.kds-unified');
});

Route::middleware(['auth', 'verified', 'capability:ordering'])->group(function () {
    Route::get('orders/history', [OrdersController::class, 'history'])->name('orders.history');
    Route::patch('orders/{order}/status', [OrdersController::class, 'updateStatus'])->name('orders.status.update');
    Route::resource('orders', OrdersController::class)->names('orders');
});
