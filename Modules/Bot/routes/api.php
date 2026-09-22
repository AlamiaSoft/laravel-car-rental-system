<?php

use Illuminate\Support\Facades\Route;
use Modules\Bot\Http\Controllers\BotController;
use Modules\Bot\Http\Controllers\EvolutionWebhookController;

Route::middleware(['api', 'throttle:bot-webhook'])->group(function () {
    Route::get('bot/whatsapp/webhook', [BotController::class, 'verifyWebhook']);
    Route::post('bot/whatsapp/webhook/{tenant?}', [BotController::class, 'handleWebhook']);
    Route::post('bot/whatsapp/evolution/webhook', [EvolutionWebhookController::class, 'handleWebhook'])->name('bot.evolution.webhook');
});
