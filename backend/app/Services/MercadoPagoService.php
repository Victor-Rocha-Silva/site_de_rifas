<?php

namespace App\Services;

use App\Models\Order;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Exceptions\MPApiException;
use MercadoPago\MercadoPagoConfig;

class MercadoPagoService
{
    public function __construct()
    {
        $token = config('services.mercadopago.token');

        if (!$token) {
            throw new \Exception('MERCADOPAGO_TOKEN não configurado no .env');
        }

        MercadoPagoConfig::setAccessToken($token);
    }

    public function createCheckout(Order $order): string
    {
        $client = new PreferenceClient();

        $frontendUrl = rtrim(config('app.frontend_url'), '/');
        $appUrl = rtrim(config('app.url'), '/');

        $preferenceData = [
            'items' => [
                [
                    'id' => (string) $order->id,
                    'title' => 'Compra de cotas da rifa',
                    'description' => 'Pedido #' . $order->public_id,
                    'quantity' => 1,
                    'currency_id' => 'BRL',
                    'unit_price' => (float) $order->total_amount,
                ],
            ],

            'external_reference' => $order->public_id,

            'metadata' => [
                'order_id' => $order->id,
                'public_id' => $order->public_id,
                'raffle_id' => $order->raffle_id,
                'customer_user_id' => $order->customer_user_id,
            ],
        ];

        /*
         * Se o frontend estiver em HTTPS real, o Mercado Pago volta direto para o frontend.
         * Isso será usado na Hostinger.
         */
        if (str_starts_with($frontendUrl, 'https://')) {
            $preferenceData['back_urls'] = [
                'success' => $frontendUrl . '/pagamento/sucesso?order=' . $order->public_id,
                'failure' => $frontendUrl . '/pagamento/erro?order=' . $order->public_id,
                'pending' => $frontendUrl . '/pagamento/pendente?order=' . $order->public_id,
            ];

            $preferenceData['auto_return'] = 'approved';
        }

        /*
         * Se o frontend estiver local em HTTP, mas o backend estiver em HTTPS pelo ngrok,
         * o Mercado Pago volta para o backend e o Laravel redireciona para o frontend local.
         * Isso é só para teste local.
         */
        elseif (str_starts_with($appUrl, 'https://')) {
            $preferenceData['back_urls'] = [
                'success' => $appUrl . '/api/payment/redirect/success?order=' . $order->public_id,
                'failure' => $appUrl . '/api/payment/redirect/failure?order=' . $order->public_id,
                'pending' => $appUrl . '/api/payment/redirect/pending?order=' . $order->public_id,
            ];

            $preferenceData['auto_return'] = 'approved';
        }

        /*
         * Webhook: se o backend estiver em HTTPS, envia a notification_url.
         * Com ngrok, isso funciona localmente.
         */
        if (str_starts_with($appUrl, 'https://')) {
            $preferenceData['notification_url'] = $appUrl . '/api/mercadopago/webhook';
        }

        try {
            $preference = $client->create($preferenceData);
        } catch (MPApiException $e) {
            $apiResponse = $e->getApiResponse();

            $message = 'Erro Mercado Pago';

            if ($apiResponse) {
                $content = $apiResponse->getContent();

                if (is_array($content)) {
                    $message = $content['message']
                        ?? $content['error']
                        ?? $message;
                }
            }

            throw new \Exception($message);
        }

        if (is_object($preference) && !empty($preference->init_point)) {
            return $preference->init_point;
        }

        if (is_array($preference) && !empty($preference['init_point'])) {
            return $preference['init_point'];
        }

        if (is_string($preference) && str_starts_with($preference, 'http')) {
            return $preference;
        }

        throw new \Exception('Não foi possível gerar o link de pagamento do Mercado Pago.');
    }

    public function createCheckoutPreference(Order $order): string
    {
        return $this->createCheckout($order);
    }
}