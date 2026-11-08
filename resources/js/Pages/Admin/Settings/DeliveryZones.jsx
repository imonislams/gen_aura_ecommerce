import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SettingsTabs from '../../../Components/SettingsTabs';

const blank = {
    name: '',
    charge: 0,
    is_active: true,
    sort: 0,
};

function DeliveryZones({ zones, section }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm(blank);

    const startCreate = () => {
        setEditing(null);
        clearErrors();
        reset();
        setData(blank);
    };

    const startEdit = (zone) => {
        setEditing(zone);
        clearErrors();
        setData({
            name: zone.name,
            charge: zone.charge,
            is_active: zone.is_active,
            sort: zone.sort,
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
            put(`/admin/settings/delivery-zones/${editing.id}`, options);
        } else {
            post('/admin/settings/delivery-zones', options);
        }
    };

    const remove = (zone) => {
        if (window.confirm(`Delete delivery zone "${zone.name}"?`)) {
            destroy(`/admin/settings/delivery-zones/${zone.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Settings · Delivery Zones" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Delivery Zones</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Areas customers can choose at checkout, each with its own delivery charge.
                    </p>
                </div>
                <button className="btn" onClick={startCreate}>
                    + Add zone
                </button>
            </div>

            <SettingsTabs section={section} />

            <div className="grid md:grid-cols-[1.4fr_1fr] gap-5 items-start">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-purple-50/40">
                                    <th className="px-3 py-2">Area</th>
                                    <th className="px-3 py-2">Charge</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {zones.map((zone) => (
                                    <tr key={zone.id} className="border-t border-gray-100">
                                        <td className="px-3 py-2">
                                            <b className="block">{zone.name}</b>
                                            <span className="text-xs text-gray-400">order {zone.sort}</span>
                                        </td>
                                        <td className="px-3 py-2">৳{Number(zone.charge).toLocaleString()}</td>
                                        <td className="px-3 py-2">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    zone.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}
                                            >
                                                {zone.is_active ? 'active' : 'inactive'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right whitespace-nowrap">
                                            <button className="text-pur text-sm font-semibold mr-2" onClick={() => startEdit(zone)}>
                                                Edit
                                            </button>
                                            <button className="text-red-500 text-sm font-semibold" onClick={() => remove(zone)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {zones.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-3 py-10 text-center text-gray-500">
                                            No delivery zones yet. Add one to show it at checkout.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-5">
                    <h2 className="font-semibold mb-3">{editing ? `Edit ${editing.name}` : 'Add delivery zone'}</h2>

                    <label className="block text-sm mb-3">
                        Area name
                        <input
                            className="inp"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder="e.g. Chattogram"
                            required
                        />
                        {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
                    </label>

                    <label className="block text-sm mb-3">
                        Delivery charge (৳)
                        <input
                            type="number"
                            min="0"
                            className="inp"
                            value={data.charge}
                            onChange={(event) => setData('charge', event.target.value)}
                            required
                        />
                        {errors.charge && <span className="text-xs text-red-600">{errors.charge}</span>}
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
                            {editing ? 'Save changes' : 'Add zone'}
                        </button>
                        {editing && (
                            <button type="button" className="btn bg-white border text-gray-600" onClick={startCreate}>
                                Cancel
                            </button>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3 text-xs mt-4">
                        Only active zones are shown to customers at checkout.
                    </div>
                </form>
            </div>
        </>
    );
}

DeliveryZones.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default DeliveryZones;
