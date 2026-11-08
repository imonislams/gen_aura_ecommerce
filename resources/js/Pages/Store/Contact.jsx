import { Head, useForm, usePage } from '@inertiajs/react';
import StoreLayout from '../../Layouts/StoreLayout';
import { SocialLinks } from '../../Components/SocialIcons';

function Contact() {
    const { settings } = usePage().props;

    const form = useForm({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
        website: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post('/contact', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <>
            <Head title="Contact us" />

            <section className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-6 items-start">
                <div>
                    <h1 className="font-serif text-4xl gtext">Contact us</h1>
                    <p className="text-gray-600 my-3">Questions? Do not hesitate to reach us.</p>

                    <div className="bg-white rounded-2xl p-6 space-y-2 text-sm">
                        {settings.phone && <div><b>Phone:</b> {settings.phone}</div>}
                        {settings.email && <div><b>Email:</b> {settings.email}</div>}
                        {settings.address && <div><b>Address:</b> {settings.address}</div>}
                    </div>

                    <a className="btn mt-4" href={`https://wa.me/${settings.wa}`}>
                        Chat on WhatsApp: +{settings.wa}
                    </a>

                    <SocialLinks settings={settings} className="mt-4" />
                </div>

                <form onSubmit={submit} className="bg-white rounded-2xl p-5">
                    <h2 className="font-semibold mb-3">Send message</h2>

                    <input
                        type="text"
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.data.website}
                        onChange={(event) => form.setData('website', event.target.value)}
                        aria-hidden="true"
                    />

                    <label className="block text-sm mb-3">
                        Your name
                        <input className="inp" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                        {form.errors.name && <span className="text-xs text-red-600">{form.errors.name}</span>}
                    </label>
                    <label className="block text-sm mb-3">
                        Phone
                        <input className="inp" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} required />
                        {form.errors.phone && <span className="text-xs text-red-600">{form.errors.phone}</span>}
                    </label>
                    <label className="block text-sm mb-3">
                        Email (optional)
                        <input type="email" className="inp" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} />
                        {form.errors.email && <span className="text-xs text-red-600">{form.errors.email}</span>}
                    </label>
                    <label className="block text-sm mb-3">
                        Subject (optional)
                        <input className="inp" value={form.data.subject} onChange={(event) => form.setData('subject', event.target.value)} />
                    </label>
                    <label className="block text-sm mb-3">
                        Message
                        <textarea className="inp" rows="4" value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} required />
                        {form.errors.message && <span className="text-xs text-red-600">{form.errors.message}</span>}
                    </label>

                    <button className="btn w-full" disabled={form.processing}>
                        {form.processing ? 'Sending…' : 'Send message'}
                    </button>
                </form>
            </section>
        </>
    );
}

Contact.layout = (page) => <StoreLayout>{page}</StoreLayout>;

export default Contact;
