<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Raffle;
use Illuminate\Http\JsonResponse;

class RaffleController extends Controller
{
    public function index(): JsonResponse
    {
        $raffles = Raffle::query()
            ->where('status', 'active')
            ->with(['prizes'])
            ->orderByDesc('id')
            ->get()
            ->map(function ($raffle) {
                return $this->formatRaffle($raffle);
            });

        return response()->json($raffles);
    }

    public function show(string $slug): JsonResponse
    {
        $raffle = Raffle::query()
            ->where('slug', $slug)
            ->with(['prizes'])
            ->firstOrFail();

        return response()->json($this->formatRaffle($raffle));
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
            'title' => $raffle->title,
            'slug' => $raffle->slug,
            'subtitle' => $raffle->subtitle,
            'description' => $raffle->description,
            'banner_path' => $raffle->banner_path,
            'logo_path' => $raffle->logo_path,
            'instagram_url' => $raffle->instagram_url,
            'price_per_ticket' => $raffle->price_per_ticket,
            'total_numbers' => $raffle->total_numbers,
            'sold_numbers_count' => $soldNumbersCount,
            'available_numbers_count' => $availableNumbersCount,
            'status' => $raffle->status,
            'starts_at' => $raffle->starts_at,
            'ends_at' => $raffle->ends_at,
            'draw_at' => $raffle->draw_at,

            'design' => [
                'background_color' => $raffle->background_color ?? '#0f172a',
                'text_color' => $raffle->text_color ?? '#ffffff',
                'button_color' => $raffle->button_color ?? '#7c3aed',
                'button_text_color' => $raffle->button_text_color ?? '#ffffff',
            ],

            'prizes' => $raffle->prizes->map(function ($prize) {
                return [
                    'id' => $prize->id,
                    'raffle_id' => $prize->raffle_id,
                    'title' => $prize->title,
                    'description' => $prize->description,
                    'image_path' => $prize->image_path,
                    'sort_order' => $prize->sort_order,
                    'created_at' => $prize->created_at,
                    'updated_at' => $prize->updated_at,
                ];
            })->values(),
        ];
    }
}