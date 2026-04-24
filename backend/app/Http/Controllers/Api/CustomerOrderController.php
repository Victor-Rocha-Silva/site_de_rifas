<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = Order::query()
            ->where('customer_user_id', $user->id)
            ->with([
                'raffle:id,title,slug,price_per_ticket,total_numbers,status',
                'numbers:id,raffle_id,order_id,number,status,assigned_at',
            ])
            ->orderByDesc('id')
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, string $publicId): JsonResponse
    {
        $user = $request->user();

        $order = Order::query()
            ->where('public_id', $publicId)
            ->where('customer_user_id', $user->id)
            ->with([
                'raffle:id,title,slug,price_per_ticket,total_numbers,status',
                'numbers:id,raffle_id,order_id,number,status,assigned_at',
            ])
            ->firstOrFail();

        return response()->json($order);
    }
}