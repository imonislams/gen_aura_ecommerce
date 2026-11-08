import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { dhakaDateTime } from '../../../lib/datetime';

function OrderShow({ order, statuses }) {
    const [status, setStatus] = useState(order.status);
    const [processing, setProcessing] = useState(false);

    const updateStatus = (nextStatus) => {
        if (nextStatus === 'Cancelled' && !window.confirm('Cancel this order? Stock handling follows the existing order rules.')) {
            return;
        }

        setProcessing(true);
        router.patch(
            `/admin/orders/${order.id}`,
            { status: nextStatus },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <>
            <Head title={`Order ${order.order_number || order.id}`} />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
                <div>
                    <Link href="/admin/orders" className="text-sm text-pur font-semibold">
                        ← All orders
                    </Link>
                    <h1 className="font-serif text-3xl font-bold mt-1">
                        Order {order.order_number || `#${order.id}`}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {dhakaDateTime(order.created_at)} · {order.payment_method}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={order.invoice_url} className="btn bg-white border text-gray-600">
                        View invoice
                    </Link>
                    <a href={`${order.invoice_pdf_url}?download=1`} className="btn bg-white border text-gray-600">
                        Download
                    </a>
                    <button
                        className="btn bg-red-500"
                        disabled={processing || order.status === 'Cancelled'}
                        onClick={() => updateStatus('Cancelled')}
                    >
                        Cancel order
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-[1.4fr_0.6fr] gap-5 items-start">
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-semibold">Items</h2>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700">
                                {order.status === 'Delivered' ? 'Complete' : order.status}
                            </span>
                        </div>
                        <div className="overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                        <th className="px-2 py-2">Product</th>
                                        <th className="px-2 py-2">Size</th>
                                        <th className="px-2 py-2">Qty</th>
                                        <th className="px-2 py-2">Price</th>
                                        <th className="px-2 py-2 text-right">Line total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item) => (
                                        <tr key={item.id} className="border-t border-gray-100">
                                            <td className="px-2 py-2">{item.name}</td>
                                            <td className="px-2 py-2 text-gray-500">{item.size || '—'}</td>
                                            <td className="px-2 py-2">{item.qty}</td>
                                            <td className="px-2 py-2">৳{Number(item.price).toLocaleString()}</td>
                                            <td className="px-2 py-2 text-right font-semibold">
                                                ৳{Number(item.line_total).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-gray-100 mt-3 pt-3 max-w-xs ml-auto text-sm">
                            <div className="flex justify-between py-1">
                                <span>Subtotal</span>
                                <b>৳{Number(order.subtotal).toLocaleString()}</b>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Delivery</span>
                                <b>৳{Number(order.ship).toLocaleString()}</b>
                            </div>
                            <div className="flex justify-between pt-2 mt-1 border-t border-gray-100 font-bold">
                                <span>Total</span>
                                <span>৳{Number(order.total).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-4">
                        <h2 className="font-semibold mb-3">Order timeline</h2>
                        <div className="relative pl-5">
                            <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-purple-100" />
                            {order.history.map((entry) => (
                                <div key={entry.id} className="relative pb-4">
                                    <span className="absolute -left-[15px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-purple-50" />
                                    <div className="text-xs font-bold text-gray-400">
                                        {dhakaDateTime(entry.created_at)}
                                    </div>
                                    <div className="font-semibold">{entry.status}</div>
                                    {entry.note && <div className="text-xs text-gray-500">{entry.note}</div>}
                                </div>
                            ))}
                            {order.history.length === 0 && (
                                <p className="text-sm text-gray-500">No timeline entries yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm p-4">
                        <h2 className="font-semibold mb-2">Customer</h2>
                        <div className="text-sm">
                            <b>{order.name}</b>
                            <div className="text-gray-500">{order.phone}</div>
                        </div>
                        <div className="border-t border-gray-100 mt-3 pt-3 text-sm">
                            <div className="text-xs text-gray-400">Delivery address</div>
                            <div>{order.address}</div>
                            {order.delivery_area && <div className="text-gray-500">{order.delivery_area}</div>}
                            {order.note && <div className="text-gray-500 mt-1">Note: {order.note}</div>}
                        </div>
                    </div>

                    {order.status === 'Delivered' ? (
                        <div className="bg-white rounded-2xl shadow-sm p-4">
                            <h2 className="font-semibold mb-2">Order status</h2>
                            <div className="rounded-xl bg-green-50 text-green-700 px-3 py-2 text-sm font-bold">Complete</div>
                            <p className="text-xs text-gray-400 mt-2">
                                This order has been delivered and is complete. If the customer did not accept the delivery, use Cancel order to reverse it.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm p-4">
                            <h2 className="font-semibold mb-2">Update status</h2>
                            <select
                                className="inp"
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                            >
                                {statuses.map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="btn w-full mt-3"
                                disabled={processing || status === order.status}
                                onClick={() => updateStatus(status)}
                            >
                                {processing ? 'Updating…' : 'Update status'}
                            </button>
                            <p className="text-xs text-gray-400 mt-2">
                                Status changes are recorded in the order timeline. Stock rules remain unchanged in this phase.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

OrderShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default OrderShow;
