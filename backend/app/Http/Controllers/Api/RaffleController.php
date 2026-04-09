<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Raffle;
use App\Models\RaffleNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RaffleController extends Controller
{
    public function index()
    {
        $raffles = Raffle::with(['prizes', 'numbers'])->get();

        return response()->json($raffles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_per_number' => 'required|numeric|min:0.01',
            'total_numbers' => 'required|integer|min:1',
            'draw_date' => 'nullable|date',
            'status' => 'nullable|string|max:50',
            'banner' => 'nullable|string|max:255',
        ]);

        $raffle = DB::transaction(function () use ($validated) {
            $raffle = Raffle::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'price_per_number' => $validated['price_per_number'],
                'total_numbers' => $validated['total_numbers'],
                'draw_date' => $validated['draw_date'] ?? null,
                'status' => $validated['status'] ?? 'active',
                'banner' => $validated['banner'] ?? null,
            ]);

            for ($i = 1; $i <= $raffle->total_numbers; $i++) {
                RaffleNumber::create([
                    'raffle_id' => $raffle->id,
                    'number' => $i,
                    'status' => 'available',
                    'purchase_id' => null,
                ]);
            }

            return $raffle->load('numbers');
        });

        return response()->json([
            'message' => 'Rifa criada com sucesso',
            'raffle' => $raffle
        ], 201);
    }

    public function show(string $id)
    {
        $raffle = Raffle::with(['prizes', 'numbers', 'purchases'])->findOrFail($id);

        return response()->json($raffle);
    }
}