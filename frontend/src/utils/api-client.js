import {getAccessToken} from './auth-storage.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_UNAUTHORIZED_EVENT = 'coachflow:unauthorized';

export async function apiFetch(path, options = {}) {
    const headers = new Headers(options.headers);
    const accessToken = getAccessToken();

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        window.dispatchEvent(new Event(API_UNAUTHORIZED_EVENT));
    }

    return response;
}