import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DateRangeFilter from '../../../Components/DateRangeFilter';
import ReportTabs, { queryString } from '../../../Components/ReportTabs';

function ReportsIndex({ groups, group, range }) {
    const visible = group === 'all' ? groups : groups.filter((item) => item.group === group);
    const query = queryString(range, { group });

    return (
        <>
            <Head title="Reports" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View, print and download any report. Use the category tabs and date filter to narrow it down.
                    </p>
                </div>
                <DateRangeFilter range={range} url="/admin/reports" extra={{ group }} />
            </div>

            <ReportTabs groups={groups} active={group} range={range} />

            <div className="grid md:grid-cols-2 gap-4">
                {visible.map((item) => (
                    <div key={item.group} className="bg-white rounded-2xl p-4">
                        <h2 className="font-semibold mb-3">{item.group} reports</h2>
                        {item.items.map((report) => (
                            <div
                                key={report.key}
                                className="flex justify-between items-center gap-2 border-t border-gray-100 py-2 text-sm first:border-t-0 first:pt-0"
                            >
                                <Link
                                    href={`/admin/reports/${report.key}?${query}`}
                                    className="font-semibold hover:text-pur"
                                >
                                    {report.label}
                                </Link>
                                <span className="flex gap-2 shrink-0">
                                    <Link
                                        href={`/admin/reports/${report.key}?${query}`}
                                        className="px-2 py-0.5 rounded-full bg-purple-50 text-pur text-xs font-bold"
                                    >
                                        View
                                    </Link>
                                    <a
                                        href={`/admin/analytics/reports/export/${report.key}/pdf?${query}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold"
                                    >
                                        PDF
                                    </a>
                                    <a
                                        href={`/admin/analytics/reports/export/${report.key}/xlsx?${query}`}
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
                Every report uses the selected date range and the same recorded data shown on screen. Stock reports show
                current stock regardless of the date filter.
            </div>
        </>
    );
}

ReportsIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default ReportsIndex;
