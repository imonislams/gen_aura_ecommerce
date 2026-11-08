import { Head, Link } from '@inertiajs/react';
import StoreLayout from '../../Layouts/StoreLayout';

function OrderSuccess({ order }) {
    const date = order.created_at ? new Date(order.created_at).toLocaleString() : '';

    return (
        <>
            <Head title="Order confirmed" />

            <div className="max-w-2xl mx-auto px-4 py-10">
                <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-50 text-green-600 grid place-items-center text-4xl mx-auto mb-4">
                        ✓
                    </div>
                    <h1 className="font-serif text-4xl font-bold">Order placed!</h1>
                    <p className="text-gray-500 mt-1">We will call you to confirm. Cash on delivery.</p>
                    <div className="inline-block grad text-white rounded-full px-4 py-1.5 text-sm font-bold mt-3">
                        Order # {order.order_number}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 text-left mt-6">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between gap-3 py-1.5 text-sm">
                                <span>
                                    {item.name}
                                    {item.size ? ` (${item.size})` : ''} × {item.qty}
                                </span>
                                <b>৳{Number(item.line_total).toLocaleString()}</b>
                            </div>
                        ))}
                        <div className="h-px bg-gray-200 my-2" />
                        <div className="flex justify-between py-1 text-sm">
                            <span>Subtotal</span>
                            <b>৳{Number(order.subtotal).toLocaleString()}</b>
                        </div>
                        <div className="flex justify-between py-1 text-sm">
                            <span>Delivery</span>
                            <b>৳{Number(order.ship).toLocaleString()}</b>
                        </div>
                        <div className="flex justify-between pt-3 mt-2 border-t border-gray-200 font-bold">
                            <span>Total</span>
                            <span>৳{Number(order.total).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 text-left">
                        <div className="bg-white border border-gray-100 rounded-xl p-3">
                            <div className="text-xs text-gray-400">Status</div>
                            <b>{order.status}</b>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl p-3">
                            <div className="text-xs text-gray-400">Payment</div>
                            <b>{order.payment_method}</b>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl p-3">
                            <div className="text-xs text-gray-400">Placed</div>
                            <b className="text-sm">{date}</b>
                        </div>
                    </div>

                    <div className="text-left text-sm mt-5 bg-gray-50 rounded-2xl p-4">
                        <div className="font-semibold mb-1">Delivery information</div>
                        <div>{order.name} · {order.phone}</div>
                        <div className="text-gray-500">{order.address}</div>
                        {order.delivery_area && <div className="text-gray-500">{order.delivery_area}</div>}
                        {order.note && <div className="text-gray-500 mt-1">Note: {order.note}</div>}
                    </div>

                    <div className="flex gap-2 justify-center mt-5">
                        <Link href="/shop" className="btn">Continue shopping</Link>
                        <Link href="/" className="btn bg-white border text-gray-600">Home</Link>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                        This page is reached through a signed link; order details are not publicly enumerable.
                    </p>
                </div>
            </div>
        </>
    );
}

OrderSuccess.layout = (page) => <StoreLayout>{page}</StoreLayout>;

export default OrderSuccess;
