<?php

use App\Http\Controllers\Admin\BotWorkflowController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\TenantController;
use App\Http\Middleware\IsSuperAdmin;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', IsSuperAdmin::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/tenants', [TenantController::class, 'index'])->name('tenants.index');
    Route::get('/tenants/{tenant}/edit', [TenantController::class, 'edit'])->name('tenants.edit');
    Route::put('/tenants/{tenant}', [TenantController::class, 'update'])->name('tenants.update');
    Route::delete('/tenants/{tenant}', [TenantController::class, 'destroy'])->name('tenants.destroy');
    Route::get('/tenants/{tenant}/orders', [TenantController::class, 'orders'])->name('tenants.orders');
    Route::post('/tenants/{tenant}/billing', [TenantController::class, 'updateBilling'])->name('tenants.billing.update');
    Route::post('/tenants/{tenant}/invoice', [TenantController::class, 'generateInvoice'])->name('tenants.invoice.generate');

    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/clear-cache', [SettingsController::class, 'clearCache'])->name('settings.clear-cache');

    Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
    Route::post('/invoices/{invoice}/paid', [InvoiceController::class, 'markAsPaid'])->name('invoices.paid');
    Route::post('/invoices/{invoice}/reminder', [InvoiceController::class, 'sendReminder'])->name('invoices.reminder');
    Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');

    // WhatsApp Bot Workflows
    Route::get('/bot-workflows', [BotWorkflowController::class, 'index'])->name('bot-workflows.index');
    Route::get('/bot-workflows/create', [BotWorkflowController::class, 'create'])->name('bot-workflows.create');
    Route::post('/bot-workflows', [BotWorkflowController::class, 'store'])->name('bot-workflows.store');
    Route::get('/bot-workflows/{workflow}/edit', [BotWorkflowController::class, 'edit'])->name('bot-workflows.edit');
    Route::put('/bot-workflows/{workflow}', [BotWorkflowController::class, 'update'])->name('bot-workflows.update');
    Route::post('/bot-workflows/{workflow}/toggle-active', [BotWorkflowController::class, 'toggleActivate'])->name('bot-workflows.toggle-active');
    Route::delete('/bot-workflows/{workflow}', [BotWorkflowController::class, 'destroy'])->name('bot-workflows.destroy');
});
