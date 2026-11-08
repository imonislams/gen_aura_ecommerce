import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Pagination';

function Products({ products, filters }) {
    const [q, setQ] = useState(filters?.q ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [low, setLow] = useState(!!filters?.low);
    const [trashed, setTrashed] = useState(!!filters?.trashed);

    const apply = (overrides = {}) => {
        router.get('/admin/products', {
            q,
            status,
            low: low ? 1 : undefined,
            trashed: trashed ? 1 : undefined,
            ...overrides,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const remove = (product) => {
        if (window.confirm(`Delete "${product.name}"? It can be restored.`)) {
            router.delete(`/admin/products/${product.id}`, { preserveScroll: true });
        }
    };

    const restore = (product) => {
        router.patch(`/admin/products/${product.id}/restore`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Products" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Products</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage catalog, stock and visibility</p>
                </div>
                <Link href="/admin/products/create" className="btn">+ Add product</Link>
            </div>

            <div className="bg-white rounded-2xl p-3 mb-4 flex gap-2 flex-wrap items-center">
                <input
                    className="border rounded-full px-4 py-2 text-sm flex-1 min-w-[160px]"
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && apply()}
                    placeholder="Search name or SKU"
                />
                <select className="border rounded-full px-3 py-2 text-sm" value={status} onChange={(event) => { setStatus(event.target.value); apply({ status: event.target.value }); }}>
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <label className="text-sm flex items-center gap-2">
                    <input type="checkbox" checked={low} onChange={(event) => { setLow(event.target.checked); apply({ low: event.target.checked ? 1 : undefined }); }} />
                    Low stock
                </label>
                <label className="text-sm flex items-center gap-2">
                    <input type="checkbox" checked={trashed} onChange={(event) => { setTrashed(event.target.checked); apply({ trashed: event.target.checked ? 1 : undefined }); }} />
                    Deleted only
                </label>
                <button className="btn btn-sm" onClick={() => apply()}>Search</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-purple-50/40">
                                <th className="px-3 py-2">Product</th>
                                <th className="px-3 py-2">Category</th>
                                <th className="px-3 py-2">Price</th>
                                <th className="px-3 py-2">Stock</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Flags</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.map((product) => (
                                <tr key={product.id} className="border-t border-gray-100">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            <div>
                                                <b className="block">{product.name}</b>
                                                <span className="text-xs text-gray-400">{product.slug}{product.sku ? ` · ${product.sku}` : ''}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">{product.category}</td>
                                    <td className="px-3 py-2">৳{Number(product.price).toLocaleString()}</td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${product.stock <= 3 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${product.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-xs">
                                        {product.featured && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">featured</span>}
                                        {product.trashed && <span className="ml-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600">deleted</span>}
                                    </td>
                                    <td className="px-3 py-2 text-right whitespace-nowrap">
                                        {product.trashed ? (
                                            <button className="text-green-600 text-sm font-semibold" onClick={() => restore(product)}>Restore</button>
                                        ) : (
                                            <>
                                                <Link href={`/admin/products/${product.id}/edit`} className="text-pur text-sm font-semibold mr-2">Edit</Link>
                                                <button className="text-red-500 text-sm font-semibold" onClick={() => remove(product)}>Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {products.data.length === 0 && (
                                <tr><td colSpan="7" className="px-3 py-10 text-center text-gray-500">No products found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination paginator={products} />
        </>
    );
}

Products.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Products;
