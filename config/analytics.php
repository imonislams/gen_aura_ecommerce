<?php

return [
    'enabled' => env('ANALYTICS_ENABLED', true),
    'timezone' => env('ANALYTICS_TIMEZONE', 'Asia/Dhaka'),
    'session_timeout_minutes' => 30,
    'abandonment_minutes' => 60,
    'retention_days' => 90,
    'exclude_admins' => true,
    'exclude_bots' => true,
    'cookie' => [
        'name' => 'genaura_vid',
        'minutes' => 60 * 24 * 365 * 2,
    ],
    'cache_ttl_seconds' => 60,
    'live_refresh_seconds' => 20,
];
