export default function Flash({ ok, errors }) {
    const list = errors ? Object.values(errors) : [];

    return (
        <>
            {ok && (
                <div className="max-w-6xl mx-auto px-4 mt-4">
                    <div className="bg-green-50 text-green-800 rounded-xl p-3 text-sm">{ok}</div>
                </div>
            )}
            {list.length > 0 && (
                <div className="max-w-6xl mx-auto px-4 mt-4">
                    <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">
                        {list.map((error, index) => (
                            <div key={index}>{error}</div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
