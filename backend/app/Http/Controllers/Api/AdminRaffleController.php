<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Raffle;
use App\Models\RaffleNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminRaffleController extends Controller
{
    public function index(): JsonResponse
    {
        $raffles = Raffle::query()
            ->with(['prizes'])
            ->orderByDesc('id')
            ->get()
            ->map(fn ($raffle) => $this->formatRaffle($raffle));

        return response()->json($raffles);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:raffles,slug'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'instagram_url' => ['nullable', 'string', 'max:255'],
            'banner_path' => ['nullable', 'string', 'max:255'],
            'logo_path' => ['nullable', 'string', 'max:255'],

            'total_numbers' => ['required', 'integer', 'min:1', 'max:100000'],
            'price_per_ticket' => ['required', 'numeric', 'min:0.01'],

            'status' => ['nullable', 'string', 'max:30'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
            'draw_at' => ['nullable', 'date'],

            'design' => ['nullable', 'array'],
        ]);

        $raffle = DB::transaction(function () use ($request, $validated) {
            $slug = $validated['slug'] ?? Str::slug($validated['title']);

            $originalSlug = $slug;
            $counter = 2;

            while (Raffle::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $raffle = Raffle::create([
                'created_by_user_id' => optional($request->user())->id,
                'title' => $validated['title'],
                'slug' => $slug,
                'subtitle' => $validated['subtitle'] ?? null,
                'description' => $validated['description'] ?? null,
                'instagram_url' => $validated['instagram_url'] ?? null,
                'banner_path' => $validated['banner_path'] ?? null,
                'logo_path' => $validated['logo_path'] ?? null,
                'total_numbers' => $validated['total_numbers'],
                'price_per_ticket' => $validated['price_per_ticket'],
                'status' => $validated['status'] ?? 'active',
                'starts_at' => $validated['starts_at'] ?? null,
                'ends_at' => $validated['ends_at'] ?? null,
                'draw_at' => $validated['draw_at'] ?? null,
                'design' => $validated['design'] ?? [
                    'background_color' => '#0f172a',
                    'text_color' => '#ffffff',
                    'button_color' => '#7c3aed',
                    'button_text_color' => '#ffffff',
                ],
            ]);

            $this->createRaffleNumbers($raffle);

            return $raffle;
        });

        return response()->json([
            'message' => 'Rifa criada com sucesso.',
            'raffle' => $this->formatRaffle($raffle->fresh(['prizes'])),
        ], 201);
    }

    public function show(Raffle $raffle): JsonResponse
    {
        $raffle->load(['prizes']);

        return response()->json($this->formatRaffle($raffle));
    }

    public function update(Request $request, Raffle $raffle): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', 'unique:raffles,slug,' . $raffle->id],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'instagram_url' => ['nullable', 'string', 'max:255'],
            'banner_path' => ['nullable', 'string', 'max:255'],
            'logo_path' => ['nullable', 'string', 'max:255'],

            'total_numbers' => ['sometimes', 'required', 'integer', 'min:1', 'max:100000'],
            'price_per_ticket' => ['sometimes', 'required', 'numeric', 'min:0.01'],

            'status' => ['nullable', 'string', 'max:30'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
            'draw_at' => ['nullable', 'date'],

            'design' => ['nullable', 'array'],
        ]);

        DB::transaction(function () use ($raffle, $validated) {
            if (isset($validated['title']) && empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['title']);
            }

            $oldTotal = (int) $raffle->total_numbers;

            $raffle->update($validated);

            $newTotal = (int) $raffle->fresh()->total_numbers;

            if ($newTotal > $oldTotal) {
                $this->addMissingNumbers($raffle->fresh(), $oldTotal + 1, $newTotal);
            }
        });

        return response()->json([
            'message' => 'Rifa atualizada com sucesso.',
            'raffle' => $this->formatRaffle($raffle->fresh(['prizes'])),
        ]);
    }

    public function destroy(Raffle $raffle): JsonResponse
    {
        $raffle->delete();

        return response()->json([
            'message' => 'Rifa excluída com sucesso.',
        ]);
    }

    private function createRaffleNumbers(Raffle $raffle): void
    {
        $numbers = [];

        for ($number = 1; $number <= (int) $raffle->total_numbers; $number++) {
            $numbers[] = [
                'raffle_id' => $raffle->id,
                'number' => $number,
                'status' => 'available',
                'order_id' => null,
                'customer_user_id' => null,
                'assigned_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        foreach (array_chunk($numbers, 1000) as $chunk) {
            RaffleNumber::insert($chunk);
        }
    }

    private function addMissingNumbers(Raffle $raffle, int $start, int $end): void
    {
        $numbers = [];

        for ($number = $start; $number <= $end; $number++) {
            $numbers[] = [
                'raffle_id' => $raffle->id,
                'number' => $number,
                'status' => 'available',
                'order_id' => null,
                'customer_user_id' => null,
                'assigned_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        foreach (array_chunk($numbers, 1000) as $chunk) {
            RaffleNumber::insert($chunk);
        }
    }

    private function formatRaffle(Raffle $raffle): array
    {
        $soldNumbersCount = $raffle->numbers()
            ->where('status', 'sold')
            ->count();

        $availableNumbersCount = $raffle->numbers()
            ->where('status', 'available')
            ->count();

        return [
            'id' => $raffle->id,
            'created_by_user_id' => $raffle->created_by_user_id,
            'title' => $raffle->title,
            'slug' => $raffle->slug,
            'subtitle' => $raffle->subtitle,
            'description' => $raffle->description,
            'instagram_url' => $raffle->instagram_url,
            'banner_path' => $raffle->banner_path,
            'logo_path' => $raffle->logo_path,
            'total_numbers' => $raffle->total_numbers,
            'price_per_ticket' => $raffle->price_per_ticket,
            'status' => $raffle->status,
            'starts_at' => $raffle->starts_at,
            'ends_at' => $raffle->ends_at,
            'draw_at' => $raffle->draw_at,
            'design' => $raffle->design,
            'sold_numbers_count' => $soldNumbersCount,
            'available_numbers_count' => $availableNumbersCount,
            'created_at' => $raffle->created_at,
            'updated_at' => $raffle->updated_at,
            'prizes' => $raffle->prizes ?? [],
        ];
    }
}