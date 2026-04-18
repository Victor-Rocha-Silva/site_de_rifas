<?php

use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\RaffleController as AdminRaffleController;
use App\Http\Controllers\Api\Admin\RafflePrizeController;
use App\Http\Controllers\Api\Admin\UploadController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PublicRaffleController;
use App\Http\Controllers\Api\CustomerRaffleController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register/customer', [AuthController::class, 'registerCustomer']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::get('/raffles', [PublicRaffleController::class, 'index']);
Route::get('/raffles/{slug}', [PublicRaffleController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/customer/orders', [OrderController::class, 'index']);
    Route::get('/customer/orders/{publicId}', [OrderController::class, 'show']);

    Route::get('/customer/raffles', [CustomerRaffleController::class, 'index']);
    Route::get('/customer/raffles/{raffle}', [CustomerRaffleController::class, 'show']);
});

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/raffles', [AdminRaffleController::class, 'index']);
    Route::post('/raffles', [AdminRaffleController::class, 'store']);
    Route::get('/raffles/{raffle}', [AdminRaffleController::class, 'show']);
    Route::put('/raffles/{raffle}', [AdminRaffleController::class, 'update']);
    Route::delete('/raffles/{raffle}', [AdminRaffleController::class, 'destroy']);
    Route::get('/raffles/{raffle}/orders', [AdminOrderController::class, 'byRaffle']);

    Route::post('/raffles/{raffle}/prizes', [RafflePrizeController::class, 'store']);
    Route::put('/prizes/{prize}', [RafflePrizeController::class, 'update']);
    Route::delete('/prizes/{prize}', [RafflePrizeController::class, 'destroy']);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
    Route::post('/orders/{order}/mark-as-paid', [AdminOrderController::class, 'markAsPaid']);

    Route::post('/uploads/image', [UploadController::class, 'image']);
});