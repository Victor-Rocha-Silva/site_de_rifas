<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prize;
use App\Models\Raffle;
use Illuminate\Http\Request;

class PrizeController extends Controller
{
    public function index($raffleId)
    {
        $raffle = Raffle::with('prizes')->findOrFail($raffleId);

        return response()->json($raffle->prizes);
    }

    public function store(Request $request, $raffleId)
    {
        $raffle = Raffle::findOrFail($raffleId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'position' => 'required|integer|min:1',
            'estimated_cost' => 'nullable|numeric|min:0',
        ]);

        $prize = Prize::create([
            'raffle_id' => $raffle->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'position' => $validated['position'],
            'estimated_cost' => $validated['estimated_cost'] ?? null,
        ]);

        return response()->json([
            'message' => 'Prêmio cadastrado com sucesso',
            'prize' => $prize
        ], 201);
    }
}