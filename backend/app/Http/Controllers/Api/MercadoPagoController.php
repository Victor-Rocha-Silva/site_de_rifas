<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MarkOrderAsPaidService;
use App\Services\MercadoPagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MercadoPagoController extends Controller
{
    public function success(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Pagamento retornou como sucesso.',
            'query' => $request->query(),
        ]);
    }

    public function failure(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Pagamento retornou como falha.',
            'query' => $request->query(),
        ]);
    }

    public function pending(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Pagamento retornou como pendente.',
            'query' => $request->query(),
        ]);
    }

    public function webhook(
        Request $request,
        MercadoPagoService $mercadoPagoService,
        MarkOrderAsPaidService $markOrderAsPaidService
    ): JsonResponse {
        if (!$mercadoPagoService->validateWebhookSignature($request)) {
            return response()->json(['message' => 'Assinatura inválida.'], 401);
        }

        $type = $request->input('type') ?? $request->input('topic');
        $paymentId = $request->input('data.id') ?? $request->input('id');

        if ($type !== 'payment' || !$paymentId) {
            return response()->json(['message' => 'Evento ignorado.'], 200);
        }

        $payment = $mercadoPagoService->getPaymentById((string) $paymentId);

        $externalReference = $payment->external_reference ?? null;
        $status = $payment->status ?? null;

        if (!$externalReference) {
            return response()->json(['message' => 'Pagamento sem external_reference.'], 200);
        }

        $order = Order::query()
            ->where('public_id', $externalReference)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Pedido não encontrado.'], 200);
        }

        if ($status === 'approved') {
            $markOrderAsPaidService->handle($order, [
                'payment_provider' => 'mercado_pago',
                'payment_reference' => $order->payment_reference,
                'payment_id' => (string) $payment->id,
                'metadata' => [
                    'mercado_pago_status' => $status,
                ],
            ]);
        }

        return response()->json(['message' => 'Webhook processado com sucesso.'], 200);
    }
}