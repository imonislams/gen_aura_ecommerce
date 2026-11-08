import { Head, useForm, usePage } from '@inertiajs/react';

export default function Login() {
    const { settings } = usePage().props;
    const form = useForm({ username: '', password: '' });

    const submit = (event) => {
        event.preventDefault();
        form.post('/admin/login');
    };

    const error = form.errors.username || form.errors.default || Object.values(form.errors)[0];

    return (
        <>
            <Head title="Admin login" />

            <div className="min-h-screen grid place-items-center bg-[#F8F6F3] px-4">
                <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="w-9 h-9 rounded-lg grad flex items-center justify-center text-white font-serif font-bold">A</span>
                        <span className="font-serif text-xl font-semibold gtext">{settings?.name ?? 'GEN AURA'}</span>
                    </div>

                    <h1 className="font-serif text-3xl mb-3">Admin</h1>

                    <input
                        className="inp"
                        name="username"
                        value={form.data.username}
                        onChange={(event) => form.setData('username', event.target.value)}
                        placeholder="Username"
                        autoFocus
                        required
                    />
                    <input
                        className="inp mt-3"
                        type="password"
                        name="password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        placeholder="Password"
                        required
                    />

                    {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

                    <button className="btn w-full mt-3" disabled={form.processing}>
                        {form.processing ? 'Logging in…' : 'Log in'}
                    </button>
                </form>
            </div>
        </>
    );
}
