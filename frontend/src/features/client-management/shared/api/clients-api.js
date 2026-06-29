import {getJson, sendJson} from '../../../../utils/api-client.js';

export function apiGetClients() {
    return getJson('/api/clients');
}

export function apiGetClient(clientId) {
    return getJson(`/api/clients/${clientId}`);
}

export function apiCreateClient(payload) {
    return sendJson('/api/clients', 'POST', payload);
}

export function apiUpdateClient(clientId, payload) {
    return sendJson(`/api/clients/${clientId}`, 'PUT', payload);
}