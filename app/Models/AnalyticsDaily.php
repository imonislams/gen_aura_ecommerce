<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsDaily extends Model
{
    protected $table = 'analytics_daily';

    protected $primaryKey = 'date';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'date', 'visitors', 'new_visitors', 'returning_visitors', 'sessions',
        'page_views', 'product_views', 'add_to_cart', 'checkout_started',
        'orders', 'revenue', 'units', 'bounces',
    ];

    protected $casts = [
        'date' => 'date',
        'visitors' => 'integer',
        'new_visitors' => 'integer',
        'returning_visitors' => 'integer',
        'sessions' => 'integer',
        'page_views' => 'integer',
        'product_views' => 'integer',
        'add_to_cart' => 'integer',
        'checkout_started' => 'integer',
        'orders' => 'integer',
        'revenue' => 'integer',
        'units' => 'integer',
        'bounces' => 'integer',
    ];
}
