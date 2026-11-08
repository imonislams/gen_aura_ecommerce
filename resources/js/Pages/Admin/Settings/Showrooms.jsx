import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SettingsTabs from '../../../Components/SettingsTabs';

const blank = {
    name: '',
    address: '',
    phone: '',
    is_active: true,
    sort: 0,
};

function Showrooms({ showrooms, section }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm(blank);

    const startCreate = () => {
        setEditing(null);
        clearErrors();
        reset();
        setData(blank);
    };

    const startEdit = (showroom) => {
        setEditing(showroom);
        clearErrors();
        setData({
            name: showroom.name,
            address: showroom.address,
            phone: showroom.phone ?? '',
            is_active: showroom.is_active,
            sort: showroom.sort,
        });
    };

    const submit = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setEditing(null);
            },
        };

        if (editing) {
            put(`/admin/settings/showrooms/${editing.id}`, options);
        } else {
            post('/admin/settings/showrooms', options);
        }
    };

    const remove = (showroom) => {
        if (window.confirm(`Delete showroom "${showroom.name}"?`)) {
            destroy(`/admin/settings/showrooms/${showroom.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Settings · Showrooms" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Showrooms</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Branch addresses shown on the storefront footer and contact page.
                    </p>
                </div>
                <button className="btn" onClick={startCreate}>
                    + Add showroom
                </button>
            </div>

            <SettingsTabs section={section} />

            <div className="grid md:grid-cols-[1.4fr_1fr] gap-5 items-start">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-purple-50/40">
                                    <th className="px-3 py-2">Showroom</th>
                                    <th className="px-3 py-2">Phone</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {showrooms.map((showroom) => (
                                    <tr key={showroom.id} className="border-t border-gray-100">
                                        <td className="px-3 py-2">
                                            <b className="block">{showroom.name}</b>
                                            <span className="text-xs text-gray-500">{showroom.address}</span>
                                        </td>
                                        <td className="px-3 py-2">{showroom.phone || '—'}</td>
                                        <td className="px-3 py-2">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    showroom.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}
                                            >
                                                {showroom.is_active ? 'active' : 'inactive'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right whitespace-nowrap">
                                            <button className="text-pur text-sm font-semibold mr-2" onClick={() => startEdit(showroom)}>
                                                Edit
                                            </button>
                                            <button className="text-red-500 text-sm font-semibold" onClick={() => remove(showroom)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {showrooms.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-3 py-10 text-center text-gray-500">
                                            No showrooms yet. Add one to show it in the footer.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-5">
                    <h2 className="font-semibold mb-3">{editing ? `Edit ${editing.name}` : 'Add showroom'}</h2>

                    <label className="block text-sm mb-3">
                        Showroom / branch name
                        <input
                            className="inp"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder="e.g. Sylhet Branch"
                            required
                        />
                        {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
                    </label>

                    <label className="block text-sm mb-3">
                        Address
                        <textarea
                            className="inp"
                            rows="3"
                            value={data.address}
                            onChange={(event) => setData('address', event.target.value)}
                            required
                        />
                        {errors.address && <span className="text-xs text-red-600">{errors.address}</span>}
                    </label>

                    <label className="block text-sm mb-3">
                        Phone (optional)
                        <input
                            className="inp"
                            value={data.phone}
                            onChange={(event) => setData('phone', event.target.value)}
                            placeholder="01XXXXXXXXX"
                        />
                        {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="block text-sm mb-3">
                            Status
                            <select
                                className="inp"
                                value={data.is_active ? '1' : '0'}
                                onChange={(event) => setData('is_active', event.target.value === '1')}
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </label>
                        <label className="block text-sm mb-3">
                            Sort order
                            <input
                                type="number"
                                min="0"
                                className="inp"
                                value={data.sort}
                                onChange={(event) => setData('sort', event.target.value)}
                            />
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button className="btn flex-1" disabled={processing}>
                            {editing ? 'Save changes' : 'Add showroom'}
                        </button>
                        {editing && (
                            <button type="button" className="btn bg-white border text-gray-600" onClick={startCreate}>
                                Cancel
                            </button>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3 text-xs mt-4">
                        Only active showrooms appear on the storefront.
                    </div>
                </form>
            </div>
        </>
    );
}

Showrooms.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Showrooms;
