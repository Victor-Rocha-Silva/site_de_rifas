<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MercadoPagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MercadoPagoController extends Controller
{
    public function checkout(Request $request, MercadoPagoService $mercadoPagoService): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => ['required', 'integer', 'exists:orders,id'],
        ]);

        $order = Order::query()->findOrFail($validated['order_id']);

        $checkoutUrl = $mercadoPagoService->createCheckout($order);

        $order->update([
            'checkout_url' => $checkoutUrl,
        ]);

        return response()->json([
            'message' => 'Checkout criado com sucesso.',
            'checkout_url' => $checkoutUrl,
            'init_point' => $checkoutUrl,
        ]);
    }
}