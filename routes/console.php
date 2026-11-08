<?php

use App\Jobs\BuildDailySummary;
use App\Jobs\CloseStaleSessions;
use App\Jobs\PruneAnalyticsData;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('analytics:rollup {date?}', function ($date = null) {
    (new BuildDailySummary($date))->handle();
    $this->info('Analytics rollup complete for ' . ($date ?: 'yesterday'));
});

Schedule::job(new CloseStaleSessions)->hourly();
Schedule::job(new PruneAnalyticsData)->daily();
Schedule::job(new BuildDailySummary)->dailyAt('01:00');
