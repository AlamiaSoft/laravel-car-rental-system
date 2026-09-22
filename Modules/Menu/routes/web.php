<?php

use Illuminate\Support\Facades\Route;
use Modules\Menu\Http\Controllers\CategoryController;
use Modules\Menu\Http\Controllers\MenuController;
use Modules\Menu\Http\Controllers\MenuImportController;
use Modules\Menu\Http\Controllers\ProductController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::middleware(['auth', 'verified', 'capability:catalog'])->group(function () {
    Route::resource('menus', MenuController::class)->names('menu');
});

Route::middleware(['auth', 'verified', 'capability:catalog'])->prefix('menu')->name('menu.')->group(function () {
    Route::post('categories/template', [CategoryController::class, 'applyTemplate'])->name('categories.template');
    Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);
    Route::resource('products', ProductController::class)->except(['create', 'show', 'edit']);

    // Import Routes
    Route::get('import', [MenuImportController::class, 'show'])->name('import.show');
    Route::post('import/process', [MenuImportController::class, 'process'])->name('import.process');
    Route::post('import/confirm', [MenuImportController::class, 'confirm'])->name('import.confirm');
    Route::get('import/template', [MenuImportController::class, 'downloadTemplate'])->name('import.template');
});
