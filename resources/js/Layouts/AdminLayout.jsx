import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Flash from '../Components/Flash';

const items = [
    { href: '/admin', label: 'Dashboard', icon: '▦', match: /^\/admin$/ },
    { href: '/admin/products', label: 'Products', icon: '▤', match: /^\/admin\/products/ },
    { href: '/admin/categories', label: 'Categories', icon: '◫', match: /^\/admin\/categories/ },
    { href: '/admin/inventory', label: 'Inventory', icon: '▦', match: /^\/admin\/inventory/ },
    { href: '/admin/orders', label: 'Orders', icon: '▥', match: /^\/admin\/orders/ },
    { href: '/admin/reports', label: 'Reports', icon: '▧', match: /^\/admin\/reports/ },
    { href: '/admin/reviews', label: 'Reviews', icon: '★', match: /^\/admin\/reviews/ },
    { href: '/admin/messages', label: 'Messages', icon: '✉', match: /^\/admin\/messages/ },
    { href: '/admin/settings', label: 'Settings', icon: '⚙', match: /^\/admin\/settings/ },
];

const analyticsItems = [
    { href: '/admin/analytics', label: 'Overview', icon: '◔', match: /^\/admin\/analytics$/ },
    { href: '/admin/analytics/live', label: 'Live Visitors', icon: '◉', match: /^\/admin\/analytics\/live/ },
    { href: '/admin/analytics/visitors', label: 'All Visitors', icon: '☰', match: /^\/admin\/analytics\/visitors/ },
    { href: '/admin/analytics/activity', label: 'Visitor Activity', icon: '↯', match: /^\/admin\/analytics\/activity/ },
    { href: '/admin/analytics/products', label: 'Product Analytics', icon: '▤', match: /^\/admin\/analytics\/products/ },
    { href: '/admin/analytics/cart', label: 'Cart Analytics', icon: '🛒', match: /^\/admin\/analytics\/cart/ },
    { href: '/admin/analytics/checkout', label: 'Checkout Analytics', icon: '✓', match: /^\/admin\/analytics\/checkout/ },
    { href: '/admin/analytics/funnel', label: 'Conversion Funnel', icon: '▽', match: /^\/admin\/analytics\/funnel/ },
    { href: '/admin/analytics/reports', label: 'Analytics Reports', icon: '▧', match: /^\/admin\/analytics\/reports/ },
];

export default function AdminLayout({ children }) {
    const page = usePage();
    const { settings, flash, errors, auth, messagesUnread, ordersNew } = page.props;
    const url = page.url || '';

    const [pendingOrders, setPendingOrders] = useState(ordersNew ?? 0);
    const [orderAlert, setOrderAlert] = useState(null);
    const lastOrderId = useRef(null);

    useEffect(() => {
        setPendingOrders(ordersNew ?? 0);
    }, [ordersNew]);

    useEffect(() => {
        let cancelled = false;

        const beep = () => {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) {
                    return;
                }
                const context = new AudioContext();
                const oscillator = context.createOscillator();
                const gain = context.createGain();
                oscillator.connect(gain);
                gain.connect(context.destination);
                oscillator.frequency.value = 880;
                gain.gain.value = 0.08;
                oscillator.start();
                oscillator.stop(context.currentTime + 0.18);
                oscillator.onended = () => context.close();
            } catch (error) {
                // Audio is optional; keep the visual alert working.
            }
        };

        const check = async () => {
            if (document.hidden) {
                return;
            }

            try {
                const response = await fetch('/admin/orders/notifications', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                if (!response.ok || cancelled) {
                    return;
                }

                const data = await response.json();
                if (cancelled) {
                    return;
                }

                setPendingOrders(data.pending ?? 0);

                if (lastOrderId.current === null) {
                    lastOrderId.current = data.latest?.id ?? 0;
                    return;
                }

                if (data.latest && data.latest.id > lastOrderId.current) {
                    lastOrderId.current = data.latest.id;
                    setOrderAlert(data.latest);
                    beep();
                }
            } catch (error) {
                // Network hiccups should not interrupt the admin.
            }
        };

        check();
        const interval = setInterval(check, 60000);
        document.addEventListener('visibilitychange', check);

        return () => {
            cancelled = true;
            clearInterval(interval);
            document.removeEventListener('visibilitychange', check);
        };
    }, []);

    useEffect(() => {
        if (!orderAlert) {
            return;
        }

        const timer = setTimeout(() => setOrderAlert(null), 12000);

        return () => clearTimeout(timer);
    }, [orderAlert]);

    const logout = (event) => {
        event.preventDefault();
        router.post('/admin/logout');
    };

    return (
        <div className="min-h-screen flex">
            <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-white border-r border-purple-100 sticky top-0 h-screen p-4 overflow-auto print:hidden">
                <Link href="/admin" className="flex items-center gap-2 mb-6 px-2">
                    {settings.logo ? (
                        <img src={`/storage/${settings.logo}`} alt={settings.name} className="h-8 object-contain" />
                    ) : (
                        <span className="w-8 h-8 rounded-lg grad flex items-center justify-center text-white font-serif font-bold">
                            A
                        </span>
                    )}
                    <span className="font-serif text-lg font-semibold gtext">{settings.name}</span>
                </Link>

                <nav className="flex flex-col gap-1">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                                item.match.test(url) ? 'grad text-white' : 'text-gray-600 hover:bg-purple-50'
                            }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                            {item.href === '/admin/messages' && messagesUnread > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                    {messagesUnread}
                                </span>
                            )}
                            {item.href === '/admin/orders' && pendingOrders > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                    {pendingOrders}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="mt-5 px-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                    Analytics
                </div>
                <nav className="flex flex-col gap-1 mt-1">
                    {analyticsItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                                item.match.test(url) ? 'grad text-white' : 'text-gray-600 hover:bg-purple-50'
                            }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <form onSubmit={logout} className="mt-auto pt-4">
                    <button className="w-full px-3 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white">
                        Log out
                    </button>
                </form>
            </aside>

            <div className="flex-1 min-w-0 flex flex-col">
                <div className="md:hidden flex gap-2 p-3 overflow-x-auto bg-white border-b sticky top-0 z-20 print:hidden">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold ${
                                item.match.test(url) ? 'grad text-white' : 'bg-white border'
                            }`}
                        >
                            {item.label}
                            {item.href === '/admin/messages' && messagesUnread > 0 && (
                                <span className="ml-1 text-red-500">({messagesUnread})</span>
                            )}
                            {item.href === '/admin/orders' && pendingOrders > 0 && (
                                <span className="ml-1 text-red-500">({pendingOrders})</span>
                            )}
                        </Link>
                    ))}
                    <Link
                        href="/admin/analytics"
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold ${
                            /^\/admin\/analytics/.test(url) ? 'grad text-white' : 'bg-white border'
                        }`}
                    >
                        Analytics
                    </Link>
                    <form onSubmit={logout} className="ml-auto">
                        <button className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold bg-red-500 text-white">
                            Log out
                        </button>
                    </form>
                </div>

                <main className="p-4 w-full max-w-6xl mx-auto print:p-0 print:max-w-none">
                    <div className="print:hidden">
                        <Flash ok={flash?.ok} errors={errors} />
                    </div>
                    {auth?.admin?.must_change_password && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 mb-4 text-sm print:hidden">
                            Please change the default admin password in Settings when you can.
                        </div>
                    )}
                    {children}
                </main>
            </div>

            {orderAlert && (
                <div className="fixed bottom-4 right-4 z-50 max-w-xs bg-white rounded-2xl shadow-xl border border-purple-100 p-4 print:hidden">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">🔔</span>
                        <div className="flex-1 min-w-0">
                            <b className="text-sm">New order received</b>
                            <Link href={`/admin/orders/${orderAlert.id}`} className="block text-sm text-pur font-semibold truncate">
                                {orderAlert.order_number || `#${orderAlert.id}`}
                            </Link>
                            <div className="text-xs text-gray-400 mt-0.5">
                                {orderAlert.created_at ? new Date(orderAlert.created_at).toLocaleTimeString() : ''}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="text-gray-400 text-lg leading-none"
                            onClick={() => setOrderAlert(null)}
                            aria-label="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
