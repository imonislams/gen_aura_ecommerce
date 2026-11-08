import { Link } from '@inertiajs/react';

export default function Pagination({ paginator }) {
    if (!paginator?.links) {
        return null;
    }

    return (
        <div className="flex gap-1 flex-wrap justify-end mt-3">
            {paginator.links.map((link, index) =>
                link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll
                        className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${
                            link.active ? 'grad text-white border-transparent' : 'bg-white text-gray-600'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={index}
                        className="px-3 py-1.5 rounded-lg border text-sm text-gray-400"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            )}
        </div>
    );
}
