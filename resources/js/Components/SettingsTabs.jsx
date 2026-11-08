import { Link } from '@inertiajs/react';

const tabs = [
    { key: 'general', label: 'General' },
    { key: 'store', label: 'Store' },
    { key: 'homepage', label: 'Homepage' },
    { key: 'about', label: 'About' },
    { key: 'social', label: 'Social' },
    { key: 'delivery-zones', label: 'Delivery Zones' },
    { key: 'showrooms', label: 'Showrooms' },
    { key: 'login', label: 'Admin Login' },
    { key: 'maintenance', label: 'Maintenance' },
];

export default function SettingsTabs({ section }) {
    return (
        <div className="flex flex-wrap gap-2 mb-5">
            {tabs.map((tab) => (
                <Link
                    key={tab.key}
                    href={`/admin/settings/${tab.key}`}
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        section === tab.key ? 'grad text-white' : 'bg-white border border-purple-100 text-gray-600 hover:bg-purple-50'
                    }`}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    );
}
