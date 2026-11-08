import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { dhakaDateTime } from '../../../lib/datetime';

function Invoice({ order, back_url, pdf_url }) {
    const { settings } = usePage().props;

    return (
        <>
            <Head title={`Invoice ${order.order_number || `#${order.id}`}`}>
                <style>{`
                    @media print {
                        body { background: #fff !important; }
                        @page { margin: 12mm; }
                    }
                `}</style>
            </Head>

            <div className="flex items-center justify-between gap-3 flex-wrap mb-4 print:hidden">
                <Link href={back_url} className="text-sm text-pur font-semibold">
                    ← Back to order
                </Link>
                <div className="flex gap-2">
                    <button type="button" className="btn bg-white border text-gray-600" onClick={() => window.print()}>
                        Print
                    </button>
                    <a href={`${pdf_url}?download=1`} className="btn">
                        Download PDF
                    </a>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 print:shadow-none print:rounded-none print:p-0">
                <div className="flex justify-between gap-4 flex-wrap border-b border-gray-200 pb-4">
                    <div>
                        <div className="font-serif text-2xl font-bold text-pur">{settings.name}</div>
                        <div className="text-sm text-gray-500">{settings.top}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold">INVOICE</div>
                        <div className="text-sm text-gray-500">{order.order_number || `#${order.id}`}</div>
                        <div className="text-sm text-gray-500">{dhakaDateTime(order.created_at)}</div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 border-b border-gray-200 py-4">
                    <div className="text-sm">
                        <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Customer details</div>
                        <b className="text-base">{order.name}</b>
                        <div className="text-gray-600">Phone: {order.phone}</div>
                        <div className="text-gray-600">Address: {order.address}</div>
                        {order.delivery_area && <div className="text-gray-600">Delivery area: {order.delivery_area}</div>}
                        {order.note && <div className="text-gray-600">Note: {order.note}</div>}
                    </div>
                    <div className="text-sm">
                        <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Order details</div>
                        <div className="text-gray-600">
                            Order: <b className="text-gray-900">{order.order_number || `#${order.id}`}</b>
                        </div>
                        <div className="text-gray-600">Date: {dhakaDateTime(order.created_at)}</div>
                        <div className="text-gray-600">Payment: {order.payment_method === 'COD' ? 'Cash on Delivery' : order.payment_method}</div>
                    </div>
                </div>

                <div className="overflow-auto mt-4">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-200">
                                <th className="py-2 px-1">Item</th>
                                <th className="py-2 px-1">Size</th>
                                <th className="py-2 px-1">Qty</th>
                                <th className="py-2 px-1 text-right">Price</th>
                                <th className="py-2 px-1 text-right">Line total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item) => (
                                <tr key={item.id} className="border-b border-gray-100">
                                    <td className="py-2 px-1">{item.name}</td>
                                    <td className="py-2 px-1 text-gray-500">{item.size || '—'}</td>
                                    <td className="py-2 px-1">{item.qty}</td>
                                    <td className="py-2 px-1 text-right">BDT {Number(item.price).toLocaleString()}</td>
                                    <td className="py-2 px-1 text-right font-semibold">BDT {Number(item.line_total).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="ml-auto w-full sm:max-w-xs mt-4 text-sm border-t border-gray-200 pt-2">
                    <div className="flex justify-between py-1">
                        <span>Subtotal</span>
                        <b>BDT {Number(order.subtotal).toLocaleString()}</b>
                    </div>
                    <div className="flex justify-between py-1">
                        <span>Delivery</span>
                        <b>BDT {Number(order.ship).toLocaleString()}</b>
                    </div>
                    <div className="flex justify-between py-1 text-base font-bold border-t border-gray-200 mt-1 pt-2">
                        <span>Total</span>
                        <span>BDT {Number(order.total).toLocaleString()}</span>
                    </div>
                </div>

                <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-3 text-sm text-gray-500">
                    Thank you for shopping with {settings.name}.
                    {settings.wa && <> Questions? WhatsApp +{settings.wa}.</>}
                </div>
            </div>
        </>
    );
}

Invoice.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Invoice;
