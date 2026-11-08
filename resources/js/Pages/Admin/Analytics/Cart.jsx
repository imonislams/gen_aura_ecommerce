import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DateRangeFilter from '../../../Components/DateRangeFilter';

function Cart({ range, kpis, abandoned }) {
    const cards = [
        ['Add to cart events', kpis.add_to_cart_events],
        ['Unique visitors adding', kpis.unique_adders],
        ['Quantity updates', kpis.qty_updates],
        ['Cart removals', kpis.removals],
        ['Cart items', kpis.cart_items],
        ['Left without checkout', kpis.left_without_checkout],
        ['Abandoned carts', kpis.abandoned_carts],
    ];

    return (
        <>
            <Head title="Cart analytics" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Cart analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Abandonment threshold: 60 minutes of inactivity</p>
                </div>
                <DateRangeFilter range={range} url="/admin/analytics/cart" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {cards.map(([label, value]) => (
                    <div key={label} className="bg-white rounded-xl p-4">
                        <div className="text-xs text-gray-500">{label}</div>
                        <div className="text-2xl font-bold gtext">{value}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 pb-0">
                    <h2 className="font-semibold">Abandoned carts</h2>
                    <p className="text-xs text-gray-500 mb-2">No automated messages are sent.</p>
                </div>
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-purple-50/40">
                                <th className="px-3 py-2">Visitor</th>
                                <th className="px-3 py-2">Products</th>
                                <th className="px-3 py-2">Qty</th>
                                <th className="px-3 py-2 text-right">Cart value</th>
                                <th className="px-3 py-2">Last activity</th>
                                <th className="px-3 py-2">Abandoned for</th>
                            </tr>
                        </thead>
                        <tbody>
                            {abandoned.map((row) => (
                                <tr key={row.session_id} className="border-t border-gray-100">
                                    <td className="px-3 py-2">
                                        {row.uuid ? <Link href={`/admin/analytics/visitors/${row.uuid}`} className="text-pur font-semibold">#{row.short}</Link> : `#${row.short}`}
                                    </td>
                                    <td className="px-3 py-2">
                                        {row.items.map((item, index) => (
                                            <div key={index}>{item.product} × {item.qty}{item.size ? ` (${item.size})` : ''}</div>
                                        ))}
                                    </td>
                                    <td className="px-3 py-2">{row.items.reduce((sum, item) => sum + item.qty, 0)}</td>
                                    <td className="px-3 py-2 text-right font-semibold">৳{Number(row.value).toLocaleString()}</td>
                                    <td className="px-3 py-2 text-gray-500">{row.last_activity_at ? new Date(row.last_activity_at).toLocaleString() : '—'}</td>
                                    <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">{row.abandoned_for}</span></td>
                                </tr>
                            ))}
                            {abandoned.length === 0 && <tr><td colSpan="6" className="px-3 py-10 text-center text-gray-500">No abandoned carts.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Cart.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Cart;
