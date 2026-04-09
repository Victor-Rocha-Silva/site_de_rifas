<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Raffle;
use App\Models\Purchase;

class DashboardController extends Controller
{
    public function summary($raffleId)
    {
        $raffle = Raffle::with(['prizes', 'numbers', 'purchases'])->findOrFail($raffleId);

        $totalNumbers = $raffle->total_numbers;
        $soldNumbers = $raffle->numbers()->where('status', 'sold')->count();
        $availableNumbers = $raffle->numbers()->where('status', 'available')->count();

        $totalPurchases = $raffle->purchases()->count();

        $totalRevenue = $raffle->purchases()
            ->where('payment_status', 'paid')
            ->sum('total_price');

        $totalPrizeCost = $raffle->prizes()->sum('estimated_cost');

        $estimatedProfit = $totalRevenue - $totalPrizeCost;

        return response()->json([
            'raffle' => [
                'id' => $raffle->id,
                'title' => $raffle->title,
                'price_per_number' => $raffle->price_per_number,
                'status' => $raffle->status,
                'draw_date' => $raffle->draw_date,
            ],
            'summary' => [
                'total_numbers' => $totalNumbers,
                'sold_numbers' => $soldNumbers,
                'available_numbers' => $availableNumbers,
                'total_purchases' => $totalPurchases,
                'total_revenue' => (float) $totalRevenue,
                'total_prize_cost' => (float) $totalPrizeCost,
                'estimated_profit' => (float) $estimatedProfit,
            ]
        ]);
    }
}