import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SettingsTabs from '../../../Components/SettingsTabs';

const badges = {
    linked: { label: 'Linked', className: 'bg-green-50 text-green-700' },
    broken: { label: 'Broken link', className: 'bg-amber-50 text-amber-800' },
    conflict: { label: 'Wrong target', className: 'bg-red-50 text-red-700' },
    missing: { label: 'Not linked', className: 'bg-gray-100 text-gray-500' },
    unsupported: { label: 'Not supported by host', className: 'bg-amber-50 text-amber-800' },
};

const blockingStates = ['unsupported'];

function Maintenance({ storage, section }) {
    const { errors } = usePage().props;
    const [processing, setProcessing] = useState(false);

    const badge = badges[storage.state] ?? badges.missing;
    const blocked = blockingStates.includes(storage.state);

    const connectStorage = () => {
        router.post('/admin/settings/maintenance/storage-link', {}, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title="Settings · Maintenance" />

            <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Maintenance</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Server-side tasks that normally need terminal access, run from the admin panel instead.
                    </p>
                </div>
            </div>

            <SettingsTabs section={section} />

            <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                    <div>
                        <h2 className="font-semibold">Storage link</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Equivalent to <code className="text-xs">php artisan storage:link</code>.
                        </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.className}`}>{badge.label}</span>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3 border-t border-gray-100 py-2">
                        <span className="text-gray-500 shrink-0">Source</span>
                        <span className="font-mono text-xs text-right break-all">{storage.source}</span>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-gray-100 py-2">
                        <span className="text-gray-500 shrink-0">Destination</span>
                        <span className="font-mono text-xs text-right break-all">{storage.destination}</span>
                    </div>
                    {storage.link_target && (
                        <div className="flex justify-between gap-3 border-t border-gray-100 py-2">
                            <span className="text-gray-500 shrink-0">Points to</span>
                            <span className="font-mono text-xs text-right break-all">{storage.link_target}</span>
                        </div>
                    )}
                    <div className="flex justify-between gap-3 border-t border-gray-100 py-2">
                        <span className="text-gray-500 shrink-0">Source folder</span>
                        <span className="text-xs font-semibold">{storage.source_exists ? 'Present' : 'Missing'}</span>
                    </div>
                </div>

                <div
                    className={`rounded-xl p-3 text-xs mt-4 border ${
                        storage.state === 'conflict' || storage.state === 'unsupported'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                >
                    {storage.message}
                </div>

                <div className="flex gap-2 mt-4">
                    {storage.state === 'linked' ? (
                        <span className="badge badge-dark">Connected</span>
                    ) : (
                        <button type="button" className="btn" onClick={connectStorage} disabled={blocked || processing}>
                            {processing ? 'Connecting…' : 'Connect storage'}
                        </button>
                    )}
                </div>

                <p className="text-xs text-gray-400 mt-3">
                    Connects <code>storage/app/public</code> to <code>/storage</code> so uploaded images are served. Existing files
                    are never deleted or overwritten.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 mt-5">
                <h2 className="font-semibold mb-2">What this does</h2>
                <p className="text-sm text-gray-600">
                    Laravel stores uploaded images in <code className="text-xs">storage/app/public</code>, which is outside the public
                    web root. A symlink at <code className="text-xs">public/storage</code> exposes that folder at{' '}
                    <code className="text-xs">/storage</code>. Shared cPanel hosting often blocks terminal access, so this page performs
                    the same step from the browser.
                </p>
                {storage.state === 'unsupported' && (
                    <p className="text-sm text-gray-600 mt-2">
                        Because symlinks are blocked here, upload your images directly into{' '}
                        <code className="text-xs">public/storage</code> or ask your hosting provider to run the command for you.
                    </p>
                )}
                {storage.state === 'conflict' && (
                    <p className="text-sm text-gray-600 mt-2">
                        The folder where the link should be already exists but points somewhere else. Nothing was changed — move
                        its contents somewhere safe and remove it, then reload this page and press Connect storage.
                    </p>
                )}
            </div>

            {errors && Object.keys(errors).length > 0 && (
                <div className="text-xs text-gray-400 mt-3">
                    If an error is shown above, nothing was changed on disk.
                </div>
            )}
        </>
    );
}

Maintenance.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Maintenance;
