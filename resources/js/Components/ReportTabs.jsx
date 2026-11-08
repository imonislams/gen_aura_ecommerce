import { router } from '@inertiajs/react';

export function rangeParams(range) {
    const params = { range: range?.preset ?? '7' };
    if (params.range === 'custom') {
        params.from = range?.from;
        params.to = range?.to;
    }
    return params;
}

export function queryString(range, extra = {}) {
    return new URLSearchParams({ ...extra, ...rangeParams(range) }).toString();
}

export default function ReportTabs({ groups, active = 'all', range, url = '/admin/reports' }) {
    const tabs = [{ group: 'all', label: 'All' }, ...groups.map((group) => ({ group: group.group, label: group.group }))];

    const go = (group) => {
        router.get(url, { group, ...rangeParams(range) }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <div className="flex flex-wrap gap-2 mb-5">
            {tabs.map((tab) => (
                <button
                    key={tab.group}
                    type="button"
                    onClick={() => go(tab.group)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        active === tab.group
                            ? 'grad text-white'
                            : 'bg-white border border-purple-100 text-gray-600 hover:bg-purple-50'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
