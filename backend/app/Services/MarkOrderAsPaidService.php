<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\DB;

class MarkOrderAsPaidService
{
    public function __construct(
        private AssignRandomNumbersToOrderService $assignRandomNumbersToOrderService
    ) {
    }

    public function handle(Order $order, array $paymentData = []): Order
    {
        return DB::transaction(function () use ($order, $paymentData) {
            $order->refresh();

            if ($order->status === 'paid') {
                return $order->load([
                    'raffle',
                    'customer',
                    'numbers' => fn ($q) => $q->orderBy('number'),
                ]);
            }

            $metadata = $order->metadata ?? [];

            $order->update([
                'status' => 'paid',
                'paid_at' => now(),
                'payment_provider' => $paymentData['payment_provider'] ?? $order->payment_provider,
                'payment_reference' => $paymentData['payment_reference'] ?? $order->payment_reference,
                'payment_id' => $paymentData['payment_id'] ?? $order->payment_id,
                'metadata' => array_merge($metadata, $paymentData['metadata'] ?? []),
            ]);

            return $this->assignRandomNumbersToOrderService->handle($order);
        });
    }
}