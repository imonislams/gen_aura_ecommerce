export const socialNetworks = [
    { key: 'fb', label: 'Facebook', color: '#1877F2' },
    { key: 'instagram', label: 'Instagram', color: '#E1306C' },
    { key: 'tiktok', label: 'TikTok', color: '#010101' },
    { key: 'youtube', label: 'YouTube', color: '#FF0000' },
];

export function detectNetwork(raw) {
    const value = (raw || '').trim().toLowerCase();

    if (!value) {
        return null;
    }

    if (value.includes('facebook.com') || value.includes('fb.me') || value.includes('fb.com')) {
        return 'fb';
    }

    if (value.includes('instagram.com') || value.includes('instagr.am')) {
        return 'instagram';
    }

    if (value.includes('tiktok.com')) {
        return 'tiktok';
    }

    if (value.includes('youtube.com') || value.includes('youtu.be')) {
        return 'youtube';
    }

    return null;
}

function Glyph({ network }) {
    if (network === 'fb') {
        return (
            <path d="M15.12 5.32h2.17V2.14A28.9 28.9 0 0 0 14.13 2c-3.13 0-5.28 1.92-5.28 5.45v3.04H5.71v3.56h3.14v9.95h3.84v-9.95h3.15l.48-3.56h-3.63V7.72c0-1.03.28-1.73 1.43-1.73Z" />
        );
    }

    if (network === 'instagram') {
        return (
            <>
                <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
            </>
        );
    }

    if (network === 'tiktok') {
        return (
            <path d="M16.6 5.82a5.6 5.6 0 0 1-1.28-3.32h-3.1v13.06a2.94 2.94 0 1 1-2.1-2.82V9.57a6.1 6.1 0 1 0 5.2 6.04V8.9a8.6 8.6 0 0 0 4.1 1.05V6.6a5.3 5.3 0 0 1-2.82-.78Z" />
        );
    }

    return <path d="M21.6 7.2a2.8 2.8 0 0 0-1.98-1.98C17.87 4.75 12 4.75 12 4.75s-5.87 0-7.62.47A2.8 2.8 0 0 0 2.4 7.2 29.1 29.1 0 0 0 1.93 12a29.1 29.1 0 0 0 .47 4.8 2.8 2.8 0 0 0 1.98 1.98c1.75.47 7.62.47 7.62.47s5.87 0 7.62-.47a2.8 2.8 0 0 0 1.98-1.98 29.1 29.1 0 0 0 .47-4.8 29.1 29.1 0 0 0-.47-4.8ZM9.98 15.02V8.98L15.2 12Z" />;
}

export function SocialIcon({ network, className = 'w-5 h-5' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
            <Glyph network={network} />
        </svg>
    );
}

export function SocialLinks({ settings, className = '' }) {
    const links = socialNetworks
        .map((network) => ({ ...network, url: settings?.[network.key] }))
        .filter((network) => network.url);

    if (links.length === 0) {
        return null;
    }

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            {links.map((network) => (
                <a
                    key={network.key}
                    href={network.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={network.label}
                    title={network.label}
                    className="w-9 h-9 rounded-md grid place-items-center text-white transition hover:opacity-90"
                    style={{
                        background:
                            network.key === 'instagram'
                                ? 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)'
                                : network.color,
                    }}
                >
                    <SocialIcon network={network.key} className="w-[18px] h-[18px]" />
                </a>
            ))}
        </div>
    );
}
