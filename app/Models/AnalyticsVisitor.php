<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnalyticsVisitor extends Model
{
    protected $fillable = [
        'uuid', 'first_seen_at', 'last_seen_at', 'first_landing_path', 'last_path',
        'referrer_domain', 'device_type', 'browser', 'os', 'country',
        'total_sessions', 'total_page_views', 'has_ordered',
    ];

    protected $casts = [
        'first_seen_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'total_sessions' => 'integer',
        'total_page_views' => 'integer',
        'has_ordered' => 'boolean',
    ];

    public function sessions(): HasMany
    {
        return $this->hasMany(AnalyticsSession::class, 'visitor_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(AnalyticsEvent::class, 'visitor_id');
    }
}
