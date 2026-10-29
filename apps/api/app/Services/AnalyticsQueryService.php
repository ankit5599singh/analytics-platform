<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class AnalyticsQueryService
{
    private function eventsBetween(string $from, string $to): Builder
    {
        $start = CarbonImmutable::createFromFormat('!Y-m-d', $from, 'UTC');
        $endExclusive = CarbonImmutable::createFromFormat('!Y-m-d', $to, 'UTC')->addDay();

        return AnalyticsEvent::query()->where('occurred_at', '>=', $start)->where('occurred_at', '<', $endExclusive);
    }

    public function summary(string $from, string $to): array
    {
        $query = $this->eventsBetween($from, $to);

        return [
            'total_events' => (clone $query)->count(),
            'page_views' => (clone $query)->where('event_name', 'page_view')->count(),
            'unique_visitors' => (clone $query)->whereNotNull('anonymous_id')->distinct()->count('anonymous_id'),
            'sessions' => (clone $query)->whereNotNull('session_id')->distinct()->count('session_id'),
        ];
    }

    public function trends(string $from, string $to): array
    {
        $rows = $this->eventsBetween($from, $to)->selectRaw(
            'DATE(occurred_at) AS date, COUNT(*) AS total_events,
                SUM(CASE WHEN event_name = ? THEN 1 ELSE 0 END) AS page_views,
                COUNT(DISTINCT anonymous_id) AS unique_visitors',
            ['page_view']
        )->groupByRaw('DATE(occurred_at)')->orderBy('date')->get()->keyBy('date');

        $period = CarbonPeriod::create(
            CarbonImmutable::createFromFormat('!Y-m-d', $from, 'UTC'),
            CarbonImmutable::createFromFormat('!Y-m-d', $to, 'UTC')
        );

        $trends = [];
        foreach ($period as $day) {
            $date = $day->toDateString();
            $row = $rows->get($date);
            $trends[] = [
                'date' => $date,
                'total_events' => (int) ($row->total_events ?? 0),
                'page_views' => (int) ($row->page_views ?? 0),
                'unique_visitors' => (int) ($row->unique_visitors ?? 0),
            ];
        }

        return $trends;
    }

    public function popularPages(string $from, string $to): Collection
    {
        return $this->eventsBetween($from, $to)
            ->where('event_name', 'page_view')
            ->whereNotNull('page_url')
            ->selectRaw('page_url, MAX(page_title) AS page_title, COUNT(*) AS views')
            ->groupBy('page_url')
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'url' => $row->page_url,
                'title' => $row->page_title,
                'views' => (int) $row->views,
            ]);
    }

    public function eventBreakdown(string $from, string $to): Collection
    {
        return $this->eventsBetween($from, $to)
            ->selectRaw('event_name, COUNT(*) AS total')
            ->groupBy('event_name')
            ->orderByDesc('total')
            ->limit(20)
            ->get()
            ->map(fn ($row) => ['event_name' => $row->event_name, 'total' => (int) $row->total]);
    }
}
