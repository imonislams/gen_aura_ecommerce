<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    const STATUS = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    protected $fillable = [
        'name', 'phone', 'address', 'delivery_area', 'note', 'subtotal', 'ship', 'total',
        'status', 'order_number', 'customer_id', 'payment_method', 'idempotency_key',
    ];

    protected $casts = [
        'subtotal' => 'integer',
        'ship' => 'integer',
        'total' => 'integer',
        'customer_id' => 'integer',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at');
    }

    protected static function booted(): void
    {
        static::created(function (Order $order) {
            if (empty($order->order_number)) {
                $prefix = Setting::all_()['order_prefix'] ?? 'GA';
                $order->forceFill(['order_number' => sprintf('%s-%06d', $prefix, $order->id)])->saveQuietly();
            }

            $phone = Customer::normalizePhone($order->phone);
            $customer = Customer::firstOrCreate(
                ['phone' => $phone],
                ['name' => $order->name]
            );

            $order->forceFill(['customer_id' => $customer->id])->saveQuietly();
            $customer->update(['name' => $order->name]);
            $customer->recalculate();

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => $order->status,
                'note' => 'Order placed',
                'created_at' => $order->created_at ?? now(),
            ]);
        });

        static::updated(function (Order $order) {
            if (!$order->wasChanged('status')) {
                return;
            }

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => $order->status,
                'note' => 'Status changed from ' . $order->getOriginal('status') . ' to ' . $order->status,
                'admin_id' => request()->hasSession() ? request()->session()->get('admin_id') : null,
                'created_at' => now(),
            ]);

            $order->customer?->recalculate();
        });
    }
}
