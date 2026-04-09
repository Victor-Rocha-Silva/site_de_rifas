<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Raffle;
use App\Models\RaffleNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index($raffleId)
    {
        $raffle = Raffle::findOrFail($raffleId);

        $purchases = Purchase::with('numbers')
            ->where('raffle_id', $raffle->id)
            ->latest()
            ->get();

        return response()->json($purchases);
    }

    public function store(Request $request, $raffleId)
    {
        $raffle = Raffle::findOrFail($raffleId);

        $validated = $request->validate([
            'buyer_name' => 'required|string|max:255',
            'buyer_phone' => 'required|string|max:30',
            'buyer_email' => 'nullable|email|max:255',
            'quantity' => 'required|integer|min:1',
        ]);

        $purchase = DB::transaction(function () use ($raffle, $validated) {
            $availableNumbers = RaffleNumber::where('raffle_id', $raffle->id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->get();

            if ($availableNumbers->count() < $validated['quantity']) {
                abort(response()->json([
                    'message' => 'Não há números disponíveis suficientes.'
                ], 422));
            }

            $totalPrice = $raffle->price_per_number * $validated['quantity'];

            $purchase = Purchase::create([
                'raffle_id' => $raffle->id,
                'buyer_name' => $validated['buyer_name'],
                'buyer_phone' => $validated['buyer_phone'],
                'buyer_email' => $validated['buyer_email'] ?? null,
                'quantity' => $validated['quantity'],
                'unit_price' => $raffle->price_per_number,
                'total_price' => $totalPrice,
                'payment_status' => 'paid',
                'payment_gateway' => null,
                'payment_reference' => null,
            ]);

            $selectedNumbers = $availableNumbers
                ->shuffle()
                ->take($validated['quantity']);

            foreach ($selectedNumbers as $number) {
                $number->update([
                    'status' => 'sold',
                    'purchase_id' => $purchase->id,
                ]);
            }

            return $purchase->load('numbers');
        });

        return response()->json([
            'message' => 'Compra realizada com sucesso',
            'purchase' => $purchase,
            'assigned_numbers' => $purchase->numbers->pluck('number')->sort()->values(),
        ], 201);
    }
}