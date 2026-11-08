import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DateRangeFilter from '../../../Components/DateRangeFilter';

function Reports({ groups, range }) {
    const query = `range=${encodeURIComponent(range.preset)}&from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;

    return (
        <>
            <Head title="Analytics reports" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Every export uses the selected date range and the same recorded data shown on screen.
                    </p>
                </div>
                <DateRangeFilter range={range} url="/admin/analytics/reports" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {groups.map((group) => (
                    <div key={group.group} className="bg-white rounded-2xl p-4">
                        <h2 className="font-semibold mb-3">{group.group} reports</h2>
                        {group.items.map((item) => (
                            <div key={item.key} className="flex justify-between gap-2 border-t border-gray-100 py-2 text-sm first:border-t-0 first:pt-0">
                                <span>{item.label}</span>
                                <span className="flex gap-2">
                                    <a
                                        href={`/admin/analytics/reports/export/${item.key}/pdf?${query}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold"
                                    >
                                        PDF
                                    </a>
                                    <a
                                        href={`/admin/analytics/reports/export/${item.key}/xlsx?${query}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold"
                                    >
                                        Excel
                                    </a>
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs mt-4">
                Exports are generated from actual analytics and order data. The file matches the selected date filter.
            </div>
        </>
    );
}

Reports.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Reports;
