const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

export function resolveMediaUrl(value) {
    if (!value) {
        return null;
    }

    if (value.startsWith('media/')) {
        return `${MEDIA_BASE_URL}/${value.slice('media/'.length)}`;
    }

    return value;
}