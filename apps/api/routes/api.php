<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\EventIngestionController;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Middleware\AuthenticateAnalyticsReadKey;
use App\Http\Middleware\AuthenticateServerAnalyticsKey;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:60,1')->group(function () {
    Route::post('/events', [EventIngestionController::class, 'store'])->name('analytics.events.store');
    Route::post('/server/events', [EventIngestionController::class, 'storeServer'])
        ->middleware(AuthenticateServerAnalyticsKey::class)->name('analytics.server-events.store');

    Route::get('/analytics/summary', [AnalyticsController::class, 'summary'])
        ->middleware(AuthenticateAnalyticsReadKey::class)->name('analytics.summary');
    Route::get('/analytics/trends', [AnalyticsController::class, 'trends'])
        ->middleware(AuthenticateAnalyticsReadKey::class)->name('analytics.trends');
    Route::get('/analytics/pages', [AnalyticsController::class, 'pages'])
        ->middleware(AuthenticateAnalyticsReadKey::class)->name('analytics.pages');
    Route::get('/analytics/events', [AnalyticsController::class, 'events'])
        ->middleware(AuthenticateAnalyticsReadKey::class)->name('analytics.events');

    Route::get('/menu', [RestaurantController::class, 'menu'])->name('restaurant.menu');
    Route::post('/orders', [RestaurantController::class, 'createOrder'])->name('restaurant.orders.store');
});
