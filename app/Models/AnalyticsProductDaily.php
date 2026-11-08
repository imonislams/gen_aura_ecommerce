<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsProductDaily extends Model
{
    protected $table = 'analytics_product_daily';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'date', 'product_id', 'views', 'unique_viewers', 'add_to_cart',
        'checkout', 'orders', 'units', 'revenue',
    ];

    protected $casts = [
        'date' => 'date',
        'product_id' => 'integer',
        'views' => 'integer',
        'unique_viewers' => 'integer',
        'add_to_cart' => 'integer',
        'checkout' => 'integer',
        'orders' => 'integer',
        'units' => 'integer',
        'revenue' => 'integer',
    ];
}
