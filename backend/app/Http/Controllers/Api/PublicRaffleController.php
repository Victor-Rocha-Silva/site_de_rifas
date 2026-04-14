<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Raffle;
use Illuminate\Http\JsonResponse;

class PublicRaffleController extends Controller
{
    public function index(): JsonResponse
    {
        $raffles = Raffle::query()
            ->where('status', 'active')
            ->with('prizes')
            ->withCount([
                'numbers as sold_numbers_count' => fn ($q) => $q->where('status', 'sold'),
            ])
            ->latest()
            ->get()
            ->map(function (Raffle $raffle) {
                return [
                    'id' => $raffle->id,
                    'title' => $raffle->title,
                    'slug' => $raffle->slug,
                    'subtitle' => $raffle->subtitle,
                    'banner_path' => $raffle->banner_path,
                    'logo_path' => $raffle->logo_path,
                    'instagram_url' => $raffle->instagram_url,
                    'price_per_ticket' => $raffle->price_per_ticket,
                    'total_numbers' => $raffle->total_numbers,
                    'sold_numbers_count' => $raffle->sold_numbers_count,
                    'available_numbers_count' => $raffle->total_numbers - $raffle->sold_numbers_count,
                    'design' => $raffle->design,
                    'prizes' => $raffle->prizes,
                ];
            });

        return response()->json($raffles);
    }

    public function show(string $slug): JsonResponse
    {
        $raffle = Raffle::query()
            ->where('slug', $slug)
            ->where('status', 'active')
            ->with('prizes')
            ->withCount([
                'numbers as sold_numbers_count' => fn ($q) => $q->where('status', 'sold'),
            ])
            ->firstOrFail();

        return response()->json([
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
            'sold_numbers_count' => $raffle->sold_numbers_count,
            'available_numbers_count' => $raffle->total_numbers - $raffle->sold_numbers_count,
            'starts_at' => $raffle->starts_at,
            'ends_at' => $raffle->ends_at,
            'draw_at' => $raffle->draw_at,
            'design' => $raffle->design,
            'prizes' => $raffle->prizes,
        ]);
    }
}