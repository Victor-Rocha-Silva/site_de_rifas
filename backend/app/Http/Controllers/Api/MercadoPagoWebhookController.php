<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\RaffleNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class MercadoPagoWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        try {
            Log::info('Webhook Mercado Pago recebido', [
                'query' => $request->query(),
                'body' => $request->all(),
            ]);

            $topic = $request->query('topic')
                ?? $request->input('topic')
                ?? $request->query('type')
                ?? $request->input('type');

            $paymentId = $request->query('id')
                ?? $request->input('id')
                ?? $request->input('data.id')
                ?? $request->input('resource');

            if (!$paymentId) {
                return response()->json([
                    'message' => 'Webhook recebido, mas sem payment id.',
                ], 200);
            }

            if ($topic !== 'payment' && !str_contains((string) $topic, 'payment')) {
                return response()->json([
                    'message' => 'Webhook ignorado.',
                    'topic' => $topic,
                    'id' => $paymentId,
                ], 200);
            }

            $token = config('services.mercadopago.token');

            if (!$token) {
                Log::error('Token Mercado Pago não configurado.');

                return response()->json([
                    'message' => 'Token Mercado Pago não configurado.',
                ], 200);
            }

            $response = Http::withToken($token)
                ->get("https://api.mercadopago.com/v1/payments/{$paymentId}");

            if (!$response->successful()) {
                Log::error('Erro ao consultar pagamento no Mercado Pago', [
                    'payment_id' => $paymentId,
                    'status' => $response->status(),
                    'response' => $response->json(),
                ]);

                return response()->json([
                    'message' => 'Erro ao consultar pagamento no Mercado Pago.',
                    'status' => $response->status(),
                ], 200);
            }

            $payment = $response->json();

            $externalReference = $payment['external_reference'] ?? null;
            $status = $payment['status'] ?? null;

            Log::info('Pagamento consultado no Mercado Pago', [
                'payment_id' => $paymentId,
                'external_reference' => $externalReference,
                'status' => $status,
            ]);

            if (!$externalReference) {
                return response()->json([
                    'message' => 'Pagamento sem external_reference.',
                    'payment_id' => $paymentId,
                    'status' => $status,
                ], 200);
            }

            $order = Order::where('public_id', $externalReference)->first();

            if (!$order) {
                Log::warning('Pedido não encontrado pelo public_id', [
                    'external_reference' => $externalReference,
                    'payment_id' => $paymentId,
                ]);

                return response()->json([
                    'message' => 'Pedido não encontrado.',
                    'external_reference' => $externalReference,
                ], 200);
            }

            if ($status === 'approved') {
                DB::transaction(function () use ($order, $paymentId, $externalReference, $payment) {
                    $order->update([
                        'status' => 'paid',
                        'payment_id' => $paymentId,
                        'payment_reference' => $externalReference,
                        'paid_at' => $order->paid_at ?? now(),
                        'metadata' => $payment,
                    ]);

                    $this->assignRandomNumbersToOrder($order->fresh());
                });

                return response()->json([
                    'message' => 'Pedido marcado como pago e números atribuídos.',
                    'order_id' => $order->id,
                    'status' => $order->fresh()->status,
                ], 200);
            }

            if (in_array($status, ['pending', 'in_process'])) {
                $order->update([
                    'status' => 'pending_payment',
                    'payment_id' => $paymentId,
                    'payment_reference' => $externalReference,
                    'metadata' => $payment,
                ]);

                return response()->json([
                    'message' => 'Pedido continua pendente.',
                    'order_id' => $order->id,
                    'status' => $order->fresh()->status,
                ], 200);
            }

            if (in_array($status, ['cancelled', 'rejected', 'refunded', 'charged_back'])) {
                $order->update([
                    'status' => 'cancelled',
                    'payment_id' => $paymentId,
                    'payment_reference' => $externalReference,
                    'metadata' => $payment,
                ]);

                return response()->json([
                    'message' => 'Pedido cancelado/rejeitado.',
                    'order_id' => $order->id,
                    'status' => $order->fresh()->status,
                ], 200);
            }

            return response()->json([
                'message' => 'Webhook processado sem alteração.',
                'payment_status' => $status,
                'order_status' => $order->status,
            ], 200);
        } catch (Throwable $e) {
            Log::error('Erro no webhook Mercado Pago', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'message' => 'Erro tratado no webhook.',
                'error' => $e->getMessage(),
            ], 200);
        }
    }

    private function assignRandomNumbersToOrder(Order $order): void
    {
        $alreadyAssigned = RaffleNumber::where('order_id', $order->id)->count();

        if ($alreadyAssigned >= $order->quantity) {
            Log::info('Pedido já possui números atribuídos.', [
                'order_id' => $order->id,
                'already_assigned' => $alreadyAssigned,
            ]);

            return;
        }

        $quantityToAssign = $order->quantity - $alreadyAssigned;

        $availableNumbers = RaffleNumber::where('raffle_id', $order->raffle_id)
            ->where('status', 'available')
            ->inRandomOrder()
            ->lockForUpdate()
            ->limit($quantityToAssign)
            ->get();

        if ($availableNumbers->count() < $quantityToAssign) {
            throw new \Exception('Não há números disponíveis suficientes para atribuir ao pedido.');
        }

        foreach ($availableNumbers as $raffleNumber) {
            $raffleNumber->update([
                'status' => 'sold',
                'order_id' => $order->id,
                'customer_user_id' => $order->customer_user_id,
                'assigned_at' => now(),
            ]);
        }

        Log::info('Números atribuídos ao pedido.', [
            'order_id' => $order->id,
            'quantity' => $quantityToAssign,
            'numbers' => $availableNumbers->pluck('number')->toArray(),
        ]);
    }
}