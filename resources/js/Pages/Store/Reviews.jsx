import { Head, useForm } from '@inertiajs/react';
import StoreLayout from '../../Layouts/StoreLayout';
import StarRating from '../../Components/StarRating';

function Reviews({ reviews, avg, count }) {
    const form = useForm({ name: '', text: '', stars: 5 });

    const submit = (event) => {
        event.preventDefault();
        form.post('/reviews', {
            preserveScroll: true,
            onSuccess: () => form.reset('text'),
        });
    };

    return (
        <>
            <Head title="Reviews" />

            <section className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="font-serif text-3xl">Customers are saying</h1>
                <p className="text-org font-semibold mb-4">{avg} ★ ({count})</p>

                <form onSubmit={submit} className="bg-white rounded-2xl p-5 mb-6">
                    <h2 className="font-semibold mb-2">Write a review</h2>
                    <div className="grid md:grid-cols-2 gap-3">
                        <input className="inp" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Your name" />
                        <div className="inp flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">Rating</span>
                            <StarRating value={form.data.stars} onChange={(stars) => form.setData('stars', stars)} />
                        </div>
                    </div>
                    <textarea className="inp mt-3" rows="3" value={form.data.text} onChange={(event) => form.setData('text', event.target.value)} placeholder="Your review" required />
                    {form.errors.text && <div className="text-xs text-red-600">{form.errors.text}</div>}
                    <button className="btn mt-3" disabled={form.processing}>Submit review</button>
                    <div className="text-xs text-gray-400 mt-2">Reviews appear after approval.</div>
                </form>

                <div className="grid md:grid-cols-2 gap-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-2xl p-5 shadow-sm">
                            <div className="text-org">{'★'.repeat(review.stars)}</div>
                            <p className="my-2">{review.text}</p>
                            <b className="text-sm text-gray-500">{review.name}</b>
                            {review.product && <div className="text-xs text-gray-400 mt-1">{review.product}</div>}
                        </div>
                    ))}
                    {reviews.length === 0 && <p className="text-gray-500">No approved reviews yet.</p>}
                </div>
            </section>
        </>
    );
}

Reviews.layout = (page) => <StoreLayout>{page}</StoreLayout>;

export default Reviews;
