<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class EventIngestionService
{
    public function ingest(array $data): array
    {
        $page = $data['page'] ?? [];
        $now = now();
        $event = [
            'event_id' => $data['event_id'],
            'event_name' => $data['event_name'],
            'source' => $data['source'],
            'anonymous_id' => $data['anonymous_id'] ?? null,
            'session_id' => $data['session_id'] ?? null,
            'user_id' => $data['user_id'] ?? null,
            'occurred_at' => $data['occurred_at'],
            'received_at' => $now,
            'page_url' => $page['url'] ?? null,
            'page_title' => $page['title'] ?? null,
            'referrer' => $page['referrer'] ?? null,
            'properties' => isset($data['properties']) ? json_encode($data['properties']) : null,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        $inserted = DB::table('analytics_events')->insertOrIgnore($event);
        if ($inserted === 1) {
            return ['body' => ['status' => 'accepted', 'event_id' => $data['event_id']], 'status' => 202];
        }

        $duplicateExists = DB::table('analytics_events')->where('event_id', $data['event_id'])->exists();
        if ($duplicateExists) {
            return ['body' => ['status' => 'duplicate', 'event_id' => $data['event_id']], 'status' => 200];
        }

        return ['body' => ['message' => 'Event could not be stored.'], 'status' => 500];
    }
}
