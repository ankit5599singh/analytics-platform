<?php

return [
    'write_key' => env('ANALYTICS_WRITE_KEY'),
    'read_key' => env('ANALYTICS_READ_KEY'),
    'server_write_key' => env('ANALYTICS_SERVER_WRITE_KEY'),
    'server_endpoint' => env('ANALYTICS_SERVER_ENDPOINT', 'http://127.0.0.1:8000/api/v1/server/events'),
];
