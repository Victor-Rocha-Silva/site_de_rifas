<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use MercadoPago\Client\Common\RequestOptions;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Exceptions\MPApiException;
use MercadoPago\MercadoPagoConfig;

class MercadoPagoService
{
    public function authenticate(): void
    {
        MercadoPagoConfig::setAccessToken(config('services.mercadopago.access_token'));

        if (app()->environment('local')) {
            MercadoPagoConfig::setRuntimeEnviroment(MercadoPagoConfig::LOCAL);
        }
    }

    public function createCheckoutPreference(Order $order): array
    {
        $this->authenticate();

        $order->loadMissing(['raffle', 'customer']);

        $client = new PreferenceClient();

        $request = [
            'items' => [
                [
                    'id' => (string) $order->id,
                    'title' => 'Rifa: ' . $order->raffle->title,
                    'description' => 'Compra de ' . $order->quantity . ' cota(s)',
                    'currency_id' => 'BRL',
                    'quantity' => (int) $order->quantity,
                    'unit_price' => (float) $order->unit_price,
                ],
            ],
            'payer' => [
                'name' => $order->customer->name,
                'email' => $order->customer->email,
            ],
            'external_reference' => $order->public_id,
            'back_urls' => [
                'success' => route('mercadopago.success'),
                'failure' => route('mercadopago.failure'),
                'pending' => route('mercadopago.pending'),
            ],
            'auto_return' => 'approved',
            'statement_descriptor' => 'SITE DE RIFAS',
        ];

        $requestOptions = new RequestOptions();
        $requestOptions->setCustomHeaders([
            'X-Idempotency-Key: ' . (string) Str::uuid(),
        ]);

        try {
            $preference = $client->create($request, $requestOptions);

            return [
                'preference_id' => $preference->id,
                'checkout_url' => $preference->init_point,
            ];
        } catch (MPApiException $e) {
            throw new \RuntimeException(
                'Erro Mercado Pago: ' . json_encode($e->getApiResponse()->getContent(), JSON_UNESCAPED_UNICODE)
            );
        }
    }

    public function getPaymentById(string $paymentId)
    {
        $this->authenticate();

        $client = new PaymentClient();

        return $client->get($paymentId);
    }

    public function validateWebhookSignature(Request $request): bool
    {
        $secret = config('services.mercadopago.webhook_secret');

        if (!$secret) {
            return false;
        }

        $xSignature = $request->header('x-signature');
        $xRequestId = $request->header('x-request-id');

        if (!$xSignature || !$xRequestId) {
            return false;
        }

        $parts = [];
        foreach (explode(',', $xSignature) as $chunk) {
            [$k, $v] = array_pad(explode('=', trim($chunk), 2), 2, null);
            if ($k && $v) {
                $parts[$k] = $v;
            }
        }

        $ts = $parts['ts'] ?? null;
        $v1 = $parts['v1'] ?? null;

        if (!$ts || !$v1) {
            return false;
        }

        $dataId = $request->input('data.id') ?? $request->query('data.id') ?? '';
        $manifest = "id:{$dataId};request-id:{$xRequestId};ts:{$ts};";

        $expected = hash_hmac('sha256', $manifest, $secret);

        return hash_equals($expected, $v1);
    }
}