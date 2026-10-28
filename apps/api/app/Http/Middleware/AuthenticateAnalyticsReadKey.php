<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateAnalyticsReadKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $expectedKey = (string) config('analytics.read_key', '');
        $providedKey = (string) $request->header('X-Analytics-Read-Key', '');
        if ($expectedKey === '' || $providedKey === '' || ! hash_equals($expectedKey, $providedKey)) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        return $next($request);
    }
}
