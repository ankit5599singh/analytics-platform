<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\RestaurantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function __construct(private readonly RestaurantService $restaurant) {}

    public function menu(): JsonResponse
    {
        return response()->json(['data' => $this->restaurant->menu()]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => ['nullable', 'string', 'max:100'],
            'items' => ['required', 'array', 'min:1', 'max:20'],
            'items.*.item_id' => [
                'required',
                'string',
                'distinct',
                'in:' . implode(',', array_keys(config('restaurant.menu', []))),
            ],
            'items.*.quantity' => [
                'required',
                'integer',
                'min:1',
                'max:20',
            ],
            'anonymous_id' => ['nullable', 'string', 'max:64'],
            'session_id' => ['nullable', 'string', 'max:64'],
        ]);

        /** @var Order $order */
        $order = $this->restaurant->createOrder($validated);

        return response()->json([
            'data' => [
                'order_number' => $order->order_number,
                'items' => $order->items,
                'total' => $order->total,
                'currency' => 'INR',
                'status' => $order->status,
            ],
        ], 201);
    }
}
