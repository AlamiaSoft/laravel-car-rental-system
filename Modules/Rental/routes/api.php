<?php

use Illuminate\Support\Facades\Route;
use Modules\Rental\Http\Controllers\BookingRequestController;

Route::post('rental/webhook/whatsapp', [BookingRequestController::class, 'simulate']);
