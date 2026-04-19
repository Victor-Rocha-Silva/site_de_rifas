<?php

namespace App\Services;

use App\Models\Order;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Client\Preference\PreferenceClient;
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

    public function createCheckoutPreference(Order $order)
    {
        $client = new PreferenceClient();

        return $client->create([
            "items" => [
                [
                    "title" => $order->raffle->title,
                    "quantity" => $order->quantity,
                    "unit_price" => (float) $order->total_amount / $order->quantity,
                ]
            ],
            "external_reference" => $order->public_id,
            "back_urls" => [
                "success" => env('APP_URL') . "/api/mercadopago/success",
                "failure" => env('APP_URL') . "/api/mercadopago/failure",
                "pending" => env('APP_URL') . "/api/mercadopago/pending",
            ],
            "notification_url" => env('APP_URL') . "/api/mercadopago/webhook",
        ]);
    }

    public function getPaymentById(string $id)
    {
        return (new PaymentClient())->get($id);
    }

    public function validateWebhookSignature($request)
    {
        return true;
    }
}