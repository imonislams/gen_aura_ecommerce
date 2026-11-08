import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DateRangeFilter from '../../../Components/DateRangeFilter';

function Funnel({ range, stages, overall_conversion }) {
    const max = stages[0]?.count || 1;

    return (
        <>
            <Head title="Conversion funnel" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Conversion funnel</h1>
                    <p className="text-sm text-gray-500 mt-1">Visitor-based stages · same date range</p>
                </div>
                <DateRangeFilter range={range} url="/admin/analytics/funnel" />
            </div>

            <div className="grid md:grid-cols-[1.3fr_0.7fr] gap-4 items-start">
                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-4">Visitors → buyers</h2>
                    <div className="grid gap-2">
                        {stages.map((stage) => (
                            <div key={stage.key} className="grid grid-cols-[140px_1fr] gap-3 items-center">
                                <span className="text-sm font-semibold text-gray-600">{stage.label}</span>
                                <div
                                    className="h-9 rounded-lg grad text-white flex items-center justify-between px-3 text-xs font-bold"
                                    style={{ width: `${Math.max(12, (stage.count / max) * 100)}%` }}
                                >
                                    <span>{stage.count.toLocaleString()}</span>
                                    <span>{stage.overall}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3 text-xs mt-4">
                        Stage rate = current stage ÷ previous stage. Overall rate = current stage ÷ visitors. Each stage counts unique visitors with the relevant event in the selected range.
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4">
                        <h2 className="font-semibold mb-3">Stage detail</h2>
                        <div className="overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase text-gray-500">
                                        <th className="px-2 py-2">Stage</th>
                                        <th className="px-2 py-2 text-right">Drop-off</th>
                                        <th className="px-2 py-2 text-right">Stage rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stages.map((stage) => (
                                        <tr key={stage.key} className="border-t border-gray-100">
                                            <td className="px-2 py-2">{stage.label}</td>
                                            <td className="px-2 py-2 text-right">{stage.dropoff.toLocaleString()}</td>
                                            <td className="px-2 py-2 text-right font-semibold">{stage.rate}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4">
                        <div className="text-xs text-gray-500">Overall conversion</div>
                        <div className="text-3xl font-bold gtext">{overall_conversion}%</div>
                        <div className="text-xs text-gray-500 mt-1">Completed buyers ÷ visitors</div>
                    </div>
                </div>
            </div>
        </>
    );
}

Funnel.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Funnel;
