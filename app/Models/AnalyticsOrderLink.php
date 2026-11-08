<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsOrderLink extends Model
{
    protected $fillable = ['order_id', 'visitor_id', 'session_id'];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(AnalyticsVisitor::class, 'visitor_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AnalyticsSession::class, 'session_id');
    }
}
