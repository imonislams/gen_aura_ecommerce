import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SettingsTabs from '../../../Components/SettingsTabs';

function Store({ section }) {
    const { settings } = usePage().props;

    const form = useForm({
        currency: settings.currency ?? 'BDT',
        order_prefix: settings.order_prefix ?? 'GA',
        cats: settings.cats ?? '',
        cod_enabled: settings.cod_enabled ?? '1',
        stock_display: settings.stock_display ?? '1',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post('/admin/settings/store', { preserveScroll: true });
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
            <Head title="Settings · Store" />

            <div className="mb-5">
                <h1 className="font-serif text-3xl font-bold">Store</h1>
                <p className="text-sm text-gray-500 mt-1">Currency, order and display options</p>
            </div>

            <SettingsTabs section={section} />

            <form onSubmit={submit} className="space-y-4">
                <div className="bg-white rounded-2xl p-5">
                    <h2 className="font-semibold mb-3">Store settings</h2>
                    <div className="grid md:grid-cols-2 gap-x-5">
                        {field('currency', 'Currency')}
                        {field('order_prefix', 'Order number prefix')}
                        {field('cats', 'Legacy category list (manage in Categories)')}
                        <label className="block text-sm mb-3">
                            COD
                            <select className="inp" value={form.data.cod_enabled} onChange={(event) => form.setData('cod_enabled', event.target.value)}>
                                <option value="1">Enabled</option>
                                <option value="0">Disabled</option>
                            </select>
                        </label>
                        <label className="block text-sm mb-3">
                            Stock display
                            <select className="inp" value={form.data.stock_display} onChange={(event) => form.setData('stock_display', event.target.value)}>
                                <option value="1">Show low stock</option>
                                <option value="0">Hide</option>
                            </select>
                        </label>
                    </div>
                </div>

                <button className="btn" disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Save store'}
                </button>
            </form>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3 text-xs mt-4">
                Delivery charges are managed per area in Settings → Delivery Zones.
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs mt-4">
                Categories now live in their own module. The legacy category string is kept only for backward compatibility.
            </div>
        </>
    );
}

Store.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Store;
