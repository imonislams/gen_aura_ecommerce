<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    private const SECTIONS = ['general', 'store', 'homepage', 'about', 'social', 'login'];

    private const IMAGES = [
        'general' => ['logo' => 'brand', 'favicon' => 'brand'],
        'homepage' => ['hero_image' => 'hero'],
        'about' => ['about_image' => 'about'],
    ];

    private const RULES = [
        'general' => [
            'name' => 'required|max:60',
            'ar' => 'nullable|max:60',
            'phone' => 'nullable|max:30',
            'email' => 'nullable|email|max:120',
            'address' => 'nullable|max:255',
            'wa' => 'nullable|max:20',
            'logo' => 'nullable|file|mimes:jpg,jpeg,png,webp,svg|max:4096',
            'favicon' => 'nullable|file|mimes:ico,png,jpg,jpeg,webp,svg|max:1024',
        ],
        'store' => [
            'currency' => 'nullable|max:10',
            'order_prefix' => 'nullable|max:10',
            'cats' => 'required|max:200',
            'cod_enabled' => 'nullable|in:0,1',
            'stock_display' => 'nullable|in:0,1',
        ],
        'homepage' => [
            'top' => 'nullable|max:120',
            'title' => 'nullable|max:120',
            'sub' => 'nullable|max:300',
            'promo_title' => 'nullable|max:120',
            'promo_text' => 'nullable|max:300',
            'why_choose_us' => 'nullable|max:300',
            'hero_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ],
        'about' => [
            'about_title' => 'nullable|max:120',
            'about_body' => 'nullable|max:2000',
            'about_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:4096',
        ],
        'social' => [
            'fb' => 'nullable|url|max:255',
            'instagram' => 'nullable|url|max:255',
            'tiktok' => 'nullable|url|max:255',
            'youtube' => 'nullable|url|max:255',
        ],
    ];

    private const LABELS = [
        'general' => 'General',
        'store' => 'Store',
        'homepage' => 'Homepage',
        'about' => 'About',
        'social' => 'Social links',
        'login' => 'Admin login',
    ];

    public function show(string $section)
    {
        abort_unless(in_array($section, self::SECTIONS, true), 404);

        return Inertia::render('Admin/Settings/' . ucfirst($section), [
            'section' => $section,
            'adminUsername' => Admin::find(session('admin_id'))?->username,
        ]);
    }

    public function save(Request $r, string $section)
    {
        abort_unless(isset(self::RULES[$section]), 404);

        $d = $r->validate(self::RULES[$section]);

        foreach (self::IMAGES[$section] ?? [] as $field => $dir) {
            unset($d[$field]);

            if ($r->hasFile($field)) {
                $old = Setting::all_()[$field] ?? '';
                if ($old && str_starts_with($old, $dir . '/')) {
                    Storage::disk('public')->delete($old);
                }
                $d[$field] = $r->file($field)->store($dir, 'public');
            }
        }

        Setting::put($d);

        return back()->with('ok', self::LABELS[$section] . ' settings saved');
    }
}
