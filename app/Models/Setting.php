<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    public $timestamps = false;
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['key', 'value'];
    const DEFAULTS = [
        'name' => 'GEN AURA', 'ar' => 'جين أورا', 'top' => '3 Days Delivery All Over BD',
        'title' => 'Wear Your Aura. Dress With Confidence.',
        'sub' => 'Premium T-shirts, shirts, pants and panjabis, made for everyday style and comfort.',
        'wa' => '8801700000000', 'cats' => 'T-Shirt,Shirt,Pant,Panjabi',
        'fb' => 'https://www.facebook.com/p/GEN-AURA-61579509689159/',
        'hero_image' => '',
        'phone' => '', 'email' => '', 'address' => '',
        'logo' => '', 'favicon' => '', 'instagram' => '', 'youtube' => '', 'tiktok' => '',
        'currency' => 'BDT', 'order_prefix' => 'GA', 'cod_enabled' => '1', 'stock_display' => '1',
        'promo_title' => '', 'promo_text' => '',
        'why_choose_us' => 'Shipped from Dhaka|Easy Returns|Quality Checked',
        'about_title' => 'About GEN AURA',
        'about_body' => 'GEN AURA is a Bangladesh-based clothing store offering premium T-shirts, shirts, pants and panjabis with cash-on-delivery across the country.',
        'about_image' => '',
    ];
    protected static ?array $cache = null;
    public static function all_(): array
    {
        if (self::$cache === null) {
            try { self::$cache = array_merge(self::DEFAULTS, self::query()->pluck('value', 'key')->all()); }
            catch (\Throwable $e) { self::$cache = self::DEFAULTS; }
        }
        return self::$cache;
    }
    public static function put(array $d): void
    {
        foreach ($d as $k => $v) self::updateOrCreate(['key' => $k], ['value' => (string) $v]);
        self::$cache = null;
    }
}
