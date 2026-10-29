<?php

declare(strict_types=1);

namespace App\Jobs;

use AnalyticsPlatform\Sdk\AnalyticsClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class SendOrderAnalyticsJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $backoff = [5, 30, 120];

    public readonly string $eventId;

    public function __construct(
        public readonly string $orderNumber,
        public readonly int $itemCount,
        public readonly int $total,
        public readonly ?string $anonymousId = null,
        public readonly ?string $sessionId = null,
    ) {
        $this->eventId = (string) Str::uuid();
    }

    public function handle(): void
    {
        $analytics = new AnalyticsClient(
            (string) config('analytics.server_endpoint'),
            (string) config('analytics.server_write_key'),
        );

        $analytics->track(
            'order_created',
            [
                'order_number' => $this->orderNumber,
                'item_count' => $this->itemCount,
                'total' => $this->total,
                'currency' => 'INR',
            ],
            [
                'anonymous_id' => $this->anonymousId,
                'session_id' => $this->sessionId,
                'event_id' => $this->eventId,
            ],
        );
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('Order analytics job permanently failed.', [
            'order_number' => $this->orderNumber,
            'event_id' => $this->eventId,
            'error' => $exception?->getMessage(),
        ]);
    }
}
