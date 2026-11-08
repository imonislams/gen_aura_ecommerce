<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'image', 'status', 'sort_order'];

    protected $casts = ['sort_order' => 'integer'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function getImageUrlAttribute(): string
    {
        return $this->image ? asset('storage/' . $this->image) : Product::placeholder($this->name);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
