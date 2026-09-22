<?php

use Illuminate\Support\Facades\Route;
use Modules\Bot\Http\Controllers\BotController;
use Modules\Bot\Http\Controllers\SimulatorController;

Route::get('/simulator', [SimulatorController::class, 'index'])->name('simulator.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('bots', BotController::class)->names('bot');
});
