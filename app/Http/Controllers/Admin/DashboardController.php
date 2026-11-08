<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $r)
    {
        $tz = config('shop.timezone', 'Asia/Dhaka');
        $today = Carbon::now($tz)->startOfDay();

        $to = Carbon::parse($r->input('to', $today->toDateString()), $tz)->endOfDay();
        $from = Carbon::parse($r->input('from', $today->copy()->subDays(29)->toDateString()), $tz)->startOfDay();

        if ($from->diffInDays($to) > 92) {
            $from = $to->copy()->subDays(92)->startOfDay();
        }

        $fromUtc = $from->copy()->utc();
        $toUtc = $to->copy()->utc();

        $orders = Order::with('items')
            ->where('status', '!=', 'Cancelled')
            ->where('created_at', '>=', Carbon::now($tz)->startOfMonth()->subMonths(11)->utc())
            ->get();

        $daily = [];
        for ($d = $from->copy(); $d <= $to; $d->addDay()) {
            $daily[$d->toDateString()] = ['l' => $d->format('j/n'), 'n' => 0, 'r' => 0, 'u' => 0];
        }

        $monthly = [];
        for ($i = 11; $i >= 0; $i--) {
            $m = Carbon::now($tz)->startOfMonth()->subMonths($i);
            $monthly[$m->format('Y-m')] = ['l' => $m->format('M'), 'n' => 0, 'r' => 0, 'u' => 0];
        }

        foreach ($orders as $order) {
            $created = $order->created_at->copy()->setTimezone($tz);
            $u = $order->items->sum('qty');
            $dk = $created->toDateString();
            $mk = $created->format('Y-m');

            if (isset($daily[$dk])) {
                $daily[$dk]['n']++;
                $daily[$dk]['r'] += $order->total;
                $daily[$dk]['u'] += $u;
            }
            if (isset($monthly[$mk])) {
                $monthly[$mk]['n']++;
                $monthly[$mk]['r'] += $order->total;
                $monthly[$mk]['u'] += $u;
            }
        }

        $todayOrders = $orders->filter(
            fn ($order) => $order->created_at->copy()->setTimezone($tz)->isSameDay(Carbon::now($tz))
        );

        $top = OrderItem::selectRaw('name, SUM(qty) as q')
            ->whereHas('order', fn ($query) => $query->where('status', '!=', 'Cancelled')->whereBetween('created_at', [$fromUtc, $toUtc]))
            ->groupBy('name')
            ->orderByDesc('q')
            ->limit(5)
            ->get();

        $low = Product::where('stock', '<=', 3)->orderBy('stock')->get();
        $sum = fn ($key) => array_sum(array_column($daily, $key));

        $stats = [
            'Today orders' => $todayOrders->count(),
            'Today revenue' => '৳' . number_format($todayOrders->sum('total')),
            'Orders (range)' => $sum('n'),
            'Revenue (range)' => '৳' . number_format($sum('r')),
            'Units sold (range)' => $sum('u'),
            'Pending' => Order::where('status', 'Pending')->count(),
            'Low / out of stock' => $low->count(),
            'Products' => Product::count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'daily' => array_values($daily),
            'monthly' => array_values($monthly),
            'top' => $top->map(fn ($item) => ['name' => $item->name, 'q' => (int) $item->q])->values(),
            'low' => $low->map(fn ($product) => ['id' => $product->id, 'name' => $product->name, 'stock' => $product->stock])->values(),
            'stats' => $stats,
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
        ]);
    }
}
