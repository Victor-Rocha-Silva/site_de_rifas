<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Raffle;
use App\Models\RafflePrize;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RafflePrizeController extends Controller
{
    public function index(int $raffleId): JsonResponse
    {
        $raffle = Raffle::query()->findOrFail($raffleId);

        $prizes = $raffle->prizes()
            ->orderBy('sort_order')
            ->get();

        return response()->json($prizes);
    }

    public function store(Request $request, int $raffleId): JsonResponse
    {
        $raffle = Raffle::query()->findOrFail($raffleId);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $prize = RafflePrize::create([
            'raffle_id' => $raffle->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'image_path' => $validated['image_path'] ?? null,
            'sort_order' => $validated['sort_order'] ?? $this->nextSortOrder($raffle->id),
        ]);

        return response()->json([
            'message' => 'Prêmio criado com sucesso.',
            'prize' => $prize,
        ], 201);
    }

    public function update(Request $request, RafflePrize $prize): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $prize->update($validated);

        return response()->json([
            'message' => 'Prêmio atualizado com sucesso.',
            'prize' => $prize->fresh(),
        ]);
    }

    public function destroy(RafflePrize $prize): JsonResponse
    {
        $prize->delete();

        return response()->json([
            'message' => 'Prêmio excluído com sucesso.',
        ]);
    }

    private function nextSortOrder(int $raffleId): int
    {
        $lastSortOrder = RafflePrize::query()
            ->where('raffle_id', $raffleId)
            ->max('sort_order');

        return ((int) $lastSortOrder) + 1;
    }
}