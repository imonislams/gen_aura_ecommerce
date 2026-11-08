import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Pagination';
import { dhakaDateTime } from '../../../lib/datetime';

function Orders({ orders, filters, statuses }) {
    const [q, setQ] = useState(filters?.q ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');

    const apply = (overrides = {}) => {
        router.get('/admin/orders', { q, status, ...overrides }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const updateStatus = (order, nextStatus) => {
        router.patch(`/admin/orders/${order.id}`, { status: nextStatus }, { preserveScroll: true });
    };

    const cancelOrder = (order) => {
        if (window.confirm('Cancel this order? Use this if the customer did not accept the delivery.')) {
            updateStatus(order, 'Cancelled');
        }
    };

    return (
        <>
            <Head title="Orders" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">{orders.total.toLocaleString()} orders · COD only</p>
                </div>
                <div className="flex gap-2">
                    <input
                        className="border rounded-full px-4 py-2 text-sm"
                        value={q}
                        onChange={(event) => setQ(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && apply()}
                        placeholder="Order number, name or phone"
                    />
                    <select className="border rounded-full px-3 py-2 text-sm" value={status} onChange={(event) => { setStatus(event.target.value); apply({ status: event.target.value }); }}>
                        <option value="">All statuses</option>
                        {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                    <button className="btn btn-sm" onClick={() => apply()}>Filter</button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-purple-50/40">
                                <th className="px-3 py-2">Order</th>
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2">Customer</th>
                                <th className="px-3 py-2">Items</th>
                                <th className="px-3 py-2">Total</th>
                                <th className="px-3 py-2">Payment</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.map((order) => (
                                <tr key={order.id} className="border-t border-gray-100">
                                    <td className="px-3 py-2 font-semibold">{order.order_number || `#${order.id}`}</td>
                                    <td className="px-3 py-2 text-gray-500">{dhakaDateTime(order.created_at)}</td>
                                    <td className="px-3 py-2">
                                        <b>{order.name}</b>
                                        <div className="text-xs text-gray-500">{order.phone}</div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div>{order.items_count}</div>
                                        <div className="text-xs text-gray-400 max-w-[260px] truncate">{order.items_summary}</div>
                                    </td>
                                    <td className="px-3 py-2 font-semibold">৳{Number(order.total).toLocaleString()}</td>
                                    <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-bold">{order.payment_method}</span></td>
                                    <td className="px-3 py-2">
                                        {order.status === 'Delivered' ? (
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">Complete</span>
                                                <button type="button" className="text-red-500 text-xs font-bold" onClick={() => cancelOrder(order)}>
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <select className="border rounded px-2 py-1 text-xs" value={order.status} onChange={(event) => updateStatus(order, event.target.value)}>
                                                {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-right whitespace-nowrap">
                                        <Link href={`/admin/orders/${order.id}`} className="text-pur text-sm font-semibold mr-2">View</Link>
                                        <Link href={`/admin/orders/${order.id}/invoice`} className="text-pur text-sm font-semibold">Invoice</Link>
                                    </td>
                                </tr>
                            ))}
                            {orders.data.length === 0 && <tr><td colSpan="8" className="px-3 py-10 text-center text-gray-500">No orders found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination paginator={orders} />
        </>
    );
}

Orders.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Orders;
