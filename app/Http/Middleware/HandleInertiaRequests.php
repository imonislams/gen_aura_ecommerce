<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\Setting;
use App\Models\Showroom;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $adminId = $request->session()->get('admin_id');
        $admin = $adminId ? Admin::find($adminId) : null;

        return [
            ...parent::share($request),
            'settings' => Setting::all_(),
            'showrooms' => Showroom::active()->ordered()->get()->map(fn (Showroom $showroom) => [
                'id' => $showroom->id,
                'name' => $showroom->name,
                'address' => $showroom->address,
                'phone' => $showroom->phone,
            ])->values(),
            'cartCount' => collect($request->session()->get('cart', []))->sum('qty'),
            'flash' => [
                'ok' => $request->session()->get('ok'),
                'done' => $request->session()->get('done'),
            ],
            'auth' => [
                'admin' => $admin ? [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'username' => $admin->username,
                    'must_change_password' => (bool) $admin->must_change_password,
                ] : null,
            ],
            'messagesUnread' => $admin ? ContactMessage::where('status', 'new')->count() : 0,
            'ordersNew' => $admin ? Order::where('status', 'Pending')->count() : 0,
        ];
    }
}
