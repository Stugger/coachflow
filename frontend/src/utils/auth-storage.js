const AUTH_STORAGE_KEY = 'coachflow_auth';

export function getStoredAuth() {
    const serializedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!serializedAuth) {
        return null;
    }

    try {
        const auth = JSON.parse(serializedAuth);

        if (!auth?.token) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            return null;
        }

        return auth;
    } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

export function saveAuth(auth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAccessToken() {
    return getStoredAuth()?.token ?? null;
}