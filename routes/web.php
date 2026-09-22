<?php

use App\Http\Controllers\Auth\TwoFactorAuthenticationController;
use App\Http\Controllers\Auth\TwoFactorChallengeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Pwa\MiniAppController;
use App\Http\Controllers\Pwa\PwaController;
use App\Http\Controllers\Settings\BillingController;
use App\Http\Controllers\SettingsController;
use App\Services\MerchantOnboardingService;
use App\Services\MerchantRoiService;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Modules\Rental\Http\Controllers\BookingRequestController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (Request $request, MerchantRoiService $roiService, MerchantOnboardingService $onboardingService) {
    if (auth()->user()->isPlatformAdmin() && ! tenant()) {
        return redirect()->route('admin.dashboard');
    }

    if (tenant() && tenant()->hasCapability('rentals') && ! tenant()->hasCapability('ordering')) {
        return redirect()->route('rental.dashboard');
    }

    $period = $request->query('period', 'this_month');
    if (! in_array($period, ['today', 'this_week', 'this_month', 'all_time'])) {
        $period = 'this_month';
    }

    $roi = $roiService->calculate(tenant('id'), $period);
    $onboarding = $onboardingService->getOnboardingStatus(tenant('id'));

    return Inertia::render('Dashboard', [
        'kpis' => $roi,
        'selectedPeriod' => $period,
        'onboarding' => $onboarding,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/settings/integrations', [SettingsController::class, 'integrations'])->name('settings.integrations');
    Route::post('/settings/integrations', [SettingsController::class, 'updateIntegrations']);
    Route::post('/settings/whatsapp/evolution/connect', [SettingsController::class, 'connectEvolution'])->name('settings.whatsapp.evolution.connect');
    Route::get('/settings/whatsapp/evolution/state', [SettingsController::class, 'checkEvolutionState'])->name('settings.whatsapp.evolution.state');
    Route::post('/settings/whatsapp/evolution/disconnect', [SettingsController::class, 'disconnectEvolution'])->name('settings.whatsapp.evolution.disconnect');
    Route::get('/settings/billing', [BillingController::class, 'index'])->name('settings.billing');
    Route::get('/settings/billing/invoices/{invoice}', [BillingController::class, 'show'])->name('settings.billing.invoices.show');
    Route::patch('/settings/business', [SettingsController::class, 'updateBusinessProfile'])->name('settings.business.update');

    // Mini-App Settings Dashboard routes
    Route::get('/settings/miniapp', [PwaController::class, 'showSettings'])->name('settings.miniapp');
    Route::post('/settings/miniapp', [PwaController::class, 'saveSettings'])->name('settings.miniapp.save');
    Route::post('/settings/miniapp/logo', [PwaController::class, 'uploadLogo'])->name('settings.miniapp.logo');
    Route::post('/settings/miniapp/publish', [PwaController::class, 'publishSettings'])->name('settings.miniapp.publish');

    // Two-Factor Authentication settings routes
    Route::post('/user/two-factor-authentication', [TwoFactorAuthenticationController::class, 'enable'])->name('two-factor.enable');
    Route::delete('/user/two-factor-authentication', [TwoFactorAuthenticationController::class, 'disable'])->name('two-factor.disable');
    Route::post('/user/confirmed-two-factor-authentication', [TwoFactorAuthenticationController::class, 'confirm'])->name('two-factor.confirm');
    Route::get('/user/two-factor-qr-code', [TwoFactorAuthenticationController::class, 'getQrCode'])->name('two-factor.qr-code');
    Route::get('/user/two-factor-recovery-codes', [TwoFactorAuthenticationController::class, 'getRecoveryCodes'])->name('two-factor.recovery-codes');
    Route::post('/user/two-factor-recovery-codes', [TwoFactorAuthenticationController::class, 'regenerateRecoveryCodes'])->name('two-factor.regenerate-recovery-codes');
});

Route::get('/two-factor-challenge', [TwoFactorChallengeController::class, 'create'])->name('two-factor.login');
Route::post('/two-factor-challenge', [TwoFactorChallengeController::class, 'store']);

require __DIR__.'/auth.php';

Route::get('/test-tenancy', function () {
    return response()->json([
        'auth_check' => auth()->check(),
        'tenant_initialized' => tenancy()->initialized,
        'tenant' => tenant('id'),
    ]);
})->middleware(['auth', 'verified']);

// Public PWA Mini-App Routes
Route::get('/t/{token}', [PwaController::class, 'shortTokenExchange'])->name('pwa.short.exchange');

Route::get('/order/{tenant_slug}', function (string $tenant_slug) {
    $auth = request()->query('auth');
    $query = $auth ? '?auth='.urlencode($auth) : '';

    return redirect('/app/'.$tenant_slug.'/order'.$query, 301);
});

Route::get('/order/{tenant_slug}/track/{order_number}', function (string $tenant_slug, string $order_number) {
    return redirect("/app/{$tenant_slug}/track/{$order_number}", 301);
});

Route::post('/order/{tenant_slug}/checkout', [PwaController::class, 'submitOrder'])->middleware(['capability:ordering', 'throttle:pwa-checkout']);

Route::group(['prefix' => 'app/{tenant_slug}'], function () {
    Route::get('/', [MiniAppController::class, 'index'])->name('pwa.app.index');
    Route::get('/manifest.json', [PwaController::class, 'manifest'])->name('pwa.manifest');
    Route::post('/checkout', [PwaController::class, 'submitOrder'])->middleware(['capability:ordering', 'throttle:pwa-checkout'])->name('pwa.checkout');
    Route::post('/rent/request', [BookingRequestController::class, 'pwaStore'])->name('pwa.rent.request');
    Route::get('/track/{order_number}', [PwaController::class, 'trackOrder'])->name('pwa.track');
    Route::get('/order', [MiniAppController::class, 'experience'])->defaults('experience', 'order')->name('pwa.menu');
    Route::get('/{experience}', [MiniAppController::class, 'experience'])->name('pwa.app.experience');
});

// Resilient public asset route for logos and uploads with path traversal protection
Route::get('/storage/{path}', function (string $path) {
    $basePath = realpath(storage_path('app/public'));
    if (! $basePath) {
        abort(404);
    }

    $filePath = realpath($basePath.DIRECTORY_SEPARATOR.$path);

    // Strictly ensure resolved path exists, is a regular file, and resides inside storage/app/public
    if (! $filePath || ! str_starts_with($filePath, $basePath) || ! is_file($filePath)) {
        abort(404);
    }

    return response()->file($filePath);
})->where('path', '.*')->name('storage.public.serve');

