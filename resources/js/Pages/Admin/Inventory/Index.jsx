import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Pagination';

function Inventory({ products, stats, filters }) {
    const [q, setQ] = useState(filters?.q ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [selected, setSelected] = useState(null);

    const form = useForm({ delta: '', note: '' });

    const apply = (overrides = {}) => {
        router.get('/admin/inventory', { q, status, ...overrides }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const openAdjust = (product) => {
        setSelected(product);
        form.reset();
        form.clearErrors();
    };

    const submitAdjust = (event) => {
        event.preventDefault();
        if (!selected) {
            return;
        }
        form.post(`/admin/inventory/${selected.id}/adjust`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setSelected(null);
            },
        });
    };

    return (
        <>
            <Head title="Inventory" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Inventory</h1>
                    <p className="text-sm text-gray-500 mt-1">Stock overview, adjustments and movement history</p>
                </div>
                <Link href="/admin/inventory/movements" className="btn btn-ghost">Movement history</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-xl p-4"><div className="text-xs text-gray-500">Products</div><div className="text-2xl font-bold gtext">{stats.products}</div></div>
                <div className="bg-white rounded-xl p-4"><div className="text-xs text-gray-500">Low stock</div><div className="text-2xl font-bold gtext">{stats.low}</div></div>
                <div className="bg-white rounded-xl p-4"><div className="text-xs text-gray-500">Out of stock</div><div className="text-2xl font-bold gtext">{stats.out}</div></div>
                <div className="bg-white rounded-xl p-4"><div className="text-xs text-gray-500">Total units</div><div className="text-2xl font-bold gtext">{stats.units}</div></div>
            </div>

            <div className="grid md:grid-cols-[1.5fr_0.5fr] gap-4 items-start">
                <div>
                    <div className="bg-white rounded-2xl p-3 mb-4 flex gap-2 flex-wrap items-center">
                        <input className="border rounded-full px-4 py-2 text-sm flex-1 min-w-[160px]" value={q} onChange={(event) => setQ(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && apply()} placeholder="Search product" />
                        <select className="border rounded-full px-3 py-2 text-sm" value={status} onChange={(event) => { setStatus(event.target.value); apply({ status: event.target.value }); }}>
                            <option value="">All stock</option>
                            <option value="low">Low stock</option>
                            <option value="out">Out of stock</option>
                        </select>
                        <button className="btn btn-sm" onClick={() => apply()}>Filter</button>
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
                                        <th className="px-3 py-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="border-t border-gray-100">
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <img src={product.image_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                                                    <b>{product.name}</b>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">{product.category}</td>
                                            <td className="px-3 py-2">৳{Number(product.price).toLocaleString()}</td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${product.stock <= 0 ? 'bg-red-50 text-red-600' : product.stock <= 5 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">{product.status}</td>
                                            <td className="px-3 py-2 text-right">
                                                <button className="text-pur text-sm font-semibold" onClick={() => openAdjust(product)}>Adjust</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.data.length === 0 && <tr><td colSpan="6" className="px-3 py-10 text-center text-gray-500">No products found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination paginator={products} />
                </div>

                <form onSubmit={submitAdjust} className="bg-white rounded-2xl p-5">
                    <h2 className="font-semibold mb-2">Adjust stock</h2>
                    {selected ? (
                        <>
                            <div className="text-sm mb-3">
                                <b>{selected.name}</b>
                                <div className="text-gray-500">Current stock: {selected.stock}</div>
                            </div>
                            <label className="block text-sm mb-3">
                                Change (+/−)
                                <input type="number" className="inp" value={form.data.delta} onChange={(event) => form.setData('delta', event.target.value)} placeholder="e.g. 5 or -2" required />
                                {form.errors.delta && <span className="text-xs text-red-600">{form.errors.delta}</span>}
                            </label>
                            <label className="block text-sm mb-3">
                                Note (optional)
                                <input className="inp" value={form.data.note} onChange={(event) => form.setData('note', event.target.value)} />
                            </label>
                            <button className="btn w-full" disabled={form.processing}>{form.processing ? 'Saving…' : 'Apply adjustment'}</button>
                            <button type="button" className="btn bg-white border text-gray-600 w-full mt-2" onClick={() => setSelected(null)}>Cancel</button>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">Select a product to adjust its stock.</p>
                    )}
                    {form.errors.delta === undefined && form.errors.adjust && <div className="text-xs text-red-600 mt-2">{form.errors.adjust}</div>}
                </form>
            </div>
        </>
    );
}

Inventory.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Inventory;
