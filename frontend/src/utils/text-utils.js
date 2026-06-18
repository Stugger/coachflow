export function normalizeName(value) {
    if (!value) {
        return '';
    }
    return value
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function normalizeEmail(value) {
    return value ? value.trim().toLowerCase() : '';
}

export function trimToNull(value) {
    const trimmed = value?.trim?.();
    return trimmed ? trimmed : null;
}
