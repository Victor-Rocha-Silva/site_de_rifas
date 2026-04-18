<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Raffle;
use App\Models\RaffleNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomerRaffleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureCustomer($request);

        $user = $request->user();

        $raffles = Raffle::query()
            ->whereHas('orders', function ($query) use ($user) {
                $query->where('customer_user_id', $user->id);
            })
            ->with([
                'orders' => function ($query) use ($user) {
                    $query->where('customer_user_id', $user->id)
                        ->with('numbers')
                        ->latest();
                },
            ])
            ->withCount('numbers as sold_numbers_count')
            ->latest()
            ->get()
            ->map(function ($raffle) {
                $myNumbers = $raffle->orders
                    ->flatMap(fn ($order) => $order->numbers->pluck('number'))
                    ->sort()
                    ->values();

                return [
                    'id' => $raffle->id,
                    'title' => $raffle->title,
                    'slug' => $raffle->slug,
                    'status' => $raffle->status,
                    'total_numbers' => $raffle->total_numbers,
                    'sold_numbers_count' => $raffle->sold_numbers_count,
                    'my_numbers_count' => $myNumbers->count(),
                    'my_numbers' => $myNumbers,
                    'orders_count' => $raffle->orders->count(),
                ];
            })
            ->values();

        return response()->json($raffles);
    }

    public function show(Request $request, Raffle $raffle): JsonResponse
    {
        $this->ensureCustomer($request);

        $user = $request->user();

        $hasOrder = Order::query()
            ->where('raffle_id', $raffle->id)
            ->where('customer_user_id', $user->id)
            ->exists();

        abort_unless(
            $hasOrder,
            Response::HTTP_NOT_FOUND,
            'Rifa não encontrada para este cliente.'
        );

        $myOrders = Order::query()
            ->where('raffle_id', $raffle->id)
            ->where('customer_user_id', $user->id)
            ->with(['numbers' => fn ($q) => $q->orderBy('number')])
            ->latest()
            ->get();

        $soldNumbers = RaffleNumber::query()
            ->where('raffle_id', $raffle->id)
            ->orderBy('number')
            ->pluck('number')
            ->values();

        $myNumbers = RaffleNumber::query()
            ->where('raffle_id', $raffle->id)
            ->whereHas('order', function ($query) use ($user) {
                $query->where('customer_user_id', $user->id);
            })
            ->orderBy('number')
            ->pluck('number')
            ->values();

        return response()->json([
            'id' => $raffle->id,
            'title' => $raffle->title,
            'slug' => $raffle->slug,
            'status' => $raffle->status,
            'total_numbers' => $raffle->total_numbers,
            'sold_numbers' => $soldNumbers,
            'my_numbers' => $myNumbers,
            'orders' => $myOrders,
        ]);
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