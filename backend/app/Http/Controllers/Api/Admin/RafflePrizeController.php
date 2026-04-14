<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Raffle;
use App\Models\RafflePrize;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RafflePrizeController extends Controller
{
    public function store(Request $request, Raffle $raffle): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $prize = $raffle->prizes()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'image_path' => $validated['image_path'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json($prize, Response::HTTP_CREATED);
    }

    public function update(Request $request, RafflePrize $prize): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $prize->update($validated);

        return response()->json($prize);
    }

    public function destroy(Request $request, RafflePrize $prize): JsonResponse
    {
        $this->ensureAdmin($request);

        $prize->delete();

        return response()->json([
            'message' => 'Prêmio removido com sucesso.',
        ]);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless(
            $request->user() && $request->user()->role === 'admin',
            Response::HTTP_FORBIDDEN,
            'Acesso restrito ao administrador.'
        );
    }
}