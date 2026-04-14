<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class UploadController extends Controller
{
    public function image(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $path = $validated['image']->store('uploads', 'public');

        return response()->json([
            'message' => 'Imagem enviada com sucesso.',
            'path' => '/storage/' . $path,
            'url' => Storage::disk('public')->url($path),
        ], Response::HTTP_CREATED);
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