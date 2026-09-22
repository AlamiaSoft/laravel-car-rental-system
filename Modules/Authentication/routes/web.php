<?php

use Illuminate\Support\Facades\Route;
use Modules\Authentication\Http\Controllers\SocialAuthController;

Route::middleware(['web'])->group(function () {
    Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])->name('social.redirect');
    Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])->name('social.callback');
});
