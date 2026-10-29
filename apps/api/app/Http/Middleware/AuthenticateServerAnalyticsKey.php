<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateServerAnalyticsKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $expectedKey = (string) config('analytics.server_write_key', '');
        $providedKey = (string) $request->header('X-Analytics-Server-Key', '');

        if ($expectedKey === '' || $providedKey === '' || ! hash_equals($expectedKey, $providedKey)) {
            return response()->json(['message' => 'Invalid server analytics credentials.'], 401);
        }

        $request->attributes->set('trusted_server_sdk', true);

        return $next($request);
    }
}
