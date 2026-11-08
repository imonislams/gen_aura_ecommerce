import { Link, usePage } from '@inertiajs/react';
import Brand from '../Components/Brand';
import Flash from '../Components/Flash';
import { SocialLinks } from '../Components/SocialIcons';

export default function StoreLayout({ children }) {
    const { settings, showrooms, cartCount, flash, errors } = usePage().props;

    return (
        <div className="min-h-screen flex flex-col">
            <div className="grad text-white text-center text-sm py-1.5 font-semibold">
                {settings.top}
            </div>

            <header className="bg-white/90 backdrop-blur border-b sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-x-3">
                    <nav className="flex gap-4 md:gap-5 text-sm font-semibold order-last w-full justify-center pb-1 md:order-none md:w-auto md:pb-0">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/about">About</Link>
                        <Link href="/reviews">Reviews</Link>
                        <Link href="/contact">Contact</Link>
                    </nav>

                    <Brand settings={settings} />

                    <div className="flex items-center gap-3 text-sm font-semibold">
                        <Link href="/cart">
                            Cart
                            {cartCount > 0 && (
                                <span className="ml-1 grad text-white rounded-full px-2 py-0.5 text-xs">{cartCount}</span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <Flash ok={flash?.ok} errors={errors} />
                {children}
            </main>

            <footer className="bg-white border-t mt-10 py-10 px-4 text-sm">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center">
                        <Brand settings={settings} />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mt-8 text-gray-600 text-left">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                            <div className="space-y-1">
                                {settings.phone && (
                                    <div>
                                        <b>Phone:</b>{' '}
                                        <a href={`tel:${settings.phone}`} className="hover:text-pur">
                                            {settings.phone}
                                        </a>
                                    </div>
                                )}
                                {settings.email && (
                                    <div>
                                        <b>Email:</b>{' '}
                                        <a href={`mailto:${settings.email}`} className="hover:text-pur">
                                            {settings.email}
                                        </a>
                                    </div>
                                )}
                                {settings.wa && (
                                    <div>
                                        <b>WhatsApp:</b>{' '}
                                        <a href={`https://wa.me/${settings.wa}`} className="hover:text-pur">
                                            +{settings.wa}
                                        </a>
                                    </div>
                                )}
                            </div>
                            <SocialLinks settings={settings} className="mt-3" />
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Main showroom</h3>
                            {settings.address ? (
                                <div className="whitespace-pre-line">{settings.address}</div>
                            ) : (
                                <div className="text-gray-400">—</div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Branches</h3>
                            {showrooms?.length ? (
                                <div className="space-y-3">
                                    {showrooms.map((showroom) => (
                                        <div key={showroom.id}>
                                            <div className="font-semibold text-gray-800">{showroom.name}</div>
                                            <div className="whitespace-pre-line">{showroom.address}</div>
                                            {showroom.phone && (
                                                <a href={`tel:${showroom.phone}`} className="hover:text-pur">
                                                    {showroom.phone}
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-400">—</div>
                            )}
                        </div>
                    </div>

                    <details className="max-w-md mx-auto mt-8 text-center text-gray-600">
                        <summary className="cursor-pointer font-semibold">Return &amp; Refund Policy</summary>
                        <p className="mt-2">
                            If you receive a damaged or wrong item, contact us within 3 days of delivery for a replacement or refund.
                        </p>
                    </details>

                    <p className="mt-6 text-center text-gray-400">© {new Date().getFullYear()} {settings.name}</p>
                </div>
            </footer>
        </div>
    );
}
