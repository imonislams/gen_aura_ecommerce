import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

function ProductForm({ product, categories }) {
    const editing = !!product;

    const form = useForm({
        name: product?.name ?? '',
        slug: product?.slug ?? '',
        sku: product?.sku ?? '',
        category_id: product?.category_id ?? '',
        cat: product?.cat ?? '',
        sub: product?.sub ?? '',
        sizes: product?.sizes ?? '',
        feat: product?.feat ?? '',
        description: product?.description ?? '',
        price: product?.price ?? '',
        old_price: product?.old_price ?? 0,
        stock: product?.stock ?? 10,
        status: product?.status ?? 'active',
        featured: product?.featured ? 1 : 0,
        image: null,
        images: [],
        remove_images: [],
        _method: editing ? 'put' : undefined,
    });

    const toggleRemove = (path) => {
        const current = form.data.remove_images;
        form.setData('remove_images', current.includes(path) ? current.filter((item) => item !== path) : [...current, path]);
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(editing ? `/admin/products/${product.id}` : '/admin/products', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={editing ? `Edit ${product.name}` : 'Add product'} />

            <div className="mb-5">
                <Link href="/admin/products" className="text-sm text-pur font-semibold">← Products</Link>
                <h1 className="font-serif text-3xl font-bold mt-1">{editing ? `Edit ${product.name}` : 'Add product'}</h1>
            </div>

            <form onSubmit={submit} className="bg-white rounded-2xl p-5 grid md:grid-cols-2 gap-x-5">
                <label className="block text-sm mb-3">
                    Name
                    <input className="inp" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                    {form.errors.name && <span className="text-xs text-red-600">{form.errors.name}</span>}
                </label>
                <label className="block text-sm mb-3">
                    Slug (optional)
                    <input className="inp" value={form.data.slug} onChange={(event) => form.setData('slug', event.target.value)} placeholder="auto from name" />
                </label>
                <label className="block text-sm mb-3">
                    SKU (optional)
                    <input className="inp" value={form.data.sku} onChange={(event) => form.setData('sku', event.target.value)} placeholder="e.g. GA-TS-001" />
                </label>
                <label className="block text-sm mb-3">
                    Category
                    <select className="inp" value={form.data.category_id ?? ''} onChange={(event) => form.setData('category_id', event.target.value)}>
                        <option value="">Uncategorised</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                </label>
                <label className="block text-sm mb-3">
                    Price (৳)
                    <input type="number" min="0" className="inp" value={form.data.price} onChange={(event) => form.setData('price', event.target.value)} required />
                </label>
                <label className="block text-sm mb-3">
                    Old price (৳)
                    <input type="number" min="0" className="inp" value={form.data.old_price} onChange={(event) => form.setData('old_price', event.target.value)} />
                </label>
                <label className="block text-sm mb-3">
                    Stock
                    <input type="number" min="0" className="inp" value={form.data.stock} onChange={(event) => form.setData('stock', event.target.value)} required />
                </label>
                <label className="block text-sm mb-3">
                    Status
                    <select className="inp" value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </label>
                <label className="block text-sm mb-3">
                    Sizes (comma separated)
                    <input className="inp" value={form.data.sizes} onChange={(event) => form.setData('sizes', event.target.value)} placeholder="M,L,XL" />
                </label>
                <label className="block text-sm mb-3">
                    Subtitle
                    <input className="inp" value={form.data.sub} onChange={(event) => form.setData('sub', event.target.value)} />
                </label>
                <label className="block text-sm mb-3 md:col-span-2">
                    Highlights (comma separated)
                    <input className="inp" value={form.data.feat} onChange={(event) => form.setData('feat', event.target.value)} />
                </label>
                <label className="block text-sm mb-3 md:col-span-2">
                    Description
                    <textarea className="inp" rows="3" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
                </label>
                <label className="text-sm flex items-center gap-2 mb-3 md:col-span-2">
                    <input type="checkbox" checked={!!form.data.featured} onChange={(event) => form.setData('featured', event.target.checked ? 1 : 0)} />
                    Featured product
                </label>

                <label className="block text-sm mb-3">
                    Main image
                    <input type="file" accept="image/*" className="mt-1 text-sm" onChange={(event) => form.setData('image', event.target.files[0])} />
                </label>
                <label className="block text-sm mb-3">
                    More images (select many)
                    <input type="file" accept="image/*" multiple className="mt-1 text-sm" onChange={(event) => form.setData('images', Array.from(event.target.files))} />
                </label>

                {editing && (
                    <div className="md:col-span-2 flex gap-3 flex-wrap mb-3">
                        <div className="text-center">
                            <img src={product.image_url} alt="" className="w-16 h-16 rounded object-cover ring-2 ring-purple-300" />
                            <div className="text-xs mt-1">Main</div>
                        </div>
                        {product.images.map((path) => (
                            <label key={path} className="text-xs text-center">
                                <img src={`/storage/${path}`} alt="" className="w-16 h-16 rounded object-cover" />
                                <div>
                                    <input type="checkbox" checked={form.data.remove_images.includes(path)} onChange={() => toggleRemove(path)} /> remove
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                <div className="flex gap-2 md:col-span-2">
                    <button className="btn" disabled={form.processing}>{form.processing ? 'Saving…' : 'Save'}</button>
                    <Link href="/admin/products" className="px-4 py-2 border rounded-full">Cancel</Link>
                </div>
            </form>
        </>
    );
}

ProductForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default ProductForm;
