<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Raffle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RaffleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $showArchived = $request->boolean('show_archived', false);

        $raffles = Raffle::query()
            ->when(!$showArchived, function ($query) {
                $query->where('status', '!=', 'archived');
            })
            ->with('prizes')
            ->withCount('numbers as sold_numbers_count')
            ->latest()
            ->get();

        return response()->json($raffles);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:raffles,slug'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'banner_path' => ['nullable', 'string', 'max:255'],
            'logo_path' => ['nullable', 'string', 'max:255'],
            'total_numbers' => ['required', 'integer', 'min:1'],
            'price_per_ticket' => ['required', 'numeric', 'min:0.01'],
            'status' => ['required', 'string', 'in:draft,active,paused,finished,archived'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
            'draw_at' => ['nullable', 'date'],

            'design' => ['nullable', 'array'],
            'design.background_color' => ['nullable', 'string', 'max:20'],
            'design.text_color' => ['nullable', 'string', 'max:20'],
            'design.button_color' => ['nullable', 'string', 'max:20'],
            'design.button_text_color' => ['nullable', 'string', 'max:20'],

            'prizes' => ['nullable', 'array'],
            'prizes.*.title' => ['required_with:prizes', 'string', 'max:255'],
            'prizes.*.description' => ['nullable', 'string'],
            'prizes.*.image_path' => ['nullable', 'string', 'max:255'],
            'prizes.*.sort_order' => ['nullable', 'integer', 'min:1'],
        ]);

        $raffle = DB::transaction(function () use ($validated, $request) {
            $raffle = Raffle::create([
                'created_by_user_id' => $request->user()->id,
                'title' => $validated['title'],
                'slug' => $validated['slug'],
                'subtitle' => $validated['subtitle'] ?? null,
                'description' => $validated['description'] ?? null,
                'instagram_url' => $validated['instagram_url'] ?? null,
                'banner_path' => $validated['banner_path'] ?? null,
                'logo_path' => $validated['logo_path'] ?? null,
                'total_numbers' => $validated['total_numbers'],
                'price_per_ticket' => $validated['price_per_ticket'],
                'status' => $validated['status'],
                'starts_at' => $validated['starts_at'] ?? null,
                'ends_at' => $validated['ends_at'] ?? null,
                'draw_at' => $validated['draw_at'] ?? null,
                'design' => $validated['design'] ?? null,
            ]);

            if (!empty($validated['prizes'])) {
                foreach ($validated['prizes'] as $index => $prize) {
                    $raffle->prizes()->create([
                        'title' => $prize['title'],
                        'description' => $prize['description'] ?? null,
                        'image_path' => $prize['image_path'] ?? null,
                        'sort_order' => $prize['sort_order'] ?? ($index + 1),
                    ]);
                }
            }

            return $raffle;
        });

        return response()->json(
            $raffle->load('prizes')->loadCount('numbers as sold_numbers_count'),
            201
        );
    }

    public function show(Request $request, Raffle $raffle): JsonResponse
    {
        $this->ensureAdmin($request);

        return response()->json(
            $raffle->load('prizes')->loadCount('numbers as sold_numbers_count')
        );
    }

    public function update(Request $request, Raffle $raffle): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('raffles', 'slug')->ignore($raffle->id),
            ],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'banner_path' => ['nullable', 'string', 'max:255'],
            'logo_path' => ['nullable', 'string', 'max:255'],
            'total_numbers' => ['sometimes', 'required', 'integer', 'min:1'],
            'price_per_ticket' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'status' => ['sometimes', 'required', 'string', 'in:draft,active,paused,finished,archived'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
            'draw_at' => ['nullable', 'date'],

            'design' => ['nullable', 'array'],
            'design.background_color' => ['nullable', 'string', 'max:20'],
            'design.text_color' => ['nullable', 'string', 'max:20'],
            'design.button_color' => ['nullable', 'string', 'max:20'],
            'design.button_text_color' => ['nullable', 'string', 'max:20'],
        ]);

        $raffle->update($validated);

        return response()->json(
            $raffle->fresh()->load('prizes')->loadCount('numbers as sold_numbers_count')
        );
    }

    public function destroy(Request $request, Raffle $raffle): JsonResponse
    {
        $this->ensureAdmin($request);

        $hasOrders = $raffle->orders()->exists();

        if ($hasOrders) {
            $raffle->update([
                'status' => 'archived',
            ]);

            return response()->json([
                'message' => 'A rifa foi arquivada. Ela saiu do admin, mas continua no histórico dos clientes.',
                'mode' => 'archived',
            ]);
        }

        DB::transaction(function () use ($raffle) {
            $raffle->prizes()->delete();
            $raffle->numbers()->delete();
            $raffle->delete();
        });

        return response()->json([
            'message' => 'Rifa excluída com sucesso.',
            'mode' => 'deleted',
        ]);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless(
            $request->user() && $request->user()->role === 'admin',
            403,
            'Acesso restrito ao administrador.'
        );
    }
}