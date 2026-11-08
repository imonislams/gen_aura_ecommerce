import { router } from '@inertiajs/react';
import { useState } from 'react';

const presets = [
    ['today', 'Today'],
    ['yesterday', 'Yesterday'],
    ['7', 'Last 7 days'],
    ['30', 'Last 30 days'],
    ['90', 'Last 90 days'],
    ['custom', 'Custom'],
];

export default function DateRangeFilter({ range, url, extra = {} }) {
    const [preset, setPreset] = useState(range?.preset ?? '7');
    const [from, setFrom] = useState(range?.from ?? '');
    const [to, setTo] = useState(range?.to ?? '');

    const apply = (next = preset) => {
        const params = { ...extra, range: next };
        if (next === 'custom') {
            params.from = from;
            params.to = to;
        }
        router.get(url, params, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <div className="flex gap-2 flex-wrap items-center">
            <select
                className="border rounded-full px-3 py-1.5 text-xs font-semibold bg-white"
                value={preset}
                onChange={(event) => {
                    setPreset(event.target.value);
                    apply(event.target.value);
                }}
            >
                {presets.map(([value, label]) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>

            {preset === 'custom' && (
                <>
                    <input
                        type="date"
                        className="border rounded px-2 py-1 text-xs"
                        value={from}
                        onChange={(event) => setFrom(event.target.value)}
                    />
                    <input
                        type="date"
                        className="border rounded px-2 py-1 text-xs"
                        value={to}
                        onChange={(event) => setTo(event.target.value)}
                    />
                    <button className="pill active" onClick={() => apply('custom')}>
                        Apply
                    </button>
                </>
            )}

            <span className="text-xs text-gray-400">{range?.label}</span>
        </div>
    );
}
