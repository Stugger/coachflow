export function digitsOnly(value) {
    return value.replace(/\D/g, '');
}

export function splitPhone(phone) {
    const digits = digitsOnly(phone || '');
    return {
        area: digits.substring(0, 3),
        prefix: digits.substring(3, 6),
        line: digits.substring(6, 10)
    };
}

export function formatPhone(area, prefix, line) {
    if (!area && !prefix && !line) {
        return '';
    }
    return `(${area}) ${prefix}-${line}`;
}

export function isPartialPhone(area, prefix, line) {
    const totalLength = area.length + prefix.length + line.length;
    if (totalLength === 0) {
        return false;
    }
    return area.length !== 3 || prefix.length !== 3 || line.length !== 4;
}