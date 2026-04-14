<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Raffle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
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

        $order = DB::transaction(function () use ($request, $validated, $raffle) {
            return Order::create([
                'raffle_id' => $raffle->id,
                'customer_user_id' => $request->user()->id,
                'quantity' => $validated['quantity'],
                'unit_price' => $raffle->price_per_ticket,
                'total_amount' => bcmul((string) $raffle->price_per_ticket, (string) $validated['quantity'], 2),
                'status' => 'pending_payment',
                'payment_provider' => 'manual',
                'payment_reference' => null,
                'payment_id' => null,
                'checkout_url' => null,
                'metadata' => [
                    'manual_payment' => true,
                ],
            ]);
        });

        return response()->json([
            'message' => 'Pedido criado com sucesso. Aguarde a aprovação do administrador.',
            'order' => $order->load('raffle'),
        ], Response::HTTP_CREATED);
    }

    public function index(Request $request): JsonResponse
    {
        $this->ensureCustomer($request);

        $orders = Order::query()
            ->where('customer_user_id', $request->user()->id)
            ->with([
                'raffle',
                'numbers' => fn ($q) => $q->orderBy('number'),
            ])
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, string $publicId): JsonResponse
    {
        $this->ensureCustomer($request);

        $order = Order::query()
            ->where('public_id', $publicId)
            ->where('customer_user_id', $request->user()->id)
            ->with([
                'raffle',
                'numbers' => fn ($q) => $q->orderBy('number'),
            ])
            ->firstOrFail();

        return response()->json($order);
    }

    private function ensureCustomer(Request $request): void
    {
        abort_unless(
            $request->user() && $request->user()->role === 'customer',
            Response::HTTP_FORBIDDEN,
            'Acesso restrito ao cliente.'
        );
    }
}