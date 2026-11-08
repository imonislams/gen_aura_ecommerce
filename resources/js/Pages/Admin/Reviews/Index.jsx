import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Pagination';
import { dhakaDate } from '../../../lib/datetime';

function Reviews({ reviews, filters, statuses }) {
    const [q, setQ] = useState(filters?.q ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');

    const apply = (overrides = {}) => {
        router.get('/admin/reviews', { q, status, ...overrides }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const setReviewStatus = (review, nextStatus) => {
        router.patch(`/admin/reviews/${review.id}/status`, { status: nextStatus }, { preserveScroll: true });
    };

    const remove = (review) => {
        if (window.confirm('Delete this review?')) {
            router.delete(`/admin/reviews/${review.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Reviews" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Reviews</h1>
                    <p className="text-sm text-gray-500 mt-1">Only approved reviews appear on the storefront</p>
                </div>
                <div className="flex gap-2">
                    <input
                        className="border rounded-full px-4 py-2 text-sm"
                        value={q}
                        onChange={(event) => setQ(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && apply()}
                        placeholder="Search name or text"
                    />
                    <select className="border rounded-full px-3 py-2 text-sm" value={status} onChange={(event) => { setStatus(event.target.value); apply({ status: event.target.value }); }}>
                        <option value="">All statuses</option>
                        {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                    <button className="btn btn-sm" onClick={() => apply()}>Filter</button>
                </div>
            </div>

            <div className="space-y-3">
                {reviews.data.map((review) => (
                    <div key={review.id} className="bg-white rounded-2xl p-4">
                        <div className="flex justify-between gap-3 flex-wrap">
                            <div className="min-w-0">
                                <div className="text-org">{'★'.repeat(review.stars)}</div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <b>{review.name}</b>
                                    {review.product && <span className="text-sm text-gray-500">· {review.product}</span>}
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${review.status === 'approved' ? 'bg-green-50 text-green-700' : review.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                                        {review.status}
                                    </span>
                                    <span className="text-xs text-gray-400">{dhakaDate(review.created_at)}</span>
                                </div>
                                <p className="mt-1 text-sm">{review.text}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {review.status !== 'approved' && <button className="text-green-600 text-sm font-semibold" onClick={() => setReviewStatus(review, 'approved')}>Approve</button>}
                                {review.status !== 'rejected' && <button className="text-amber-600 text-sm font-semibold" onClick={() => setReviewStatus(review, 'rejected')}>Reject</button>}
                                <button className="text-red-500 text-sm font-semibold" onClick={() => remove(review)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {reviews.data.length === 0 && <div className="bg-white rounded-2xl p-10 text-center text-gray-500">No reviews found.</div>}
            </div>

            <Pagination paginator={reviews} />
        </>
    );
}

Reviews.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Reviews;
