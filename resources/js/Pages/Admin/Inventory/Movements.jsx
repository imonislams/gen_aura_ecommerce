import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Pagination';
import { dhakaDateTime } from '../../../lib/datetime';

function Movements({ movements, filters, types, products }) {
    const [product, setProduct] = useState(filters?.product ?? '');
    const [type, setType] = useState(filters?.type ?? '');

    const apply = (overrides = {}) => {
        router.get('/admin/inventory/movements', { product, type, ...overrides }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <>
            <Head title="Stock movements" />

            <div className="mb-4">
                <Link href="/admin/inventory" className="text-sm text-pur font-semibold">← Inventory</Link>
                <h1 className="font-serif text-3xl font-bold mt-1">Stock movements</h1>
                <p className="text-sm text-gray-500 mt-1">Every sale, cancellation, reopen and manual adjustment</p>
            </div>

            <div className="bg-white rounded-2xl p-3 mb-4 flex gap-2 flex-wrap items-center">
                <select className="border rounded-full px-3 py-2 text-sm" value={product} onChange={(event) => { setProduct(event.target.value); apply({ product: event.target.value }); }}>
                    <option value="">All products</option>
                    {products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <select className="border rounded-full px-3 py-2 text-sm" value={type} onChange={(event) => { setType(event.target.value); apply({ type: event.target.value }); }}>
                    <option value="">All types</option>
                    {types.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <button className="btn btn-sm" onClick={() => apply()}>Filter</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-purple-50/40">
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2">Product</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2 text-right">Change</th>
                                <th className="px-3 py-2 text-right">Before</th>
                                <th className="px-3 py-2 text-right">After</th>
                                <th className="px-3 py-2">Reference</th>
                                <th className="px-3 py-2">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.data.map((movement) => (
                                <tr key={movement.id} className="border-t border-gray-100">
                                    <td className="px-3 py-2 text-gray-500">{dhakaDateTime(movement.created_at)}</td>
                                    <td className="px-3 py-2">{movement.product}</td>
                                    <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700">{movement.type}</span></td>
                                    <td className={`px-3 py-2 text-right font-bold ${movement.quantity_delta < 0 ? 'text-red-600' : 'text-green-700'}`}>{movement.quantity_delta > 0 ? '+' : ''}{movement.quantity_delta}</td>
                                    <td className="px-3 py-2 text-right">{movement.stock_before}</td>
                                    <td className="px-3 py-2 text-right">{movement.stock_after}</td>
                                    <td className="px-3 py-2 text-gray-500">{movement.reference_type ? `${movement.reference_type} #${movement.reference_id}` : '—'}</td>
                                    <td className="px-3 py-2 text-gray-500">{movement.note || '—'}</td>
                                </tr>
                            ))}
                            {movements.data.length === 0 && <tr><td colSpan="8" className="px-3 py-10 text-center text-gray-500">No stock movements yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination paginator={movements} />
        </>
    );
}

Movements.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Movements;
