import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SettingsTabs from '../../../Components/SettingsTabs';

function Homepage({ section }) {
    const { settings } = usePage().props;

    const form = useForm({
        top: settings.top ?? '',
        title: settings.title ?? '',
        sub: settings.sub ?? '',
        promo_title: settings.promo_title ?? '',
        promo_text: settings.promo_text ?? '',
        why_choose_us: settings.why_choose_us ?? '',
        hero_image: null,
    });

    const submit = (event) => {
        event.preventDefault();
        form.post('/admin/settings/homepage', { forceFormData: true, preserveScroll: true });
    };

    const field = (key, label) => (
        <label key={key} className="block text-sm mb-3">
            {label}
            <input className="inp" value={form.data[key]} onChange={(event) => form.setData(key, event.target.value)} />
            {form.errors[key] && <span className="text-xs text-red-600">{form.errors[key]}</span>}
        </label>
    );

    return (
        <>
            <Head title="Settings · Homepage" />

            <div className="mb-5">
                <h1 className="font-serif text-3xl font-bold">Homepage</h1>
                <p className="text-sm text-gray-500 mt-1">Hero, announcement and promo content</p>
            </div>

            <SettingsTabs section={section} />

            <form onSubmit={submit} className="space-y-4">
                <div className="bg-white rounded-2xl p-5">
                    <h2 className="font-semibold mb-3">Homepage content</h2>
                    <div className="grid md:grid-cols-2 gap-x-5">
                        {field('top', 'Announcement text')}
                        {field('title', 'Hero title')}
                        {field('sub', 'Hero subtitle')}
                        {field('promo_title', 'Promo title')}
                        {field('promo_text', 'Promo text')}
                        {field('why_choose_us', 'Why choose us (separate with |)')}
                    </div>
                    <label className="block text-sm">
                        Hero image
                        <input type="file" accept="image/*" className="inp" onChange={(event) => form.setData('hero_image', event.target.files[0])} />
                        {settings.hero_image && <img src={`/storage/${settings.hero_image}`} alt="Hero" className="h-20 mt-2 rounded-lg object-cover" />}
                    </label>
                </div>

                <button className="btn" disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Save homepage'}
                </button>
            </form>
        </>
    );
}

Homepage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Homepage;
