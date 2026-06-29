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

export async function getJson(path) {
    return requestJson(path);
}

export async function sendJson(path, method, payload) {
    const options = {method};

    if (payload !== undefined) {
        options.headers = {'Content-Type': 'application/json'};
        options.body = JSON.stringify(payload);
    }

    return requestJson(path, options);
}

export async function deleteRequest(path) {
    return request(path, {method: 'DELETE'});
}

export async function requestJson(path, options = {}) {
    const response = await request(path, options);

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export async function request(path, options = {}) {
    const response = await apiFetch(path, options);

    if (!response.ok) {
        throw await buildError(response);
    }

    return response;
}

async function buildError(response) {
    const fallbackMessage = `Request failed (${response.status})`;

    let text = '';

    try {
        text = await response.text();
    } catch {
        // Keep fallback message.
    }

    let errorBody = null;

    if (text) {
        try {
            errorBody = JSON.parse(text);
        } catch {
            // Non-JSON error response.
        }
    }

    const error = new Error(
        errorBody?.message
        || errorBody?.error
        || Object.values(errorBody?.fieldErrors ?? {})[0]
        || text
        || fallbackMessage
    );

    error.status = response.status;
    error.fieldErrors = errorBody?.fieldErrors;

    return error;
}