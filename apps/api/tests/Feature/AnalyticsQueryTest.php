<?php

namespace Tests\Feature;

use App\Models\AnalyticsEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsQueryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['analytics.read_key' => 'local-dashboard-read-secret-change-me']);
        $this->withHeader('X-Analytics-Read-Key', 'local-dashboard-read-secret-change-me');
    }

    private function createEvent(
        string $eventId,
        string $name,
        string $occurredAt,
        ?string $anonymousId,
        ?string $sessionId,
        ?string $pageUrl = null,
        ?string $pageTitle = null,
    ): void {
        AnalyticsEvent::create([
            'event_id' => $eventId,
            'event_name' => $name,
            'source' => 'browser',
            'anonymous_id' => $anonymousId,
            'session_id' => $sessionId,
            'user_id' => null,
            'occurred_at' => $occurredAt,
            'received_at' => $occurredAt,
            'page_url' => $pageUrl,
            'page_title' => $pageTitle,
            'referrer' => null,
            'properties' => [],
        ]);
    }

    public function test_summary_returns_correct_metrics(): void
    {
        $this->createEvent(
            '019a8f01-7a22-7c10-8c5d-1a2b3c4d5e61',
            'page_view',
            '2026-01-10 10:00:00',
            'visitor-1',
            'session-1',
            '/menu',
            'Menu'
        );

        $this->createEvent(
            '019a8f01-7a22-7c10-8c5d-1a2b3c4d5e62',
            'page_view',
            '2026-01-10 11:00:00',
            'visitor-1',
            'session-1',
            '/menu',
            'Menu'
        );

        $this->createEvent(
            '019a8f01-7a22-7c10-8c5d-1a2b3c4d5e63',
            'order_created',
            '2026-01-10 12:00:00',
            'visitor-2',
            'session-2'
        );

        $response = $this->getJson('/api/v1/analytics/summary?from=2026-01-10&to=2026-01-10');

        $response->assertOk()
            ->assertJsonPath('data.total_events', 3)
            ->assertJsonPath('data.page_views', 2)
            ->assertJsonPath('data.unique_visitors', 2)
            ->assertJsonPath('data.sessions', 2)
            ->assertJsonPath('meta.timezone', 'UTC');
    }

    public function test_trends_include_days_with_zero_events(): void
    {
        $this->createEvent(
            '019a8f01-7a22-7c10-8c5d-1a2b3c4d5e64',
            'page_view',
            '2026-01-10 10:00:00',
            'visitor-1',
            'session-1',
            '/menu',
            'Menu'
        );

        $response = $this->getJson('/api/v1/analytics/trends?from=2026-01-10&to=2026-01-12');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.total_events', 1)
            ->assertJsonPath('data.1.total_events', 0)
            ->assertJsonPath('data.2.total_events', 0);
    }

    public function test_pages_are_ordered_by_view_count(): void
    {
        $this->createEvent(
            '019a8f01-7a22-7c10-8c5d-1a2b3c4d5e65',
            'page_view',
            '2026-01-10 10:00:00',
            'visitor-1',
            'session-1',
            '/menu',
            'Menu'
        );

        $this->createEvent(
            '019a8f01-7a22-7c10-8c5d-1a2b3c4d5e66',
            'page_view',
            '2026-01-10 11:00:00',
            'visitor-2',
            'session-2',
            '/menu',
            'Menu'
        );

        $this->createEvent(
            '019a8f01-7a22-7c10-8c5d-1a2b3c4d5e67',
            'page_view',
            '2026-01-10 12:00:00',
            'visitor-3',
            'session-3',
            '/about',
            'About'
        );

        $response = $this->getJson('/api/v1/analytics/pages?from=2026-01-10&to=2026-01-10');

        $response->assertOk()
            ->assertJsonPath('data.0.url', '/menu')
            ->assertJsonPath('data.0.views', 2)
            ->assertJsonPath('data.1.url', '/about')
            ->assertJsonPath('data.1.views', 1);
    }

    public function test_invalid_date_ranges_are_rejected(): void
    {
        $this->getJson('/api/v1/analytics/summary?from=2026-01-10&to=2026-01-09')->assertUnprocessable();
        $this->getJson('/api/v1/analytics/summary?from=2026-01-01&to=2026-04-01')->assertUnprocessable();
    }

    public function test_summary_rejects_missing_read_key(): void
    {
        $this->withHeaders(['X-Analytics-Read-Key' => ''])->getJson('/api/v1/analytics/summary')->assertUnauthorized();
    }

    public function test_summary_rejects_invalid_read_key(): void
    {
        $this->withHeader('X-Analytics-Read-Key', 'wrong-key')->getJson('/api/v1/analytics/summary')->assertUnauthorized();
    }
}
