const TZ = 'Asia/Dhaka';

export function dhakaDateTime(value) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString('en-GB', {
        timeZone: TZ,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function dhakaDate(value) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString('en-GB', {
        timeZone: TZ,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}
