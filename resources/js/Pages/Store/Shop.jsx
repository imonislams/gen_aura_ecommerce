import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import StoreLayout from '../../Layouts/StoreLayout';
import ProductCard from '../../Components/ProductCard';
import Pagination from '../../Components/Pagination';

function Shop({ products, filters, categories }) {
    const currentFilters = filters && !Array.isArray(filters) ? filters : {};

    const [cat, setCat] = useState(currentFilters.cat ?? '');
    const [q, setQ] = useState(currentFilters.q ?? '');
    const [min, setMin] = useState(currentFilters.min ?? '');
    const [max, setMax] = useState(currentFilters.max ?? '');
    const [sort, setSort] = useState(typeof currentFilters.sort === 'string' ? currentFilters.sort : 'new');
    const [stock, setStock] = useState(!!currentFilters.stock);

    const apply = (overrides = {}) => {
        router.get('/shop', {
            cat,
            q,
            min,
            max,
            sort,
            stock: stock ? 1 : undefined,
            ...overrides,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['products', 'filters'],
        });
    };

    const chooseCategory = (value) => {
        setCat(value);
        apply({ cat: value });
    };

    return (
        <>
            <Head title="Shop" />

            <section className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="font-serif text-3xl mb-4">All products</h1>

                <div className="flex gap-2 flex-wrap mb-4">
                    <button
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold ${cat ? 'bg-white border' : 'grad text-white'}`}
                        onClick={() => chooseCategory('')}
                    >
                        All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${cat === category.name ? 'grad text-white' : 'bg-white border'}`}
                            onClick={() => chooseCategory(category.name)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl p-3 mb-5 grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                    <input
                        className="inp !mt-0 col-span-2"
                        name="q"
                        value={q}
                        onChange={(event) => setQ(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && apply()}
                        placeholder="Search products"
                    />
                    <input
                        type="number"
                        className="inp !mt-0"
                        value={min}
                        onChange={(event) => setMin(event.target.value)}
                        placeholder="Min ৳"
                    />
                    <input
                        type="number"
                        className="inp !mt-0"
                        value={max}
                        onChange={(event) => setMax(event.target.value)}
                        placeholder="Max ৳"
                    />
                    <select className="inp !mt-0" value={sort} onChange={(event) => { setSort(event.target.value); apply({ sort: event.target.value }); }}>
                        <option value="new">Newest</option>
                        <option value="low">Price: Low to High</option>
                        <option value="high">Price: High to Low</option>
                    </select>
                    <label className="text-sm flex items-center gap-2 col-span-2">
                        <input type="checkbox" checked={stock} onChange={(event) => { setStock(event.target.checked); apply({ stock: event.target.checked ? 1 : undefined }); }} />
                        In stock only
                    </label>
                    <button className="btn col-span-2" onClick={() => apply()}>
                        Apply filters
                    </button>
                </div>

                {products.data.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {products.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No products found.</p>
                )}

                <Pagination paginator={products} />
            </section>
        </>
    );
}

Shop.layout = (page) => <StoreLayout>{page}</StoreLayout>;

export default Shop;
