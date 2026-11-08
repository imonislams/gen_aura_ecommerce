import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SettingsTabs from '../../../Components/SettingsTabs';
import { SocialLinks, SocialIcon, detectNetwork, socialNetworks } from '../../../Components/SocialIcons';

const labels = Object.fromEntries(socialNetworks.map((network) => [network.key, network.label]));

function Social({ section }) {
    const { settings } = usePage().props;

    const [link, setLink] = useState('');
    const [processing, setProcessing] = useState(false);

    const current = {
        fb: settings.fb ?? '',
        instagram: settings.instagram ?? '',
        tiktok: settings.tiktok ?? '',
        youtube: settings.youtube ?? '',
    };

    const detected = detectNetwork(link);
    const looksLikeUrl = link.trim().length > 0;
    const invalid = looksLikeUrl && !detected;

    const normalize = (value) => {
        const trimmed = value.trim();
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    };

    const save = (key, value) => {
        router.post('/admin/settings/social', { ...current, [key]: value }, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onSuccess: () => setLink(''),
            onFinish: () => setProcessing(false),
        });
    };

    const addLink = (event) => {
        event.preventDefault();
        if (!detected) {
            return;
        }
        save(detected, normalize(link));
    };

    const removeLink = (key) => save(key, '');

    const saved = socialNetworks
        .map((network) => ({ ...network, url: current[network.key] }))
        .filter((network) => network.url);

    return (
        <>
            <Head title="Settings · Social" />

            <div className="mb-5">
                <h1 className="font-serif text-3xl font-bold">Social links</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Paste any profile link and it is saved to the right network automatically.
                </p>
            </div>

            <SettingsTabs section={section} />

            <form onSubmit={addLink} className="bg-white rounded-2xl p-5 mb-4">
                <h2 className="font-semibold mb-3">Add or update a link</h2>

                <label className="block text-sm mb-1">Paste a social link</label>
                <div className="flex flex-wrap gap-2 items-start">
                    <input
                        className="inp !mt-0 flex-1 min-w-[240px]"
                        value={link}
                        onChange={(event) => setLink(event.target.value)}
                        placeholder="https://instagram.com/yourpage"
                    />
                    <button className="btn" disabled={!detected || processing}>
                        {processing ? 'Saving…' : detected ? `Save to ${labels[detected]}` : 'Save'}
                    </button>
                </div>

                {detected && (
                    <div className="text-xs text-green-700 mt-2 flex items-center gap-1.5">
                        <SocialIcon network={detected} className="w-4 h-4" />
                        Detected: <b>{labels[detected]}</b>
                        {current[detected] && <span className="text-gray-400">— replaces the saved link</span>}
                    </div>
                )}

                {invalid && (
                    <div className="text-xs text-red-600 mt-2">
                        That link is not a Facebook, Instagram, TikTok or YouTube URL.
                    </div>
                )}

                <p className="text-xs text-gray-400 mt-3">
                    Supported: Facebook, Instagram, TikTok, YouTube. Links without https:// get it added automatically.
                </p>
            </form>

            <div className="bg-white rounded-2xl p-5">
                <h2 className="font-semibold mb-3">Saved links</h2>

                {saved.length === 0 && <p className="text-sm text-gray-500">No social links saved yet.</p>}

                <div className="space-y-2">
                    {saved.map((network) => (
                        <div
                            key={network.key}
                            className="flex items-center gap-3 border-t border-gray-100 py-2 first:border-t-0 first:pt-0"
                        >
                            <span
                                className="w-8 h-8 rounded-md grid place-items-center text-white shrink-0"
                                style={{
                                    background:
                                        network.key === 'instagram'
                                            ? 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)'
                                            : network.color,
                                }}
                            >
                                <SocialIcon network={network.key} className="w-4 h-4" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <b className="text-sm block">{network.label}</b>
                                <span className="text-xs text-gray-500 break-all">{network.url}</span>
                            </div>
                            <button
                                type="button"
                                className="text-red-500 text-sm font-semibold shrink-0"
                                onClick={() => removeLink(network.key)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Storefront preview</div>
                    <SocialLinks settings={current} />
                </div>
            </div>
        </>
    );
}

Social.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Social;
