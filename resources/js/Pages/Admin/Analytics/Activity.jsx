import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DateRangeFilter from '../../../Components/DateRangeFilter';
import Pagination from '../../../Components/Pagination';

function Activity({ range, events, pages, searches, event_types, filters }) {
    const [eventType, setEventType] = useState(filters?.event_type ?? '');

    const apply = (overrides = {}) => {
        router.get('/admin/analytics/activity', {
            event_type: eventType,
            ...overrides,
            range: range.preset,
            from: range.from,
            to: range.to,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <>
            <Head title="Visitor activity" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Visitor activity</h1>
                    <p className="text-sm text-gray-500 mt-1">Event feed and page performance</p>
                </div>
                <DateRangeFilter range={range} url="/admin/analytics/activity" extra={{ event_type: eventType }} />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">Page performance</h2>
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase text-gray-500">
                                    <th className="px-2 py-2">Page</th>
                                    <th className="px-2 py-2 text-right">Views</th>
                                    <th className="px-2 py-2 text-right">Visitors</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pages.map((page) => (
                                    <tr key={page.path} className="border-t border-gray-100">
                                        <td className="px-2 py-2 truncate">{page.path}</td>
                                        <td className="px-2 py-2 text-right">{page.views.toLocaleString()}</td>
                                        <td className="px-2 py-2 text-right">{page.visitors.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {pages.length === 0 && <tr><td colSpan="3" className="px-2 py-6 text-center text-gray-500">No page views.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">Top searches</h2>
                    {searches.map((search) => (
                        <div key={search.term} className="flex justify-between text-sm border-t border-gray-100 py-2 first:border-t-0 first:pt-0">
                            <span>{search.term}</span>
                            <b>{search.total}</b>
                        </div>
                    ))}
                    {searches.length === 0 && <p className="text-sm text-gray-500">No searches yet.</p>}
                </div>
            </div>

            <div className="bg-white rounded-2xl p-3 mb-4">
                <select
                    className="border rounded-full px-3 py-1.5 text-sm"
                    value={eventType}
                    onChange={(event) => { setEventType(event.target.value); apply({ event_type: event.target.value }); }}
                >
                    <option value="">All events</option>
                    {event_types.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-purple-50/40">
                                <th className="px-3 py-2">Time</th>
                                <th className="px-3 py-2">Visitor</th>
                                <th className="px-3 py-2">Event</th>
                                <th className="px-3 py-2">Page</th>
                                <th className="px-3 py-2">Product</th>
                                <th className="px-3 py-2">Device</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.data.map((event) => (
                                <tr key={event.id} className="border-t border-gray-100">
                                    <td className="px-3 py-2 text-gray-500">{event.occurred_at ? new Date(event.occurred_at).toLocaleString() : ''}</td>
                                    <td className="px-3 py-2 font-semibold">#{event.short}</td>
                                    <td className="px-3 py-2">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700">{event.event_type}</span>
                                    </td>
                                    <td className="px-3 py-2">{event.path}</td>
                                    <td className="px-3 py-2">{event.product_id ? `#${event.product_id}` : '—'}</td>
                                    <td className="px-3 py-2">{event.device}</td>
                                </tr>
                            ))}
                            {events.data.length === 0 && <tr><td colSpan="6" className="px-3 py-10 text-center text-gray-500">No events for this filter.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination paginator={events} />
        </>
    );
}

Activity.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Activity;
