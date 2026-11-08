import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import Chart from '../../Components/Chart';

const metricLabels = { r: 'Revenue', n: 'Orders', u: 'Units' };

function Dashboard({ daily, monthly, top, low, stats, from, to }) {
    const [mode, setMode] = useState('day');
    const [metric, setMetric] = useState('r');
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo, setDateTo] = useState(to);

    const data = mode === 'day' ? daily : monthly;
    const chart = {
        labels: data.map((row) => row.l),
        datasets: [{
            label: metricLabels[metric],
            data: data.map((row) => row[metric]),
            backgroundColor: '#B03A9A',
            borderRadius: 5,
        }],
    };

    const applyDates = () => {
        router.get('/admin', { from: dateFrom, to: dateTo }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Business overview · Asia/Dhaka</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap text-sm">
                    <input type="date" className="border rounded px-2 py-1" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                    <input type="date" className="border rounded px-2 py-1" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
                    <button className="btn btn-sm" onClick={applyDates}>Show</button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {Object.entries(stats).map(([label, value]) => (
                    <div key={label} className="bg-white rounded-xl p-4">
                        <div className="text-xs text-gray-500">{label}</div>
                        <div className="text-xl font-bold gtext">{value}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl p-4 mb-5">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                    <h2 className="font-semibold">Sales report</h2>
                    <div className="flex gap-2 flex-wrap">
                        <div className="flex gap-1">
                            {[['day', 'Daily'], ['month', 'Monthly']].map(([value, label]) => (
                                <button key={value} className={`px-3 py-1 rounded-full text-xs font-semibold ${mode === value ? 'grad text-white' : 'border'}`} onClick={() => setMode(value)}>
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1">
                            {Object.entries(metricLabels).map(([value, label]) => (
                                <button key={value} className={`px-3 py-1 rounded-full text-xs font-semibold ${metric === value ? 'grad text-white' : 'border'}`} onClick={() => setMetric(value)}>
                                    {label}{value === 'r' ? ' ৳' : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <Chart type="bar" height={280} data={chart} options={{ plugins: { legend: { display: false } } }} />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">Top selling (selected range)</h2>
                    {top.map((item) => (
                        <div key={item.name} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                            <span>{item.name}</span>
                            <b>{item.q} sold</b>
                        </div>
                    ))}
                    {top.length === 0 && <p className="text-sm text-gray-500">No sales in this range.</p>}
                </div>

                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">Low / out of stock</h2>
                    {low.map((product) => (
                        <div key={product.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                            <span>{product.name}</span>
                            <b className={product.stock <= 0 ? 'text-red-600' : 'text-mag'}>{product.stock} left</b>
                        </div>
                    ))}
                    {low.length === 0 && <p className="text-sm text-gray-500">All products are well stocked.</p>}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Dashboard;
