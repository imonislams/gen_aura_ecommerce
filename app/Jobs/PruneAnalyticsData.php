<?php

namespace App\Jobs;

use App\Models\AnalyticsEvent;
use App\Models\AnalyticsSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PruneAnalyticsData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $cutoff = now()->subDays((int) config('analytics.retention_days', 90));

        AnalyticsEvent::where('occurred_at', '<', $cutoff)->delete();

        AnalyticsSession::where('started_at', '<', $cutoff)
            ->whereNotNull('ended_at')
            ->delete();
    }
}
