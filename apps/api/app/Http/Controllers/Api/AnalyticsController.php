<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AnalyticsDateRangeRequest;
use App\Services\AnalyticsQueryService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsQueryService $analytics) {}

    public function summary(AnalyticsDateRangeRequest $request): JsonResponse
    {
        return $this->respond($request, $this->analytics->summary($request->validated('from'), $request->validated('to')));
    }

    public function trends(AnalyticsDateRangeRequest $request): JsonResponse
    {
        return $this->respond($request, $this->analytics->trends($request->validated('from'), $request->validated('to')));
    }

    public function pages(AnalyticsDateRangeRequest $request): JsonResponse
    {
        return $this->respond($request, $this->analytics->popularPages($request->validated('from'), $request->validated('to')));
    }

    public function events(AnalyticsDateRangeRequest $request): JsonResponse
    {
        return $this->respond($request, $this->analytics->eventBreakdown($request->validated('from'), $request->validated('to')));
    }

    private function respond(AnalyticsDateRangeRequest $request, mixed $data): JsonResponse
    {
        return response()->json(['data' => $data, 'meta' => ['from' => $request->validated('from'), 'to' => $request->validated('to'), 'timezone' => 'UTC']]);
    }
}
