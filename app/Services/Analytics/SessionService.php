<?php

namespace App\Services\Analytics;

use App\Models\AnalyticsSession;
use App\Models\AnalyticsVisitor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SessionService
{
    public function resolve(Request $request, AnalyticsVisitor $visitor, UserAgentParser $parser): AnalyticsSession
    {
        if ($request->attributes->has('analytics_session')) {
            return $request->attributes->get('analytics_session');
        }

        $timeout = (int) config('analytics.session_timeout_minutes', 30);

        $session = AnalyticsSession::where('visitor_id', $visitor->id)
            ->whereNull('ended_at')
            ->where('last_activity_at', '>=', now()->subMinutes($timeout))
            ->latest('last_activity_at')
            ->first();

        if (!$session) {
            $ua = $parser->parse($request->userAgent());
            $path = '/' . ltrim($request->path(), '/');

            $session = AnalyticsSession::create([
                'uuid' => (string) Str::uuid(),
                'visitor_id' => $visitor->id,
                'started_at' => now(),
                'last_activity_at' => now(),
                'entry_path' => $path,
                'exit_path' => $path,
                'page_views' => 0,
                'device_type' => $ua['device_type'],
                'browser' => $ua['browser'],
                'os' => $ua['os'],
                'country' => $request->header('CF-IPCountry') ?: null,
                'referrer_domain' => $visitor->referrer_domain,
                'is_bounce' => false,
                'has_cart_activity' => false,
                'has_checkout' => false,
                'converted' => false,
            ]);

            $visitor->increment('total_sessions');
        }

        $request->attributes->set('analytics_session', $session);

        return $session;
    }

    public function closeStale(): int
    {
        $timeout = (int) config('analytics.session_timeout_minutes', 30);

        $sessions = AnalyticsSession::whereNull('ended_at')
            ->where('last_activity_at', '<', now()->subMinutes($timeout))
            ->get();

        foreach ($sessions as $session) {
            $session->update([
                'ended_at' => $session->last_activity_at,
                'duration_seconds' => max(0, (int) $session->started_at->diffInSeconds($session->last_activity_at)),
                'is_bounce' => $session->page_views <= 1,
            ]);
        }

        return $sessions->count();
    }
}
