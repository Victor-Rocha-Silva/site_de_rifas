<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Raffle;
use App\Services\GenerateRaffleNumbersService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RaffleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $raffles = Raffle::query()
            ->with('prizes')
            ->withCount([
                'numbers as sold_numbers_count' => fn ($q) => $q->where('status', 'sold'),
            ])
            ->latest()
            ->get();

        return response()->json($raffles);
    }

    public function show(Request $request, Raffle $raffle): JsonResponse
    {
        $this->ensureAdmin($request);

        $raffle->load('prizes');
        $raffle->loadCount([
            'numbers as sold_numbers_count' => fn ($q) => $q->where('status', 'sold'),
        ]);

        return response()->json($raffle);
    }

    public function store(Request $request, GenerateRaffleNumbersService $numberGenerator): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'banner_path' => ['nullable', 'string', 'max:255'],
            'logo_path' => ['nullable', 'string', 'max:255'],
            'total_numbers' => ['required', 'integer', 'min:1', 'max:100000'],
            'price_per_ticket' => ['required', 'numeric', 'min:0.01'],
            'status' => ['required', 'in:draft,active,paused,finished'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'draw_at' => ['nullable', 'date'],
            'design' => ['nullable', 'array'],
            'design.background_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6})$/'],
            'design.text_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6})$/'],
            'design.button_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6})$/'],
            'design.button_text_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6})$/'],
            'prizes' => ['nullable', 'array'],
            'prizes.*.title' => ['required_with:prizes', 'string', 'max:255'],
            'prizes.*.description' => ['nullable', 'string'],
            'prizes.*.image_path' => ['nullable', 'string', 'max:255'],
            'prizes.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $raffle = DB::transaction(function () use ($request, $validated, $numberGenerator) {
            $raffle = Raffle::create([
                'created_by_user_id' => $request->user()->id,
                'title' => $validated['title'],
                'slug' => $this->makeUniqueSlug($validated['title']),
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
                $raffle->prizes()->createMany(
                    collect($validated['prizes'])->map(fn ($prize) => [
                        'title' => $prize['title'],
                        'description' => $prize['description'] ?? null,
                        'image_path' => $prize['image_path'] ?? null,
                        'sort_order' => $prize['sort_order'] ?? 0,
                    ])->toArray()
                );
            }

            $numberGenerator->handle($raffle);

            return $raffle->load('prizes');
        });

        return response()->json($raffle, Response::HTTP_CREATED);
    }

    public function update(Request $request, Raffle $raffle): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'banner_path' => ['nullable', 'string', 'max:255'],
            'logo_path' => ['nullable', 'string', 'max:255'],
            'price_per_ticket' => ['sometimes', 'numeric', 'min:0.01'],
            'status' => ['sometimes', 'in:draft,active,paused,finished'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'draw_at' => ['nullable', 'date'],
            'design' => ['nullable', 'array'],
            'design.background_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6})$/'],
            'design.text_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6})$/'],
            'design.button_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6})$/'],
            'design.button_text_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6})$/'],
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = $this->makeUniqueSlug($validated['title'], $raffle->id);
        }

        $raffle->update($validated);

        return response()->json($raffle->fresh('prizes'));
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless(
            $request->user() && $request->user()->role === 'admin',
            Response::HTTP_FORBIDDEN,
            'Acesso restrito ao administrador.'
        );
    }

    private function makeUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base !== '' ? $base : 'rifa';
        $counter = 1;

        while (
            Raffle::query()
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $counter++;
            $slug = "{$base}-{$counter}";
        }

        return $slug;
    }
}