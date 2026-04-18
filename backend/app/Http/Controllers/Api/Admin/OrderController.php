<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Raffle;
use App\Models\RaffleNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $query = Order::query()
            ->with(['customer', 'raffle', 'numbers'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('search')) {
            $search = trim($request->string('search')->toString());

            $query->where(function ($subQuery) use ($search) {
                $subQuery
                    ->where('public_id', 'like', "%{$search}%")
                    ->orWhere('payment_reference', 'like', "%{$search}%")
                    ->orWhere('payment_id', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($customerQuery) use ($search) {
                        $customerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    })
                    ->orWhereHas('raffle', function ($raffleQuery) use ($search) {
                        $raffleQuery
                            ->where('title', 'like', "%{$search}%")
                            ->orWhere('slug', 'like', "%{$search}%");
                    });
            });
        }

        return response()->json($query->get());
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->ensureAdmin($request);

        return response()->json(
            $order->load(['customer', 'raffle', 'numbers'])
        );
    }

    public function byRaffle(Request $request, Raffle $raffle): JsonResponse
    {
        $this->ensureAdmin($request);

        $orders = $raffle->orders()
            ->with(['customer', 'numbers', 'raffle'])
            ->latest()
            ->get();

        return response()->json([
            'raffle' => [
                'id' => $raffle->id,
                'title' => $raffle->title,
                'slug' => $raffle->slug,
                'status' => $raffle->status,
                'total_numbers' => $raffle->total_numbers,
                'price_per_ticket' => $raffle->price_per_ticket,
            ],
            'orders' => $orders,
        ]);
    }

    public function markAsPaid(Request $request, Order $order): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'payment_provider' => ['nullable', 'string', 'max:100'],
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'payment_id' => ['nullable', 'string', 'max:255'],
        ]);

        if ($order->status === 'paid') {
            return response()->json([
                'message' => 'Este pedido já foi aprovado.',
                'order' => $order->load(['customer', 'raffle', 'numbers']),
            ]);
        }

        $raffle = $order->raffle;

        if (!$raffle) {
            return response()->json([
                'message' => 'A rifa deste pedido não foi encontrada.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $generatedNumbers = [];

        DB::transaction(function () use ($order, $raffle, $validated, &$generatedNumbers) {
            $alreadySoldNumbers = RaffleNumber::query()
                ->where('raffle_id', $raffle->id)
                ->pluck('number')
                ->map(fn ($number) => (int) $number)
                ->all();

            $allNumbers = range(1, (int) $raffle->total_numbers);
            $availableNumbers = array_values(array_diff($allNumbers, $alreadySoldNumbers));

            if (count($availableNumbers) < (int) $order->quantity) {
                abort(
                    Response::HTTP_UNPROCESSABLE_ENTITY,
                    'Não existem números disponíveis suficientes para aprovar este pedido.'
                );
            }

            shuffle($availableNumbers);
            $selectedNumbers = array_slice($availableNumbers, 0, (int) $order->quantity);
            sort($selectedNumbers);

            foreach ($selectedNumbers as $number) {
                RaffleNumber::create([
                    'raffle_id' => $raffle->id,
                    'order_id' => $order->id,
                    'number' => $number,
                ]);
            }

            $order->update([
                'status' => 'paid',
                'payment_provider' => $validated['payment_provider'] ?? 'manual',
                'payment_reference' => $validated['payment_reference'] ?? ('MANUAL-' . $order->id),
                'payment_id' => $validated['payment_id'] ?? (string) Str::uuid(),
                'paid_at' => now(),
                'metadata' => array_merge($order->metadata ?? [], [
                    'approved_by_admin' => true,
                ]),
            ]);

            $generatedNumbers = $selectedNumbers;
        });

        return response()->json([
            'message' => 'Pedido aprovado com sucesso.',
            'generated_numbers' => $generatedNumbers,
            'order' => $order->fresh()->load(['customer', 'raffle', 'numbers']),
        ]);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless(
            $request->user() && $request->user()->role === 'admin',
            Response::HTTP_FORBIDDEN,
            'Acesso restrito ao administrador.'
        );
    }
}