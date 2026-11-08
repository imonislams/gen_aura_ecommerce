import { Head, Link, router } from '@inertiajs/react';
import StoreLayout from '../../Layouts/StoreLayout';

function Cart({ lines, subtotal, ship, total }) {
    const update = (line, qty) => {
        router.post('/cart/update', { key: line.key, qty }, { preserveScroll: true });
    };

    const remove = (line) => {
        router.post('/cart/remove', { key: line.key }, { preserveScroll: true });
    };

    if (!lines.length) {
        return (
            <>
                <Head title="Cart" />
                <div className="text-center p-16 text-gray-500">
                    Your bag is empty.{' '}
                    <Link href="/shop" className="text-pur font-semibold">Browse the shop</Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Cart" />

            <div className="max-w-3xl mx-auto p-4 grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                    {lines.map((line) => (
                        <div key={line.key} className="bg-white rounded-xl p-3 flex gap-3 items-center">
                            <img src={line.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                                <Link href={line.url} className="block text-sm font-semibold truncate">
                                    {line.name}{line.size ? ` (${line.size})` : ''}
                                </Link>
                                <div className="text-sm">৳{Number(line.price).toLocaleString()}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                    <button className="w-7 h-7 rounded-full border" disabled={line.qty <= 1} onClick={() => update(line, line.qty - 1)}>−</button>
                                    <span>{line.qty}</span>
                                    <button className="w-7 h-7 rounded-full border" disabled={line.qty >= 50} onClick={() => update(line, line.qty + 1)}>+</button>
                                </div>
                                <button className="text-xs text-red-500" onClick={() => remove(line)}>Remove</button>
                            </div>
                        </div>
                    ))}
                    <Link href="/shop" className="inline-block text-sm text-pur font-semibold">← Continue shopping</Link>
                </div>

                <div className="bg-white rounded-2xl p-5">
                    <h3 className="font-semibold mb-3">Order summary</h3>
                    <div className="text-sm flex justify-between py-1"><span>Subtotal</span><span>৳{Number(subtotal).toLocaleString()}</span></div>
                    <div className="text-sm flex justify-between py-1"><span>Delivery</span><span>৳{Number(ship).toLocaleString()}</span></div>
                    <div className="font-bold flex justify-between text-lg border-t mt-2 pt-3"><span>Total</span><span>৳{Number(total).toLocaleString()}</span></div>
                    <Link href="/checkout" className="btn w-full mt-4">Proceed to checkout</Link>
                    <p className="text-xs text-gray-400 text-center mt-2">Cash on Delivery · totals re-verified on the server</p>
                </div>
            </div>
        </>
    );
}

Cart.layout = (page) => <StoreLayout>{page}</StoreLayout>;

export default Cart;
