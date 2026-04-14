<?php

namespace App\Services;

use App\Models\Order;
use App\Models\RaffleNumber;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AssignRandomNumbersToOrderService
{
    public function handle(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order->refresh();

            if ($order->numbers()->exists()) {
                return $order->load(['numbers', 'raffle', 'customer']);
            }

            if ($order->status !== 'paid') {
                throw new RuntimeException('O pedido ainda não está pago.');
            }

            $availableNumbers = RaffleNumber::query()
                ->where('raffle_id', $order->raffle_id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->inRandomOrder()
                ->limit($order->quantity)
                ->get();

            if ($availableNumbers->count() < $order->quantity) {
                throw new RuntimeException('Não há números disponíveis suficientes para esta compra.');
            }

            $now = now();

            foreach ($availableNumbers as $raffleNumber) {
                $raffleNumber->update([
                    'status' => 'sold',
                    'order_id' => $order->id,
                    'customer_user_id' => $order->customer_user_id,
                    'assigned_at' => $now,
                ]);
            }

            return $order->load([
                'raffle',
                'customer',
                'numbers' => fn ($q) => $q->orderBy('number'),
            ]);
        });
    }
}