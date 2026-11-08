<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnalyticsSession extends Model
{
    protected $fillable = [
        'uuid', 'visitor_id', 'started_at', 'last_activity_at', 'ended_at',
        'duration_seconds', 'entry_path', 'exit_path', 'page_views',
        'device_type', 'browser', 'os', 'country', 'referrer_domain',
        'is_bounce', 'has_cart_activity', 'has_checkout', 'converted',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'last_activity_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_seconds' => 'integer',
        'page_views' => 'integer',
        'is_bounce' => 'boolean',
        'has_cart_activity' => 'boolean',
        'has_checkout' => 'boolean',
        'converted' => 'boolean',
    ];

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(AnalyticsVisitor::class, 'visitor_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(AnalyticsEvent::class, 'session_id');
    }
}
