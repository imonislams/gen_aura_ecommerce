import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DateRangeFilter from '../../../Components/DateRangeFilter';
import Chart from '../../../Components/Chart';

function Checkout({ range, kpis, abandoned }) {
    const cards = [
        ['Checkout started', kpis.started],
        ['Unique checkout visitors', kpis.unique_starters],
        ['Completed', kpis.completed],
        ['Buyers', kpis.buyers],
        ['Abandoned', kpis.abandoned],
        ['Completion rate', `${kpis.completion_rate}%`],
    ];

    const donut = {
        labels: ['Completed', 'Abandoned'],
        datasets: [{
            data: [kpis.completed, Math.max(0, kpis.started - kpis.completed)],
            backgroundColor: ['#1f8a55', '#efe8e2'],
            borderWidth: 0,
        }],
    };

    return (
        <>
            <Head title="Checkout analytics" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Checkout analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Started vs completed vs abandoned</p>
                </div>
                <DateRangeFilter range={range} url="/admin/analytics/checkout" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                {cards.map(([label, value]) => (
                    <div key={label} className="bg-white rounded-xl p-4">
                        <div className="text-xs text-gray-500">{label}</div>
                        <div className="text-2xl font-bold gtext">{value}</div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-[.6fr_1.4fr] gap-4 items-start mb-4">
                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-2">Completion rate</h2>
                    <Chart type="doughnut" height={230} data={donut} options={{ plugins: { legend: { position: 'bottom' } } }} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 pb-0">
                        <h2 className="font-semibold">Abandoned checkouts</h2>
                        <p className="text-xs text-gray-500 mb-2">No automated messages are sent.</p>
                    </div>
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-purple-50/40">
                                    <th className="px-3 py-2">Visitor</th>
                                    <th className="px-3 py-2">Last page</th>
                                    <th className="px-3 py-2">Last activity</th>
                                    <th className="px-3 py-2">Abandoned for</th>
                                </tr>
                            </thead>
                            <tbody>
                                {abandoned.map((row) => (
                                    <tr key={row.session_id} className="border-t border-gray-100">
                                        <td className="px-3 py-2">
                                            {row.uuid ? <Link href={`/admin/analytics/visitors/${row.uuid}`} className="text-pur font-semibold">#{row.short}</Link> : `#${row.short}`}
                                        </td>
                                        <td className="px-3 py-2">{row.last_path}</td>
                                        <td className="px-3 py-2 text-gray-500">{row.last_activity_at ? new Date(row.last_activity_at).toLocaleString() : '—'}</td>
                                        <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">{row.abandoned_for}</span></td>
                                    </tr>
                                ))}
                                {abandoned.length === 0 && <tr><td colSpan="4" className="px-3 py-10 text-center text-gray-500">No abandoned checkouts.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

Checkout.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Checkout;
