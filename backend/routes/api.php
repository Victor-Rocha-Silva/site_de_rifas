<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RaffleController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\MercadoPagoController;
use App\Http\Controllers\Api\MercadoPagoWebhookController;

use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminRaffleController;
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\AdminUploadController;

use App\Http\Controllers\Api\CustomerRaffleController;
use App\Http\Controllers\Api\CustomerOrderController;

use App\Http\Controllers\Api\RafflePrizeController;

/*
|--------------------------------------------------------------------------
| Rotas públicas
|--------------------------------------------------------------------------
*/

Route::get('/teste', function () {
    return response()->json([
        'message' => 'API funcionando',
    ]);
});

/*
|--------------------------------------------------------------------------
| Webhook Mercado Pago
|--------------------------------------------------------------------------
*/

Route::post('/mercadopago/webhook', [MercadoPagoWebhookController::class, 'handle']);

/*
|--------------------------------------------------------------------------
| Redirecionamento pós-pagamento Mercado Pago
|--------------------------------------------------------------------------
| Usado só para teste local com ngrok.
*/

Route::get('/payment/redirect/{status}', function (Request $request, string $status) {
    $frontendUrl = rtrim(config('app.frontend_url'), '/');

    $statusMap = [
        'success' => 'sucesso',
        'failure' => 'erro',
        'pending' => 'pendente',
    ];

    $frontendStatus = $statusMap[$status] ?? 'pendente';

    $order = $request->query('order');

    $url = $frontendUrl . '/pagamento/' . $frontendStatus;

    if ($order) {
        $url .= '?order=' . urlencode($order);
    }

    return redirect()->away($url);
});

/*
|--------------------------------------------------------------------------
| Autenticação pública
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('/register-customer', [AuthController::class, 'registerCustomer']);
    Route::post('/register', [AuthController::class, 'registerCustomer']);
    Route::post('/login', [AuthController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| Rifas públicas
|--------------------------------------------------------------------------
*/

Route::get('/raffles', [RaffleController::class, 'index']);
Route::get('/raffles/{slug}', [RaffleController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Rotas protegidas
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Usuário autenticado
    |--------------------------------------------------------------------------
    */

    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Pedidos / Compra
    |--------------------------------------------------------------------------
    */

    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{publicId}', [OrderController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | Mercado Pago checkout antigo/opcional
    |--------------------------------------------------------------------------
    | O fluxo principal agora usa POST /orders.
    */

    Route::post('/mercadopago/checkout', [MercadoPagoController::class, 'checkout']);
    Route::post('/mercadopago/checkout/{order}', [MercadoPagoController::class, 'checkout']);

    /*
    |--------------------------------------------------------------------------
    | Área do cliente
    |--------------------------------------------------------------------------
    */

    Route::get('/customer/raffles', [CustomerRaffleController::class, 'index']);
    Route::get('/customer/raffles/{raffleId}', [CustomerRaffleController::class, 'show']);

    Route::get('/customer/orders', [CustomerOrderController::class, 'index']);
    Route::get('/customer/orders/{publicId}', [CustomerOrderController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | Área administrativa
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);

    Route::get('/admin/raffles', [AdminRaffleController::class, 'index']);
    Route::post('/admin/raffles', [AdminRaffleController::class, 'store']);
    Route::get('/admin/raffles/{raffle}', [AdminRaffleController::class, 'show']);
    Route::put('/admin/raffles/{raffle}', [AdminRaffleController::class, 'update']);
    Route::patch('/admin/raffles/{raffle}', [AdminRaffleController::class, 'update']);
    Route::delete('/admin/raffles/{raffle}', [AdminRaffleController::class, 'destroy']);

    Route::get('/admin/raffles/{raffleId}/orders', [AdminOrderController::class, 'byRaffle']);
    Route::get('/admin/orders', [AdminOrderController::class, 'index']);
    Route::get('/admin/orders/{order}', [AdminOrderController::class, 'show']);
    Route::post('/admin/orders/{order}/mark-as-paid', [AdminOrderController::class, 'markAsPaid']);

    Route::post('/admin/uploads/image', [AdminUploadController::class, 'image']);

    /*
    |--------------------------------------------------------------------------
    | Prêmios das rifas
    |--------------------------------------------------------------------------
    */

    // Rotas antigas/protegidas
    Route::get('/raffles/{raffleId}/prizes', [RafflePrizeController::class, 'index']);
    Route::post('/raffles/{raffleId}/prizes', [RafflePrizeController::class, 'store']);

    // Rotas que o frontend admin está chamando
    Route::get('/admin/raffles/{raffleId}/prizes', [RafflePrizeController::class, 'index']);
    Route::post('/admin/raffles/{raffleId}/prizes', [RafflePrizeController::class, 'store']);

    // Editar/excluir prêmio
    Route::put('/prizes/{prize}', [RafflePrizeController::class, 'update']);
    Route::patch('/prizes/{prize}', [RafflePrizeController::class, 'update']);
    Route::delete('/prizes/{prize}', [RafflePrizeController::class, 'destroy']);

    // Alias admin para editar/excluir prêmio
    Route::put('/admin/prizes/{prize}', [RafflePrizeController::class, 'update']);
    Route::patch('/admin/prizes/{prize}', [RafflePrizeController::class, 'update']);
    Route::delete('/admin/prizes/{prize}', [RafflePrizeController::class, 'destroy']);
});