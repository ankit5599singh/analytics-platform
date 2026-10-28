<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\SendOrderAnalyticsJob;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RestaurantService
{
    public function menu(): array
    {
        return array_values(config('restaurant.menu', []));
    }

    public function createOrder(array $validated): Order
    {
        $menu = config('restaurant.menu', []);
        $orderItems = [];
        $total = 0;

        foreach ($validated['items'] as $requestedItem) {
            $item = $menu[$requestedItem['item_id']];
            $quantity = (int) $requestedItem['quantity'];
            $lineTotal = (int) $item['price'] * $quantity;
            $orderItems[] = [
                'item_id' => $item['id'],
                'name' => $item['name'],
                'unit_price' => (int) $item['price'],
                'quantity' => $quantity,
                'line_total' => $lineTotal,
            ];
            $total += $lineTotal;
        }

        $order = DB::transaction(function () use ($validated, $orderItems, $total): Order {
            return Order::create([
                'order_number' => (string) Str::uuid(),
                'customer_name' => $validated['customer_name'] ?? null,
                'items' => $orderItems,
                'total' => $total,
                'status' => 'created',
            ]);
        });

        SendOrderAnalyticsJob::dispatch(
            $order->order_number,
            array_sum(array_column($orderItems, 'quantity')),
            $total,
            $validated['anonymous_id'] ?? null,
            $validated['session_id'] ?? null,
        )->afterCommit();

        return $order;
    }
}
