import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SettingsTabs from '../../../Components/SettingsTabs';

function General({ section }) {
    const { settings } = usePage().props;

    const form = useForm({
        name: settings.name ?? '',
        ar: settings.ar ?? '',
        phone: settings.phone ?? '',
        email: settings.email ?? '',
        address: settings.address ?? '',
        wa: settings.wa ?? '',
        logo: null,
        favicon: null,
    });

    const submit = (event) => {
        event.preventDefault();
        form.post('/admin/settings/general', { forceFormData: true, preserveScroll: true });
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
            <Head title="Settings · General" />

            <div className="mb-5">
                <h1 className="font-serif text-3xl font-bold">General</h1>
                <p className="text-sm text-gray-500 mt-1">Store identity, contact details and branding</p>
            </div>

            <SettingsTabs section={section} />

            <form onSubmit={submit} className="space-y-4">
                <div className="bg-white rounded-2xl p-5">
                    <h2 className="font-semibold mb-3">Store details</h2>
                    <div className="grid md:grid-cols-2 gap-x-5">
                        {field('name', 'Store name')}
                        {field('ar', 'Arabic name')}
                        {field('phone', 'Phone')}
                        {field('email', 'Email')}
                        {field('address', 'Address')}
                        {field('wa', 'WhatsApp number (880…)')}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="block text-sm">
                            Logo
                            <input type="file" accept="image/*" className="inp" onChange={(event) => form.setData('logo', event.target.files[0])} />
                            {settings.logo && <img src={`/storage/${settings.logo}`} alt="Logo" className="h-12 mt-2 object-contain" />}
                        </label>
                        <label className="block text-sm">
                            Favicon
                            <input type="file" accept=".ico,image/*" className="inp" onChange={(event) => form.setData('favicon', event.target.files[0])} />
                            {settings.favicon ? <img src={`/storage/${settings.favicon}`} alt="Favicon" className="h-8 mt-2 object-contain" /> : <div className="text-xs text-gray-400 mt-1">Uses the Gen Aura brand mark when empty.</div>}
                        </label>
                    </div>
                </div>

                <button className="btn" disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Save general'}
                </button>
            </form>
        </>
    );
}

General.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default General;
