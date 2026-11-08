import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';

function Live({ initial }) {
    const [data, setData] = useState(initial);
    const [updatedAt, setUpdatedAt] = useState(new Date());
    const intervalRef = useRef(null);

    useEffect(() => {
        const refresh = async () => {
            if (document.hidden) {
                return;
            }
            try {
                const response = await fetch('/admin/analytics/live/data', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                if (response.ok) {
                    setData(await response.json());
                    setUpdatedAt(new Date());
                }
            } catch (error) {
                // Keep the last known data; no need to interrupt the admin.
            }
        };

        intervalRef.current = setInterval(refresh, (data.refresh_seconds || 20) * 1000);
        document.addEventListener('visibilitychange', refresh);

        return () => {
            clearInterval(intervalRef.current);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, [data.refresh_seconds]);

    const counters = [
        ['Active visitors', data.active],
        ['Homepage', data.pages.home],
        ['Shop', data.pages.shop],
        ['Product pages', data.pages.product],
        ['Cart', data.pages.cart],
        ['Checkout', data.pages.checkout],
    ];

    return (
        <>
            <Head title="Live visitors" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Live visitors</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Active in the last 30 minutes · updated every {data.refresh_seconds || 20}s, not real-time
                    </p>
                </div>
                <span className="text-xs text-gray-400">
                    Last updated {updatedAt.toLocaleTimeString()}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5">
                {counters.map(([label, value]) => (
                    <div key={label} className="bg-white rounded-xl p-4">
                        <div className="text-xs text-gray-500">{label}</div>
                        <div className="text-2xl font-bold gtext">{value}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-purple-50/40">
                                <th className="px-3 py-2">Visitor</th>
                                <th className="px-3 py-2">Device</th>
                                <th className="px-3 py-2">Browser</th>
                                <th className="px-3 py-2">Current page</th>
                                <th className="px-3 py-2">Activity</th>
                                <th className="px-3 py-2">Session start</th>
                                <th className="px-3 py-2">Last activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map((row) => (
                                <tr key={`${row.short}-${row.started_at}`} className="border-t border-gray-100">
                                    <td className="px-3 py-2 font-semibold">#{row.short}</td>
                                    <td className="px-3 py-2">{row.device}</td>
                                    <td className="px-3 py-2">{row.browser}</td>
                                    <td className="px-3 py-2">{row.current_page}</td>
                                    <td className="px-3 py-2">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700">
                                            {row.activity || '—'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-gray-500">
                                        {row.started_at ? new Date(row.started_at).toLocaleTimeString() : '—'}
                                    </td>
                                    <td className="px-3 py-2 text-gray-500">
                                        {row.last_activity ? new Date(row.last_activity).toLocaleTimeString() : '—'}
                                    </td>
                                </tr>
                            ))}
                            {data.rows.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-3 py-10 text-center text-gray-500">
                                        No active visitors right now.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs mt-4">
                Polling pauses while this tab is hidden. Values are updated periodically, not in real time.
            </div>
        </>
    );
}

Live.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Live;
