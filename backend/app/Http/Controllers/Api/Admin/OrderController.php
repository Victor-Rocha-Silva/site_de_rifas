<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MarkOrderAsPaidService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:pending_payment,paid'],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $orders = Order::query()
            ->with([
                'raffle',
                'customer',
                'numbers' => fn ($q) => $q->orderBy('number'),
            ])
            ->when($validated['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('public_id', 'like', "%{$search}%")
                        ->orWhere('payment_reference', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($customerQuery) use ($search) {
                            $customerQuery
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        })
                        ->orWhereHas('raffle', function ($raffleQuery) use ($search) {
                            $raffleQuery->where('title', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->ensureAdmin($request);

        return response()->json(
            $order->load([
                'raffle',
                'customer',
                'numbers' => fn ($q) => $q->orderBy('number'),
            ])
        );
    }

    public function markAsPaid(
        Request $request,
        Order $order,
        MarkOrderAsPaidService $markOrderAsPaidService
    ): JsonResponse {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'payment_provider' => ['nullable', 'string', 'max:30'],
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'payment_id' => ['nullable', 'string', 'max:255'],
        ]);

        $order = $markOrderAsPaidService->handle($order, [
            'payment_provider' => $validated['payment_provider'] ?? 'manual',
            'payment_reference' => $validated['payment_reference'] ?? null,
            'payment_id' => $validated['payment_id'] ?? null,
            'metadata' => [
                'approved_by_admin' => true,
            ],
        ]);

        return response()->json([
            'message' => 'Pagamento aprovado e números gerados com sucesso.',
            'order' => $order,
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