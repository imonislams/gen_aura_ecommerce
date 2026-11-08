import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../../Layouts/AdminLayout';
import DateRangeFilter from '../../../../Components/DateRangeFilter';
import Pagination from '../../../../Components/Pagination';

const typeOptions = [
    ['', 'All visitors'],
    ['new', 'New'],
    ['returning', 'Returning'],
];

const deviceOptions = [
    ['', 'All devices'],
    ['mobile', 'Mobile'],
    ['desktop', 'Desktop'],
    ['tablet', 'Tablet'],
];

const hasOptions = [
    ['', 'Any activity'],
    ['product', 'Product viewers'],
    ['cart', 'Cart visitors'],
    ['checkout', 'Checkout visitors'],
    ['ordered', 'Completed buyers'],
    ['no_orders', 'No orders'],
];

function Visitors({ visitors, range, filters }) {
    const [q, setQ] = useState(filters?.q ?? '');
    const [type, setType] = useState(filters?.type ?? '');
    const [device, setDevice] = useState(filters?.device ?? '');
    const [has, setHas] = useState(filters?.has ?? '');

    const apply = (overrides = {}) => {
        router.get('/admin/analytics/visitors', {
            q,
            type,
            device,
            has,
            ...overrides,
            range: range.preset,
            from: range.from,
            to: range.to,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <>
            <Head title="All visitors" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">All visitors</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {visitors.total.toLocaleString()} visitors · anonymous first-party IDs
                    </p>
                </div>
                <DateRangeFilter
                    range={range}
                    url="/admin/analytics/visitors"
                    extra={{ q, type, device, has }}
                />
            </div>

            <div className="bg-white rounded-2xl p-3 mb-4 flex gap-2 flex-wrap items-center">
                <input
                    className="border rounded-full px-3 py-1.5 text-sm"
                    placeholder="Search visitor ID"
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && apply()}
                />
                <select className="border rounded-full px-3 py-1.5 text-sm" value={type} onChange={(event) => { setType(event.target.value); apply({ type: event.target.value }); }}>
                    {typeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <select className="border rounded-full px-3 py-1.5 text-sm" value={device} onChange={(event) => { setDevice(event.target.value); apply({ device: event.target.value }); }}>
                    {deviceOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <select className="border rounded-full px-3 py-1.5 text-sm" value={has} onChange={(event) => { setHas(event.target.value); apply({ has: event.target.value }); }}>
                    {hasOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <button className="btn btn-sm" onClick={() => apply()}>Search</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-purple-50/40">
                                <th className="px-3 py-2">Visitor</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2">First visit</th>
                                <th className="px-3 py-2">Last visit</th>
                                <th className="px-3 py-2">Sessions</th>
                                <th className="px-3 py-2">Page views</th>
                                <th className="px-3 py-2">Device</th>
                                <th className="px-3 py-2">Browser</th>
                                <th className="px-3 py-2">Last activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitors.data.map((visitor) => (
                                <tr key={visitor.uuid} className="border-t border-gray-100">
                                    <td className="px-3 py-2">
                                        <Link href={`/admin/analytics/visitors/${visitor.uuid}`} className="text-pur font-semibold">
                                            #{visitor.short}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${visitor.type === 'new' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                            {visitor.type}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-gray-500">{visitor.first_seen_at ? new Date(visitor.first_seen_at).toLocaleDateString() : '—'}</td>
                                    <td className="px-3 py-2 text-gray-500">{visitor.last_seen_at ? new Date(visitor.last_seen_at).toLocaleDateString() : '—'}</td>
                                    <td className="px-3 py-2">{visitor.total_sessions}</td>
                                    <td className="px-3 py-2">{visitor.total_page_views}</td>
                                    <td className="px-3 py-2">{visitor.device_type}</td>
                                    <td className="px-3 py-2">{visitor.browser}</td>
                                    <td className="px-3 py-2 text-gray-500">{visitor.last_path}</td>
                                </tr>
                            ))}
                            {visitors.data.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-3 py-10 text-center text-gray-500">No visitors match these filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination paginator={visitors} />
        </>
    );
}

Visitors.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Visitors;
