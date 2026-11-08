import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SettingsTabs from '../../../Components/SettingsTabs';

function About({ section }) {
    const { settings } = usePage().props;

    const form = useForm({
        about_title: settings.about_title ?? '',
        about_body: settings.about_body ?? '',
        about_image: null,
    });

    const submit = (event) => {
        event.preventDefault();
        form.post('/admin/settings/about', { forceFormData: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Settings · About" />

            <div className="mb-5">
                <h1 className="font-serif text-3xl font-bold">About page</h1>
                <p className="text-sm text-gray-500 mt-1">About section content and image</p>
            </div>

            <SettingsTabs section={section} />

            <form onSubmit={submit} className="space-y-4">
                <div className="bg-white rounded-2xl p-5">
                    <h2 className="font-semibold mb-3">About content</h2>
                    <label className="block text-sm mb-3">
                        About title
                        <input className="inp" value={form.data.about_title} onChange={(event) => form.setData('about_title', event.target.value)} />
                        {form.errors.about_title && <span className="text-xs text-red-600">{form.errors.about_title}</span>}
                    </label>
                    <label className="block text-sm mb-3">
                        About body
                        <textarea className="inp" rows="4" value={form.data.about_body} onChange={(event) => form.setData('about_body', event.target.value)} />
                        {form.errors.about_body && <span className="text-xs text-red-600">{form.errors.about_body}</span>}
                    </label>
                    <label className="block text-sm">
                        About image
                        <input type="file" accept="image/*" className="inp" onChange={(event) => form.setData('about_image', event.target.files[0])} />
                        {settings.about_image && <img src={`/storage/${settings.about_image}`} alt="About" className="h-20 mt-2 rounded-lg object-cover" />}
                    </label>
                </div>

                <button className="btn" disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Save about page'}
                </button>
            </form>
        </>
    );
}

About.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default About;
