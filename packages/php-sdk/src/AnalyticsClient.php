<?php

declare(strict_types=1);

namespace AnalyticsPlatform\Sdk;

use RuntimeException;
use JsonException;

final class AnalyticsClient
{
    public function __construct(
        private readonly string $endpoint,
        private readonly string $serverWriteKey,
        private readonly int $timeoutSeconds = 3,
    ) {
        if (trim($this->endpoint) === '' || trim($this->serverWriteKey) === '') {
            throw new RuntimeException('Analytics endpoint and server write key are required.');
        }

        if ($this->timeoutSeconds < 1) {
            throw new RuntimeException('Analytics timeout must be at least one second.');
        }
    }

    /**
     * Send a server-side analytics event.
     *
     * @throws RuntimeException
     * @throws JsonException
     */
    public function track(string $eventName, array $properties = [], array $context = []): array
    {
        $eventName = trim($eventName);
        if ($eventName === '') {
            throw new RuntimeException('Analytics event name cannot be empty.');
        }

        $payload = [
            'event_id' => $context['event_id'] ?? $this->uuidV4(),
            'event_name' => $eventName,
            'source' => 'server',
            'anonymous_id' => $context['anonymous_id'] ?? null,
            'session_id' => $context['session_id'] ?? null,
            'user_id' => isset($context['user_id']) ? (string) $context['user_id'] : null,
            'occurred_at' => gmdate('c'),
            'properties' => $properties,
        ];

        $body = json_encode($payload, JSON_THROW_ON_ERROR);

        $httpContext = stream_context_create([
            'http' => [
                'method' => 'POST',
                'timeout' => $this->timeoutSeconds,
                'ignore_errors' => true,
                'follow_location' => 0,
                'header' => implode("\r\n", [
                    'Content-Type: application/json',
                    'Accept: application/json',
                    'X-Analytics-Server-Key: ' . $this->serverWriteKey,
                    'Connection: close',
                ]),
                'content' => $body,
            ],
        ]);

        error_clear_last();
        $response = @file_get_contents($this->endpoint, false, $httpContext);
        $lastError = error_get_last();
        $statusLine = $http_response_header[0] ?? '';
        $status = 0;
        if (preg_match('/^HTTP\/\S+\s+(\d{3})\b/', $statusLine, $matches) === 1) {
            $status = (int) $matches[1];
        }

        if ($response === false || $status < 200 || $status >= 300) {
            $message = $response === false ? ($lastError['message'] ?? 'No HTTP response received.') : trim($response);
            throw new RuntimeException(sprintf('Analytics request failed (HTTP %d): %s', $status, $message !== '' ? $message : 'Empty HTTP response.'));
        }

        $decoded = json_decode($response, true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($decoded)) {
            throw new RuntimeException('Analytics API returned an unexpected response format.');
        }

        return $decoded;
    }

    private function uuidV4(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);

        return sprintf(
            '%s-%s-%s-%s-%s',
            substr($hex, 0, 8),
            substr($hex, 8, 4),
            substr($hex, 12, 4),
            substr($hex, 16, 4),
            substr($hex, 20, 12),
        );
    }
}
