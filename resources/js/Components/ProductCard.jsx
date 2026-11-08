import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ProductCard({ product }) {
    const out = product.stock <= 0;
    const [busy, setBusy] = useState(false);

    const add = (go) => {
        if (out || busy) {
            return;
        }
        setBusy(true);
        router.post(`/cart/add/${product.id}`, {
            size: product.sizes?.[0] ?? '',
            qty: 1,
            go,
        }, {
            preserveScroll: go !== 'buy',
            onFinish: () => setBusy(false),
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
            <Link href={product.url} className="block relative">
                <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    className={`w-full aspect-square object-cover ${out ? 'opacity-50' : ''}`}
                />
                {product.off > 0 && !out && (
                    <span className="absolute top-2 left-2 grad text-white text-xs font-bold rounded-full px-2 py-1">
                        -{product.off}%
                    </span>
                )}
                {out ? (
                    <span className="absolute top-2 right-2 bg-black text-white text-xs font-bold rounded-full px-2 py-1">
                        Out of stock
                    </span>
                ) : (
                    product.stock <= 5 && (
                        <span className="absolute bottom-2 left-2 bg-white/90 text-mag text-xs font-bold rounded-full px-2 py-1">
                            {product.stock} left
                        </span>
                    )
                )}
            </Link>

            <div className="p-4 flex flex-col flex-1">
                <Link href={product.url} className="block">
                    <span className="text-xs text-mag font-semibold">{product.cat}</span>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                </Link>

                <div className="mt-auto pt-2">
                    <div className="flex items-baseline gap-2">
                        <b className="text-lg">৳{Number(product.price).toLocaleString()}</b>
                        {product.old_price > 0 && (
                            <s className="text-gray-400 text-sm">৳{Number(product.old_price).toLocaleString()}</s>
                        )}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button
                            type="button"
                            className="flex-1 border border-gray-300 rounded-full py-1.5 text-xs font-semibold bg-white disabled:opacity-50"
                            disabled={out || busy}
                            onClick={() => add('bag')}
                        >
                            Add to bag
                        </button>
                        <button
                            type="button"
                            className="flex-1 rounded-full py-1.5 text-xs font-semibold bg-black text-white disabled:opacity-50"
                            disabled={out || busy}
                            onClick={() => add('buy')}
                        >
                            Buy it now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
