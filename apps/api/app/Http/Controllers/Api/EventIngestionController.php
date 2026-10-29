<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAnalyticsEventRequest;
use App\Services\EventIngestionService;
use Illuminate\Http\JsonResponse;

class EventIngestionController extends Controller
{
    public function __construct(private readonly EventIngestionService $ingestion) {}

    public function store(StoreAnalyticsEventRequest $request): JsonResponse
    {
        $data = $request->validated();
        if ($data['source'] !== 'browser') {
            return response()->json(['message' => 'Only browser events are accepted on this endpoint.'], 403);
        }

        $expectedKey = (string) config('analytics.write_key', '');
        $providedKey = (string) $request->header('X-Analytics-Write-Key', '');
        if ($expectedKey === '' || $providedKey === '' || ! hash_equals($expectedKey, $providedKey)) {
            return response()->json(['message' => 'Invalid analytics write key.'], 401);
        }

        return $this->ingestResponse($data);
    }

    public function storeServer(StoreAnalyticsEventRequest $request): JsonResponse
    {
        if (! $request->attributes->get('trusted_server_sdk', false)) {
            return response()->json(['message' => 'Server authentication is required.'], 401);
        }

        $data = $request->validated();
        if ($data['source'] !== 'server') {
            return response()->json(['message' => 'Only server events are accepted on this endpoint.'], 422);
        }

        return $this->ingestResponse($data);
    }

    private function ingestResponse(array $data): JsonResponse
    {
        $result = $this->ingestion->ingest($data);

        return response()->json($result['body'], $result['status']);
    }
}
