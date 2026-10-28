<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventIngestionTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp();
        config([
            'analytics.write_key' => 'test-write-key',
            'analytics.server_write_key' => 'test-server-key',
        ]);
    }

    private function validEvent(array $overrides = []): array
    {
        return array_merge([
            'event_id' => '019a8f01-7a22-7c10-8c5d-1a2b3c4d5e6f',
            'event_name' => 'page_view',
            'source' => 'browser',
            'anonymous_id' => 'visitor-test-001',
            'session_id' => 'session-test-001',
            'occurred_at' => now()->toIso8601String(),
            'page' => ['url' => '/menu', 'title' => 'Restaurant Menu'],
            'properties' => ['category' => 'food'],
        ], $overrides);
    }

    public function test_it_accepts_and_stores_a_valid_event(): void
    {
        $this->withHeader('X-Analytics-Write-Key', 'test-write-key')
            ->postJson('/api/v1/events', $this->validEvent())
            ->assertAccepted()
            ->assertJsonPath('status', 'accepted');

        $this->assertDatabaseHas('analytics_events', [
            'event_id' => '019a8f01-7a22-7c10-8c5d-1a2b3c4d5e6f',
            'event_name' => 'page_view',
            'anonymous_id' => 'visitor-test-001',
        ]);
    }

    public function test_it_does_not_store_duplicate_events(): void
    {
        $payload = $this->validEvent();
        $this->withHeader('X-Analytics-Write-Key', 'test-write-key')->postJson('/api/v1/events', $payload)->assertAccepted();
        $this->withHeader('X-Analytics-Write-Key', 'test-write-key')
            ->postJson('/api/v1/events', $payload)
            ->assertOk()
            ->assertJsonPath('status', 'duplicate');
        $this->assertDatabaseCount('analytics_events', 1);
    }

    public function test_it_rejects_an_invalid_write_key(): void
    {
        $this->withHeader('X-Analytics-Write-Key', 'wrong-key')
            ->postJson('/api/v1/events', $this->validEvent())
            ->assertUnauthorized();
        $this->assertDatabaseCount('analytics_events', 0);
    }

    public function test_it_rejects_an_invalid_event_name(): void
    {
        $this->withHeader('X-Analytics-Write-Key', 'test-write-key')
            ->postJson('/api/v1/events', $this->validEvent([
                'event_name' => '<script>alert(1)</script>',
            ]))->assertUnprocessable();
        $this->assertDatabaseCount('analytics_events', 0);
    }

    public function test_it_rejects_browser_forged_server_events(): void
    {
        $this->withHeader('X-Analytics-Write-Key', 'test-write-key')
            ->postJson('/api/v1/events', $this->validEvent([
                'source' => 'server',
                'event_name' => 'order_created',
            ]))->assertForbidden();
        $this->assertDatabaseCount('analytics_events', 0);
    }

    public function test_server_endpoint_accepts_authenticated_server_events(): void
    {
        $event = $this->validEvent(['event_name' => 'order_created', 'source' => 'server']);
        $this->withHeader('X-Analytics-Server-Key', 'test-server-key')
            ->postJson('/api/v1/server/events', $event)
            ->assertAccepted()
            ->assertJsonPath('status', 'accepted');

        $this->assertDatabaseHas('analytics_events', [
            'event_id' => $event['event_id'],
            'event_name' => 'order_created',
            'source' => 'server',
        ]);
    }

    public function test_server_endpoint_rejects_invalid_credentials(): void
    {
        $event = $this->validEvent(['event_name' => 'order_created', 'source' => 'server']);
        $this->withHeader('X-Analytics-Server-Key', 'wrong-server-key')
            ->postJson('/api/v1/server/events', $event)
            ->assertUnauthorized();

        $this->assertDatabaseMissing('analytics_events', ['event_id' => $event['event_id']]);
    }

    public function test_server_endpoint_rejects_browser_events(): void
    {
        $event = $this->validEvent(['event_name' => 'page_view', 'source' => 'browser']);
        $this->withHeader('X-Analytics-Server-Key', 'test-server-key')
            ->postJson('/api/v1/server/events', $event)
            ->assertUnprocessable();

        $this->assertDatabaseMissing('analytics_events', ['event_id' => $event['event_id']]);
    }
}
