import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';

const blank = {
    name: '',
    slug: '',
    description: '',
    status: 'active',
    sort_order: 0,
    image: null,
    remove_image: false,
};

function Categories({ categories }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm(blank);

    const startCreate = () => {
        setEditing(null);
        clearErrors();
        reset();
        setData(blank);
    };

    const startEdit = (category) => {
        setEditing(category);
        clearErrors();
        setData({
            name: category.name,
            slug: category.slug,
            description: category.description ?? '',
            status: category.status,
            sort_order: category.sort_order,
            image: null,
            remove_image: false,
        });
    };

    const submit = (event) => {
        event.preventDefault();
        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setEditing(null);
            },
        };

        if (editing) {
            put(`/admin/categories/${editing.id}`, options);
        } else {
            post('/admin/categories', options);
        }
    };

    const remove = (category) => {
        if (window.confirm(`Delete "${category.name}"? Its products will be kept and left uncategorised.`)) {
            destroy(`/admin/categories/${category.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Categories" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Deleting a category never deletes its products.
                    </p>
                </div>
                <button className="btn" onClick={startCreate}>
                    + Add category
                </button>
            </div>

            {errors.name && (
                <div className="bg-red-50 text-red-700 rounded-xl p-3 mb-4 text-sm">{errors.name}</div>
            )}

            <div className="grid md:grid-cols-[1.4fr_1fr] gap-5 items-start">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-purple-50/40">
                                    <th className="px-3 py-2">Category</th>
                                    <th className="px-3 py-2">Slug</th>
                                    <th className="px-3 py-2">Products</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id} className="border-t border-gray-100">
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={category.image_url}
                                                    alt=""
                                                    className="w-9 h-9 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <b className="block">{category.name}</b>
                                                    <span className="text-xs text-gray-400">
                                                        order {category.sort_order}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-gray-500">{category.slug}</td>
                                        <td className="px-3 py-2">{category.products_count}</td>
                                        <td className="px-3 py-2">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    category.status === 'active'
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}
                                            >
                                                {category.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right whitespace-nowrap">
                                            <button
                                                className="text-pur text-sm font-semibold mr-2"
                                                onClick={() => startEdit(category)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="text-red-500 text-sm font-semibold"
                                                onClick={() => remove(category)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-3 py-10 text-center text-gray-500">
                                            No categories yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-5">
                    <h2 className="font-semibold mb-3">{editing ? `Edit ${editing.name}` : 'Add category'}</h2>

                    <label className="block text-sm mb-3">
                        Name
                        <input
                            className="inp"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                        />
                        {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
                    </label>

                    <label className="block text-sm mb-3">
                        Slug (optional)
                        <input
                            className="inp"
                            value={data.slug}
                            onChange={(event) => setData('slug', event.target.value)}
                            placeholder="auto from name"
                        />
                        {errors.slug && <span className="text-xs text-red-600">{errors.slug}</span>}
                    </label>

                    <label className="block text-sm mb-3">
                        Description
                        <textarea
                            className="inp"
                            rows="3"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                        />
                    </label>

                    <label className="block text-sm mb-3">
                        Image
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="mt-1 text-sm"
                            onChange={(event) => setData('image', event.target.files[0])}
                        />
                    </label>

                    {editing?.image && (
                        <label className="flex items-center gap-2 text-sm mb-3">
                            <input
                                type="checkbox"
                                checked={data.remove_image}
                                onChange={(event) => setData('remove_image', event.target.checked)}
                            />
                            Remove current image
                        </label>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <label className="block text-sm mb-3">
                            Status
                            <select
                                className="inp"
                                value={data.status}
                                onChange={(event) => setData('status', event.target.value)}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </label>
                        <label className="block text-sm mb-3">
                            Sort order
                            <input
                                type="number"
                                min="0"
                                className="inp"
                                value={data.sort_order}
                                onChange={(event) => setData('sort_order', event.target.value)}
                            />
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button className="btn flex-1" disabled={processing}>
                            {editing ? 'Save changes' : 'Create category'}
                        </button>
                        {editing && (
                            <button type="button" className="btn bg-white border text-gray-600" onClick={startCreate}>
                                Cancel
                            </button>
                        )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs mt-4">
                        Safe delete: products are set to “uncategorised”; they are never deleted with the category.
                    </div>
                </form>
            </div>
        </>
    );
}

Categories.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Categories;
