import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';

const eventLabels = {
    page_view: 'Page view',
    product_search: 'Product search',
    add_to_cart: 'Added to cart',
    remove_from_cart: 'Removed from cart',
    cart_qty_update: 'Cart quantity update',
    checkout_started: 'Checkout started',
    order_completed: 'Order completed',
};

function VisitorShow({ visitor, sessions, events, orders }) {
    return (
        <>
            <Head title={`Visitor #${visitor.short}`} />

            <div className="mb-5">
                <Link href="/admin/analytics/visitors" className="text-sm text-pur font-semibold">
                    ← All visitors
                </Link>
                <h1 className="font-serif text-3xl font-bold mt-1">Visitor #{visitor.short}</h1>
                <p className="text-sm text-gray-500">
                    {visitor.device_type} · {visitor.browser} · {visitor.os}
                    {visitor.country ? ` · ${visitor.country}` : ''}
                    {visitor.referrer_domain ? ` · from ${visitor.referrer_domain}` : ''}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-xl p-4"><div className="text-xs text-gray-500">Sessions</div><div className="text-2xl font-bold gtext">{visitor.total_sessions}</div></div>
                <div className="bg-white rounded-xl p-4"><div className="text-xs text-gray-500">Page views</div><div className="text-2xl font-bold gtext">{visitor.total_page_views}</div></div>
                <div className="bg-white rounded-xl p-4"><div className="text-xs text-gray-500">First seen</div><div className="text-lg font-bold">{visitor.first_seen_at ? new Date(visitor.first_seen_at).toLocaleDateString() : '—'}</div></div>
                <div className="bg-white rounded-xl p-4"><div className="text-xs text-gray-500">Last seen</div><div className="text-lg font-bold">{visitor.last_seen_at ? new Date(visitor.last_seen_at).toLocaleString() : '—'}</div></div>
            </div>

            <div className="grid md:grid-cols-[1.4fr_0.6fr] gap-4 items-start">
                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">Activity timeline</h2>
                    <div className="relative pl-5 max-h-[620px] overflow-auto">
                        <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-purple-100" />
                        {events.map((event) => (
                            <div key={event.id} className="relative pb-3">
                                <span className="absolute -left-[15px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-purple-50" />
                                <div className="text-xs text-gray-400">{event.occurred_at ? new Date(event.occurred_at).toLocaleString() : ''}</div>
                                <div className="text-sm font-semibold">{eventLabels[event.event_type] || event.event_type}</div>
                                <div className="text-xs text-gray-500">
                                    {event.path}
                                    {event.product_id ? ` · product #${event.product_id}` : ''}
                                    {event.metadata?.qty ? ` · qty ${event.metadata.qty}` : ''}
                                </div>
                            </div>
                        ))}
                        {events.length === 0 && <p className="text-sm text-gray-500">No events recorded.</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4">
                        <h2 className="font-semibold mb-3">Sessions</h2>
                        {sessions.map((session) => (
                            <div key={session.id} className="border-t border-gray-100 py-2 text-sm first:border-t-0 first:pt-0">
                                <div className="flex justify-between gap-2">
                                    <b>{session.entry_path}</b>
                                    <span className="text-gray-400">{session.page_views} views</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {session.started_at ? new Date(session.started_at).toLocaleString() : ''} · exit {session.exit_path}
                                </div>
                                <div className="text-xs mt-1 flex gap-1 flex-wrap">
                                    {session.is_bounce && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">bounce</span>}
                                    {session.has_checkout && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">checkout</span>}
                                    {session.converted && <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700">converted</span>}
                                </div>
                            </div>
                        ))}
                        {sessions.length === 0 && <p className="text-sm text-gray-500">No sessions.</p>}
                    </div>

                    <div className="bg-white rounded-2xl p-4">
                        <h2 className="font-semibold mb-3">Linked orders</h2>
                        {orders.map((order) => (
                            <div key={order.order_id} className="flex justify-between gap-2 border-t border-gray-100 py-2 text-sm first:border-t-0 first:pt-0">
                                <Link href={`/admin/orders/${order.order_id}`} className="text-pur font-semibold">
                                    {order.order_number || `#${order.order_id}`}
                                </Link>
                                <span>৳{Number(order.total).toLocaleString()}</span>
                            </div>
                        ))}
                        {orders.length === 0 && <p className="text-sm text-gray-500">No linked orders.</p>}
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3 text-xs mt-3">
                            Anonymous visitor data. No name, phone or address is shown here.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

VisitorShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default VisitorShow;
