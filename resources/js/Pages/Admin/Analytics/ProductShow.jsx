import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DateRangeFilter from '../../../Components/DateRangeFilter';
import Chart from '../../../Components/Chart';

function ProductShow({ range, product, metrics, chart, timeline }) {
    const trend = {
        labels: chart.labels,
        datasets: [{
            label: 'Views',
            data: chart.views,
            borderColor: '#8E3FD0',
            backgroundColor: 'rgba(142,63,208,.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 2,
        }],
    };

    const cards = [
        ['Views', metrics.views],
        ['Unique viewers', metrics.unique_viewers],
        ['Add to cart', metrics.add_to_cart],
        ['Removals', metrics.removals],
        ['Orders', metrics.orders],
        ['Units sold', metrics.units],
        ['Revenue', `৳${Number(metrics.revenue).toLocaleString()}`],
        ['Conversion', `${metrics.conversion}%`],
    ];

    return (
        <>
            <Head title={`Product analytics · ${product.name}`} />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <Link href="/admin/analytics/products" className="text-sm text-pur font-semibold">← Product analytics</Link>
                    <div className="flex items-center gap-3 mt-1">
                        <img src={product.image_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                            <h1 className="font-serif text-3xl font-bold">{product.name}</h1>
                            <p className="text-sm text-gray-500">৳{Number(product.price).toLocaleString()} · stock {product.stock} · {product.status}</p>
                        </div>
                    </div>
                </div>
                <DateRangeFilter range={range} url={`/admin/analytics/products/${product.id}`} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {cards.map(([label, value]) => (
                    <div key={label} className="bg-white rounded-xl p-4">
                        <div className="text-xs text-gray-500">{label}</div>
                        <div className="text-xl font-bold gtext">{value}</div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-[1.4fr_0.6fr] gap-4 items-start">
                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">Views over time</h2>
                    <Chart type="line" height={280} data={trend} />
                </div>

                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">Visitor activity</h2>
                    <div className="relative pl-5 max-h-[360px] overflow-auto">
                        <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-purple-100" />
                        {timeline.map((event) => (
                            <div key={event.id} className="relative pb-3">
                                <span className="absolute -left-[15px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-purple-50" />
                                <div className="text-xs text-gray-400">{event.occurred_at ? new Date(event.occurred_at).toLocaleString() : ''} · #{event.short}</div>
                                <div className="text-sm font-semibold">{event.event_type}</div>
                                <div className="text-xs text-gray-500">{event.device}{event.metadata?.qty ? ` · qty ${event.metadata.qty}` : ''}</div>
                            </div>
                        ))}
                        {timeline.length === 0 && <p className="text-sm text-gray-500">No activity for this product.</p>}
                    </div>
                </div>
            </div>
        </>
    );
}

ProductShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default ProductShow;
