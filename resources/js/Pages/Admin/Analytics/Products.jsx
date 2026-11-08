import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DateRangeFilter from '../../../Components/DateRangeFilter';
import Pagination from '../../../Components/Pagination';

function Products({ products, range }) {
    return (
        <>
            <Head title="Product analytics" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Product analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Event counts vs unique visitors are shown separately · conversion = orders ÷ unique viewers (capped at 100%)</p>
                </div>
                <DateRangeFilter range={range} url="/admin/analytics/products" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-purple-50/40">
                                <th className="px-3 py-2">Product</th>
                                <th className="px-3 py-2 text-right">Views</th>
                                <th className="px-3 py-2 text-right">Unique viewers</th>
                                <th className="px-3 py-2 text-right">Add to cart</th>
                                <th className="px-3 py-2 text-right">Removals</th>
                                <th className="px-3 py-2 text-right">Checkout</th>
                                <th className="px-3 py-2 text-right">Orders</th>
                                <th className="px-3 py-2 text-right">Units</th>
                                <th className="px-3 py-2 text-right">Revenue</th>
                                <th className="px-3 py-2 text-right">Conversion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.map((product) => (
                                <tr key={product.id} className="border-t border-gray-100">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <img src={product.image_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                                            <div>
                                                <Link href={`/admin/analytics/products/${product.id}`} className="text-pur font-semibold">
                                                    {product.name}
                                                </Link>
                                                {product.high_views_low_purchase && (
                                                    <div className="text-[10px] font-bold text-red-500">high views, low purchases</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-right">{product.views}</td>
                                    <td className="px-3 py-2 text-right">{product.unique_viewers}</td>
                                    <td className="px-3 py-2 text-right">{product.add_to_cart}</td>
                                    <td className="px-3 py-2 text-right">{product.removals}</td>
                                    <td className="px-3 py-2 text-right">{product.checkout}</td>
                                    <td className="px-3 py-2 text-right">{product.orders}</td>
                                    <td className="px-3 py-2 text-right">{product.units}</td>
                                    <td className="px-3 py-2 text-right">৳{Number(product.revenue).toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right font-semibold">{product.conversion}%</td>
                                </tr>
                            ))}
                            {products.data.length === 0 && <tr><td colSpan="10" className="px-3 py-10 text-center text-gray-500">No products.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination paginator={products} />
        </>
    );
}

Products.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Products;
