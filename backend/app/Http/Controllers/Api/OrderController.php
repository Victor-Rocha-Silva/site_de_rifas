<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Raffle;
use App\Services\MercadoPagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request, MercadoPagoService $mercadoPagoService): JsonResponse
    {
        $this->ensureCustomer($request);

        $validated = $request->validate([
            'raffle_id' => ['required', 'integer', 'exists:raffles,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:1000'],
        ]);

        $raffle = Raffle::query()
            ->where('id', $validated['raffle_id'])
            ->where('status', 'active')
            ->firstOrFail();

        $availableCount = $raffle->numbers()
            ->where('status', 'available')
            ->count();

        if ($validated['quantity'] > $availableCount) {
            return response()->json([
                'message' => 'Não há números disponíveis suficientes para essa compra.',
                'available_numbers' => $availableCount,
            ], 422);
        }

        $unitPrice = $this->getRafflePrice($raffle);
        $totalAmount = $unitPrice * $validated['quantity'];

        $order = DB::transaction(function () use ($request, $raffle, $validated, $unitPrice, $totalAmount) {
            return Order::create([
                'public_id' => (string) Str::uuid(),
                'raffle_id' => $raffle->id,
                'customer_user_id' => optional($request->user())->id,
                'quantity' => $validated['quantity'],
                'unit_price' => $unitPrice,
                'total_amount' => $totalAmount,
                'status' => 'pending_payment',
                'payment_provider' => 'mercadopago',
            ]);
        });

        $checkoutUrl = $mercadoPagoService->createCheckout($order);

        $order->update([
            'checkout_url' => $checkoutUrl,
        ]);

        return response()->json([
            'message' => 'Pedido criado com sucesso.',
            'order' => $order->fresh(),
            'checkout_url' => $checkoutUrl,
        ], 201);
    }

    public function show(Request $request, string $publicId): JsonResponse
    {
        $order = Order::query()
            ->where('public_id', $publicId)
            ->with(['raffle'])
            ->firstOrFail();

        if ($order->customer_user_id && $request->user() && $order->customer_user_id !== $request->user()->id) {
            abort(403, 'Você não tem permissão para ver este pedido.');
        }

        return response()->json([
            'order' => $order,
        ]);
    }

    private function ensureCustomer(Request $request): void
    {
        if (!$request->user()) {
            abort(401, 'Você precisa estar logado para comprar.');
        }
    }

 private function getRafflePrice(Raffle $raffle): float
{
    if (isset($raffle->price_per_ticket)) {
        return (float) $raffle->price_per_ticket;
    }

    if (isset($raffle->ticket_price)) {
        return (float) $raffle->ticket_price;
    }

    if (isset($raffle->price)) {
        return (float) $raffle->price;
    }

    if (isset($raffle->unit_price)) {
        return (float) $raffle->unit_price;
    }

    abort(500, 'Preço da rifa não encontrado. Verifique a coluna price_per_ticket na tabela raffles.');
}
}