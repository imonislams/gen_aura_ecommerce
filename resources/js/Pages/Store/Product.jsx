import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import StoreLayout from '../../Layouts/StoreLayout';
import ProductCard from '../../Components/ProductCard';
import StarRating from '../../Components/StarRating';

function Product({ product, related, reviews }) {
    const [image, setImage] = useState(product.image_url);
    const [size, setSize] = useState(product.sizes?.[0] ?? '');
    const [qty, setQty] = useState(1);

    const maxQty = Math.max(1, Math.min(50, product.stock));
    const out = product.stock <= 0;

    const add = (go) => {
        router.post(`/cart/add/${product.id}`, { size, qty, go }, {
            preserveScroll: go !== 'buy',
        });
    };

    const reviewForm = useForm({
        name: '',
        text: '',
        stars: 5,
        product_id: product.id,
    });

    const submitReview = (event) => {
        event.preventDefault();
        reviewForm.post('/reviews', {
            preserveScroll: true,
            onSuccess: () => reviewForm.reset('text'),
        });
    };

    return (
        <>
            <Head title={product.name}>
                <meta name="description" content={product.description || product.name} />
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: product.name,
                    description: product.description,
                    category: product.cat,
                    offers: {
                        '@type': 'Offer',
                        priceCurrency: 'BDT',
                        price: product.price,
                        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                    },
                })}</script>
            </Head>

            <section className="max-w-6xl mx-auto px-4 py-8">
                <Link href="/shop" className="text-sm text-pur font-semibold">
                    ← Back to shop
                </Link>

                <div className="grid md:grid-cols-2 gap-8 mt-4">
                    <div>
                        <img src={image} alt={product.name} className="w-full aspect-square object-cover rounded-2xl shadow" />
                        {product.gallery.length > 1 && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {product.gallery.map((src) => (
                                    <button key={src} type="button" onClick={() => setImage(src)} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-pur">
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex gap-2 flex-wrap mb-2">
                            <span className="inline-block text-xs font-bold bg-white border border-gold text-gold rounded-full px-3 py-1">{product.cat}</span>
                            <span className="inline-block text-xs font-bold bg-white border rounded-full px-3 py-1">🚚 COD · All Bangladesh</span>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl font-bold mt-3">{product.name}</h1>
                        {product.sub && <p className="font-serif italic text-3xl gtext">{product.sub}</p>}
                        <p className="text-gray-600 mt-3">{product.description}</p>

                        {product.features.length > 0 && (
                            <div className="flex gap-4 flex-wrap my-5">
                                {product.features.map((feature) => (
                                    <div key={feature} className="w-20 text-center text-xs font-semibold">
                                        <div className="w-14 h-14 mx-auto mb-1 rounded-full border-2 border-gold bg-amber-50 flex items-center justify-center text-gold text-xl">✦</div>
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-baseline gap-3 my-4">
                            <b className="text-2xl">৳{Number(product.price).toLocaleString()}</b>
                            {product.old_price > 0 && <s className="text-gray-400">৳{Number(product.old_price).toLocaleString()}</s>}
                            {product.off > 0 && <span className="badge badge-dark">-{product.off}%</span>}
                        </div>

                        {out ? (
                            <p className="w-full text-center rounded-xl py-3 font-semibold bg-gray-200 text-gray-500">Out of stock</p>
                        ) : (
                            <>
                                {product.sizes.length > 0 && (
                                    <div className="mb-4">
                                        <div className="text-sm font-semibold mb-1">Size</div>
                                        <div className="flex gap-2 flex-wrap">
                                            {product.sizes.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => setSize(option)}
                                                    className={`px-4 py-1.5 rounded-lg border text-sm font-semibold ${size === option ? 'bg-purple-600 text-white border-purple-600' : 'bg-white'}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-sm font-semibold">Quantity</span>
                                    <div className="flex items-center gap-2">
                                        <button type="button" className="w-8 h-8 rounded-full border" disabled={qty <= 1} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                                        <span className="w-8 text-center">{qty}</span>
                                        <button type="button" className="w-8 h-8 rounded-full border" disabled={qty >= maxQty} onClick={() => setQty(Math.min(maxQty, qty + 1))}>+</button>
                                    </div>
                                    {product.stock <= 5 && <span className="text-sm text-mag font-semibold">{product.stock} left</span>}
                                </div>

                                <button type="button" onClick={() => add('bag')} className="w-full border border-gray-400 rounded-xl py-3 font-semibold bg-white">
                                    👉 Add to bag
                                </button>
                                <button type="button" onClick={() => add('buy')} className="w-full mt-3 rounded-xl py-3 font-semibold bg-black text-white">
                                    Buy it now
                                </button>
                            </>
                        )}

                        <details className="border-t mt-6">
                            <summary className="py-4 font-semibold cursor-pointer">🚚 Shipping</summary>
                            <p className="pb-4 text-gray-600 text-sm">Delivery within 3 days all over Bangladesh. The charge depends on your delivery area and is shown at checkout.</p>
                        </details>
                        <details className="border-t border-b">
                            <summary className="py-4 font-semibold cursor-pointer">↩️ Return &amp; Refund Policy</summary>
                            <p className="pb-4 text-gray-600 text-sm">If you receive a damaged or wrong item, contact us within 3 days of delivery for a replacement or refund.</p>
                        </details>
                    </div>
                </div>

                {related.length > 0 && (
                    <div className="mt-10">
                        <h2 className="font-serif text-3xl mb-4">Related products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {related.map((item) => <ProductCard key={item.id} product={item} />)}
                        </div>
                    </div>
                )}

                <div className="mt-10 bg-white rounded-2xl p-5">
                    <h2 className="font-serif text-2xl mb-3">Customer reviews</h2>
                    {reviews.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4 mb-5">
                            {reviews.map((review) => (
                                <div key={review.id} className="border border-gray-100 rounded-xl p-4">
                                    <div className="text-org">{'★'.repeat(review.stars)}</div>
                                    <p className="my-1 text-sm">{review.text}</p>
                                    <b className="text-xs text-gray-500">{review.name}</b>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mb-5">No approved reviews for this product yet.</p>
                    )}

                    <form onSubmit={submitReview} className="border-t border-gray-100 pt-4">
                        <h3 className="font-semibold mb-2">Write a review</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            <input className="inp" value={reviewForm.data.name} onChange={(event) => reviewForm.setData('name', event.target.value)} placeholder="Your name" />
                            <div className="inp flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold">Rating</span>
                                <StarRating value={reviewForm.data.stars} onChange={(stars) => reviewForm.setData('stars', stars)} />
                            </div>
                        </div>
                        <textarea className="inp mt-3" rows="3" value={reviewForm.data.text} onChange={(event) => reviewForm.setData('text', event.target.value)} placeholder="Your review" required />
                        {reviewForm.errors.text && <div className="text-xs text-red-600">{reviewForm.errors.text}</div>}
                        <button className="btn mt-3" disabled={reviewForm.processing}>Submit review</button>
                        <div className="text-xs text-gray-400 mt-2">Reviews appear after approval.</div>
                    </form>
                </div>
            </section>
        </>
    );
}

Product.layout = (page) => <StoreLayout>{page}</StoreLayout>;

export default Product;
