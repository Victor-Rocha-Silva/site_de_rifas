<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\RaffleController;
use App\Http\Controllers\Api\PrizeController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\DashboardController;

Route::get('/teste', function () {
    return response()->json([
        'message' => 'API da rifa funcionando'
    ]);
});

Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/raffles', [RaffleController::class, 'index']);
    Route::post('/raffles', [RaffleController::class, 'store']);
    Route::get('/raffles/{id}', [RaffleController::class, 'show']);

    Route::get('/raffles/{raffleId}/prizes', [PrizeController::class, 'index']);
    Route::post('/raffles/{raffleId}/prizes', [PrizeController::class, 'store']);

    Route::get('/raffles/{raffleId}/purchases', [PurchaseController::class, 'index']);
    Route::post('/raffles/{raffleId}/purchases', [PurchaseController::class, 'store']);

    Route::get('/raffles/{raffleId}/summary', [DashboardController::class, 'summary']);
});