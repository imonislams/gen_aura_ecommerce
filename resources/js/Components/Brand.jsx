import { Link } from '@inertiajs/react';

export default function Brand({ settings, big = false }) {
    return (
        <Link href="/" className="flex flex-col items-center leading-none">
            {settings.logo ? (
                <img
                    src={`/storage/${settings.logo}`}
                    alt={settings.name}
                    className={big ? 'h-24 object-contain' : 'h-10 object-contain'}
                />
            ) : (
                <img
                    src="/favicon.svg"
                    alt={settings.name}
                    className={big ? 'h-24 object-contain' : 'h-10 object-contain'}
                />
            )}
            <span className={`ar text-gold ${big ? 'text-4xl mt-2' : 'text-lg'}`}>{settings.ar}</span>
            <span className={`font-serif text-gold tracking-wide ${big ? 'text-4xl' : 'text-xl'}`}>{settings.name}</span>
        </Link>
    );
}
