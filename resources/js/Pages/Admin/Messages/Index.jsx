import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Pagination';
import { dhakaDateTime } from '../../../lib/datetime';

const statusClass = (status) => {
    if (status === 'new') return 'bg-amber-50 text-amber-700';
    if (status === 'read') return 'bg-green-50 text-green-700';
    return 'bg-gray-100 text-gray-500';
};

function Messages({ messages, filters, statuses, unread }) {
    const [q, setQ] = useState(filters?.q ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');

    const apply = (overrides = {}) => {
        router.get('/admin/messages', { q, status, ...overrides }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const setMessageStatus = (message, nextStatus) => {
        router.patch(`/admin/messages/${message.id}/status`, { status: nextStatus }, { preserveScroll: true });
    };

    const remove = (message) => {
        if (window.confirm('Delete this message?')) {
            router.delete(`/admin/messages/${message.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Messages" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Messages</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Contact form inquiries · separate from customer and visitor data
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    {unread > 0 && (
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold">
                            {unread} new
                        </span>
                    )}
                    <input
                        className="border rounded-full px-4 py-2 text-sm"
                        value={q}
                        onChange={(event) => setQ(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && apply()}
                        placeholder="Search name, phone, email"
                    />
                    <select
                        className="border rounded-full px-3 py-2 text-sm"
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value);
                            apply({ status: event.target.value });
                        }}
                    >
                        <option value="">All statuses</option>
                        {statuses.map((value) => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>
                    <button className="btn btn-sm" onClick={() => apply()}>Filter</button>
                </div>
            </div>

            <div className="space-y-3">
                {messages.data.map((message) => (
                    <div key={message.id} className="bg-white rounded-2xl p-4">
                        <div className="flex justify-between gap-3 flex-wrap">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <b>{message.name}</b>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusClass(message.status)}`}>
                                        {message.status}
                                    </span>
                                    <span className="text-xs text-gray-400">{dhakaDateTime(message.created_at)}</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1 flex gap-2 flex-wrap">
                                    <a href={`tel:${message.phone}`} className="font-semibold text-pur">{message.phone}</a>
                                    {message.email && (
                                        <>
                                            <span>·</span>
                                            <a href={`mailto:${message.email}`} className="text-pur">{message.email}</a>
                                        </>
                                    )}
                                </div>
                                {message.subject && <div className="mt-2 font-semibold">{message.subject}</div>}
                                <p className="mt-1 text-sm whitespace-pre-line">{message.message}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap h-fit">
                                {message.status !== 'read' && (
                                    <button className="text-green-600 text-sm font-semibold" onClick={() => setMessageStatus(message, 'read')}>Mark read</button>
                                )}
                                {message.status !== 'new' && (
                                    <button className="text-amber-600 text-sm font-semibold" onClick={() => setMessageStatus(message, 'new')}>Mark unread</button>
                                )}
                                {message.status !== 'archived' && (
                                    <button className="text-gray-500 text-sm font-semibold" onClick={() => setMessageStatus(message, 'archived')}>Archive</button>
                                )}
                                <button className="text-red-500 text-sm font-semibold" onClick={() => remove(message)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {messages.data.length === 0 && (
                    <div className="bg-white rounded-2xl p-10 text-center text-gray-500">No messages found.</div>
                )}
            </div>

            <Pagination paginator={messages} />
        </>
    );
}

Messages.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Messages;
