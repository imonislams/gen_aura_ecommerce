import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SettingsTabs from '../../../Components/SettingsTabs';

function Login({ section, adminUsername }) {
    const { auth } = usePage().props;

    const form = useForm({
        username: adminUsername ?? '',
        current: '',
        new_password: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post('/admin/password', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Settings · Admin Login" />

            <div className="mb-5">
                <h1 className="font-serif text-3xl font-bold">Admin login</h1>
                <p className="text-sm text-gray-500 mt-1">Change the admin username or password</p>
            </div>

            <SettingsTabs section={section} />

            <form onSubmit={submit} className="bg-white rounded-2xl p-5 grid md:grid-cols-3 gap-x-5">
                <h2 className="font-semibold md:col-span-3 mb-2">Change admin login</h2>
                {auth?.admin?.must_change_password && (
                    <div className="md:col-span-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm mb-3">
                        You are using the default password. Change it below before using the rest of the admin panel.
                    </div>
                )}
                <label className="block text-sm mb-3">
                    Username
                    <input className="inp" value={form.data.username} onChange={(event) => form.setData('username', event.target.value)} required />
                    {form.errors.username && <span className="text-xs text-red-600">{form.errors.username}</span>}
                </label>
                <label className="block text-sm mb-3">
                    Current password
                    <input type="password" className="inp" value={form.data.current} onChange={(event) => form.setData('current', event.target.value)} required />
                    {form.errors.current && <span className="text-xs text-red-600">{form.errors.current}</span>}
                </label>
                <label className="block text-sm mb-3">
                    New password (min 6)
                    <input type="password" className="inp" value={form.data.new_password} onChange={(event) => form.setData('new_password', event.target.value)} required />
                    {form.errors.new_password && <span className="text-xs text-red-600">{form.errors.new_password}</span>}
                </label>
                <div className="md:col-span-3">
                    <button className="btn" disabled={form.processing}>{form.processing ? 'Updating…' : 'Update login'}</button>
                </div>
            </form>
        </>
    );
}

Login.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Login;
