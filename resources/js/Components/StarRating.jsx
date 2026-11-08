import { useState } from 'react';

export default function StarRating({ value = 5, onChange, size = 'text-2xl', readOnly = false }) {
    const [hover, setHover] = useState(0);
    const active = hover || value;

    return (
        <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label="Rating"
            onMouseLeave={() => setHover(0)}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={value === star}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    disabled={readOnly}
                    onClick={() => !readOnly && onChange?.(star)}
                    onMouseEnter={() => !readOnly && setHover(star)}
                    onFocus={() => !readOnly && setHover(star)}
                    onBlur={() => setHover(0)}
                    className={`${size} leading-none transition ${star <= active ? 'text-org' : 'text-gray-300'} ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}
