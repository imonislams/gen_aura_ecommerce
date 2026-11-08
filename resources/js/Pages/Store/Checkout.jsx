import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import StoreLayout from '../../Layouts/StoreLayout';

function Checkout({ lines, subtotal, ship, total, zones, checkoutToken }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        address: '',
        delivery_zone_id: zones?.length ? zones[0].id : '',
        note: '',
        checkout_token: checkoutToken,
    });

    useEffect(() => {
        setData('checkout_token', checkoutToken);
    }, [checkoutToken]);

    const selectedZone = (zones ?? []).find((zone) => String(zone.id) === String(data.delivery_zone_id));
    const shipAmount = selectedZone ? Number(selectedZone.charge) : Number(ship);
    const grandTotal = Number(subtotal) + shipAmount;

    const submit = (event) => {
        event.preventDefault();
        post('/checkout', { preserveScroll: true });
    };

    if (!lines.length) {
        return (
            <>
                <Head title="Checkout" />
                <div className="max-w-md mx-auto text-center p-16 text-gray-500">
                    Your bag is empty.{' '}
                    <Link href="/shop" className="text-pur font-semibold">
                        Browse the shop
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Checkout" />

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="mb-5">
                    <Link href="/cart" className="text-sm text-pur font-semibold">
                        ← Back to bag
                    </Link>
                    <h1 className="font-serif text-4xl font-bold mt-2">Checkout</h1>
                    <p className="text-gray-500">Cash on Delivery · all over Bangladesh</p>
                </div>

                {errors.checkout_token && (
                    <div className="bg-red-50 text-red-700 rounded-xl p-3 mb-4 text-sm">{errors.checkout_token}</div>
                )}

                <div className="grid md:grid-cols-[1.3fr_0.7fr] gap-5 items-start">
                    <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-5">
                        <h2 className="font-semibold mb-3">Delivery details</h2>

                        <div className="grid md:grid-cols-2 gap-3">
                            <label className="block text-sm mb-3">
                                Full name
                                <input
                                    className="inp"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    required
                                />
                                {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
                            </label>
                            <label className="block text-sm mb-3">
                                Phone
                                <input
                                    className="inp"
                                    value={data.phone}
                                    onChange={(event) => setData('phone', event.target.value)}
                                    placeholder="01XXXXXXXXX"
                                    required
                                />
                                {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
                            </label>
                        </div>

                        <label className="block text-sm mb-3">
                            Delivery area
                            {zones?.length ? (
                                <select
                                    className="inp"
                                    value={data.delivery_zone_id}
                                    onChange={(event) => setData('delivery_zone_id', event.target.value)}
                                >
                                    {zones.map((zone) => (
                                        <option key={zone.id} value={zone.id}>
                                            {zone.name} · ৳{Number(zone.charge).toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="inp bg-gray-50 text-gray-500">Delivery charge ৳{Number(ship).toLocaleString()}</div>
                            )}
                            {errors.delivery_zone_id && <span className="text-xs text-red-600">{errors.delivery_zone_id}</span>}
                        </label>

                        <label className="block text-sm mb-3">
                            Full address
                            <textarea
                                className="inp"
                                rows="3"
                                value={data.address}
                                onChange={(event) => setData('address', event.target.value)}
                                required
                            />
                            {errors.address && <span className="text-xs text-red-600">{errors.address}</span>}
                        </label>

                        <label className="block text-sm mb-3">
                            Order note (optional)
                            <textarea
                                className="inp"
                                rows="2"
                                value={data.note}
                                onChange={(event) => setData('note', event.target.value)}
                            />
                        </label>

                        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3 text-xs mb-4">
                            Totals and stock are re-calculated on the server before the order is created.
                        </div>

                        <div className="flex items-center gap-2 mb-4 text-sm font-semibold">
                            <span className="grad text-white rounded-full px-2 py-0.5 text-xs">COD</span>
                            Cash on Delivery <span className="text-gray-400 font-normal">(only method in this phase)</span>
                        </div>

                        <button className="btn w-full" disabled={processing}>
                            {processing ? 'Placing order…' : `Place order · ৳${Number(grandTotal).toLocaleString()}`}
                        </button>
                        <p className="text-xs text-gray-400 text-center mt-2">
                            Submit is disabled while processing to prevent duplicates.
                        </p>
                    </form>

                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <h2 className="font-semibold mb-3">Order summary</h2>
                        {lines.map((line) => (
                            <div key={line.key} className="flex justify-between gap-3 py-1.5 text-sm">
                                <span>
                                    {line.name}
                                    {line.size ? ` (${line.size})` : ''} × {line.qty}
                                </span>
                                <b>৳{Number(line.line_total).toLocaleString()}</b>
                            </div>
                        ))}
                        <div className="h-px bg-gray-100 my-2" />
                        <div className="flex justify-between py-1 text-sm">
                            <span>Subtotal</span>
                            <b>৳{Number(subtotal).toLocaleString()}</b>
                        </div>
                        <div className="flex justify-between py-1 text-sm">
                            <span>Delivery</span>
                            <b>৳{Number(shipAmount).toLocaleString()}</b>
                        </div>
                        <div className="flex justify-between pt-3 mt-2 border-t border-gray-100 font-bold text-base">
                            <span>Grand total</span>
                            <span>৳{Number(grandTotal).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Checkout.layout = (page) => <StoreLayout>{page}</StoreLayout>;

export default Checkout;
