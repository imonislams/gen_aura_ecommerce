import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DateRangeFilter from '../../../Components/DateRangeFilter';
import Chart from '../../../Components/Chart';

const fmtDuration = (seconds) => {
    const total = Number(seconds) || 0;
    const minutes = Math.floor(total / 60);
    return `${minutes}m ${total % 60}s`;
};

const fmt = (value) => Number(value || 0).toLocaleString();

function Overview({ range, kpis, charts, timeline }) {
    const cards = [
        ['Total visitors', fmt(kpis.total_visitors)],
        ['Unique visitors', fmt(kpis.unique_visitors)],
        ['New visitors', fmt(kpis.new_visitors)],
        ['Returning visitors', fmt(kpis.returning_visitors)],
        ['Total sessions', fmt(kpis.total_sessions)],
        ['Total page views', fmt(kpis.total_page_views)],
        ['Avg session duration', fmtDuration(kpis.avg_session_duration)],
        ['Bounce rate', `${kpis.bounce_rate}%`],
        ['Product views', fmt(kpis.product_views)],
        ['Add to cart', fmt(kpis.add_to_cart)],
        ['Checkout started', fmt(kpis.checkout_started)],
        ['Completed orders', fmt(kpis.completed_orders)],
    ];

    const trend = {
        labels: charts.labels,
        datasets: [
            {
                label: 'Visitors',
                data: charts.visitors,
                borderColor: '#8E3FD0',
                backgroundColor: 'rgba(142,63,208,.12)',
                fill: true,
                tension: 0.35,
                pointRadius: 2,
            },
            {
                label: 'Page views',
                data: charts.page_views,
                borderColor: '#E3A04A',
                backgroundColor: 'transparent',
                tension: 0.35,
                pointRadius: 2,
            },
        ],
    };

    const nvr = {
        labels: ['New', 'Returning'],
        datasets: [
            {
                data: [kpis.new_visitors, kpis.returning_visitors],
                backgroundColor: ['#8E3FD0', '#E3A04A'],
                borderWidth: 0,
            },
        ],
    };

    const devices = {
        labels: charts.devices.map((item) => item.label),
        datasets: [
            {
                data: charts.devices.map((item) => item.value),
                backgroundColor: ['#8E3FD0', '#E3A04A', '#B03A9A', '#2f6fdf', '#2b2233'],
                borderWidth: 0,
            },
        ],
    };

    const browsers = {
        labels: charts.browsers.map((item) => item.label),
        datasets: [
            {
                label: 'Sessions',
                data: charts.browsers.map((item) => item.value),
                backgroundColor: '#B03A9A',
                borderRadius: 6,
            },
        ],
    };

    const maxPageViews = Math.max(1, ...charts.pages.map((page) => page.views));

    return (
        <>
            <Head title="Analytics overview" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Analytics overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Actual recorded events · Asia/Dhaka reporting</p>
                </div>
                <DateRangeFilter range={range} url="/admin/analytics" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {cards.map(([label, value]) => (
                    <div key={label} className="bg-white rounded-xl p-4">
                        <div className="text-xs text-gray-500">{label}</div>
                        <div className="text-xl font-bold gtext">{value}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <h2 className="font-semibold">Visitors & page views over time</h2>
                    <span className="text-xs text-gray-400">{range.label}</span>
                </div>
                <Chart type="line" height={260} data={trend} />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-2">New vs returning</h2>
                    <Chart type="doughnut" height={220} data={nvr} options={{ plugins: { legend: { position: 'bottom' } } }} />
                </div>
                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-2">Device distribution</h2>
                    <Chart type="doughnut" height={220} data={devices} options={{ plugins: { legend: { position: 'bottom' } } }} />
                </div>
                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-2">Browser distribution</h2>
                    <Chart type="bar" height={220} data={browsers} options={{ plugins: { legend: { display: false } } }} />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">Most visited pages</h2>
                    {charts.pages.map((page) => (
                        <div key={page.path} className="mb-2">
                            <div className="flex justify-between text-sm">
                                <span className="truncate">{page.path}</span>
                                <b>{fmt(page.views)}</b>
                            </div>
                            <div className="h-2 rounded-full bg-purple-50 overflow-hidden">
                                <div className="h-full rounded-full grad" style={{ width: `${(page.views / maxPageViews) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                    {charts.pages.length === 0 && <p className="text-sm text-gray-500">No page views in this range.</p>}
                </div>

                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">Most viewed products</h2>
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase text-gray-500">
                                    <th className="px-2 py-2">Product</th>
                                    <th className="px-2 py-2 text-right">Views</th>
                                </tr>
                            </thead>
                            <tbody>
                                {charts.products.map((product) => (
                                    <tr key={product.id} className="border-t border-gray-100">
                                        <td className="px-2 py-2">
                                            <Link href={`/admin/analytics/products/${product.id}`} className="text-pur font-semibold">
                                                {product.name}
                                            </Link>
                                        </td>
                                        <td className="px-2 py-2 text-right">{fmt(product.views)}</td>
                                    </tr>
                                ))}
                                {charts.products.length === 0 && (
                                    <tr>
                                        <td colSpan="2" className="px-2 py-6 text-center text-gray-500">No product views yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4">
                <h2 className="font-semibold mb-3">Visitor activity timeline</h2>
                <div className="relative pl-5">
                    <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-purple-100" />
                    {timeline.map((event) => (
                        <div key={event.id} className="relative pb-3">
                            <span className="absolute -left-[15px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-purple-50" />
                            <div className="text-xs text-gray-400">
                                {event.occurred_at ? new Date(event.occurred_at).toLocaleString() : ''} · #{event.short}
                            </div>
                            <div className="text-sm font-semibold">
                                {event.event_type} {event.page_type ? `· ${event.page_type}` : ''}
                            </div>
                            <div className="text-xs text-gray-500">{event.path} · {event.device}</div>
                        </div>
                    ))}
                    {timeline.length === 0 && <p className="text-sm text-gray-500">No activity recorded yet.</p>}
                </div>
            </div>
        </>
    );
}

Overview.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Overview;
