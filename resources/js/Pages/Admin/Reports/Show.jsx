import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ReportTabs, { queryString } from '../../../Components/ReportTabs';

function ReportsShow({ report, groups, range }) {
    const { settings } = usePage().props;

    const activeGroup = groups.find((group) => group.items.some((item) => item.key === report.key));
    const siblings = activeGroup?.items ?? [];
    const group = activeGroup?.group ?? 'all';

    const query = queryString(range, { group });

    return (
        <>
            <Head title={report.title}>
                <style>{`
                    @media print {
                        body { background: #fff !important; }
                        @page { margin: 12mm; }
                    }
                `}</style>
            </Head>

            <div className="flex items-center justify-between gap-3 flex-wrap mb-4 print:hidden">
                <Link href={`/admin/reports?${query}`} className="text-sm text-pur font-semibold">
                    ← All reports
                </Link>
                <div className="flex gap-2">
                    <button type="button" className="btn bg-white border text-gray-600" onClick={() => window.print()}>
                        Print
                    </button>
                    <a
                        href={`/admin/analytics/reports/export/${report.key}/pdf?${query}`}
                        className="btn"
                    >
                        Download PDF
                    </a>
                    <a
                        href={`/admin/analytics/reports/export/${report.key}/xlsx?${query}`}
                        className="px-4 py-2 rounded-full text-sm font-semibold bg-white border text-gray-600"
                    >
                        Excel
                    </a>
                </div>
            </div>

            <div className="print:hidden">
                <ReportTabs groups={groups} active={group} range={range} />
            </div>

            {siblings.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4 print:hidden">
                    {siblings.map((item) => (
                        <Link
                            key={item.key}
                            href={`/admin/reports/${item.key}?${query}`}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.key === report.key
                                    ? 'grad text-white'
                                    : 'bg-white border border-purple-100 text-gray-600 hover:bg-purple-50'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 print:shadow-none print:rounded-none print:p-0">
                <div className="flex justify-between gap-4 flex-wrap border-b border-gray-200 pb-4">
                    <div>
                        <div className="font-serif text-2xl font-bold text-pur">{settings.name}</div>
                        <div className="text-sm text-gray-500">{settings.top}</div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        <div className="text-base font-bold text-gray-900">{report.title}</div>
                        <div>{range.label}</div>
                        <div>
                            {range.from} – {range.to}
                        </div>
                    </div>
                </div>

                <div className="overflow-auto mt-4">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-200">
                                {report.headings.map((heading) => (
                                    <th key={heading} className="py-2 px-1">
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {report.rows.map((row, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="py-2 px-1">
                                            {cell === null || cell === '' ? '—' : cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {report.rows.length === 0 && (
                                <tr>
                                    <td colSpan={report.headings.length} className="py-3 px-1 text-gray-500">
                                        No data for this range.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-500 print:bg-white">
                    {settings.name} · {report.title} · {range.label} · Generated from actual recorded data.
                </div>
            </div>
        </>
    );
}

ReportsShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default ReportsShow;
