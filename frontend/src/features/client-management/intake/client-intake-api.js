import {
    getJson,
    sendJson,
} from '../../../utils/api-client.js';

export function apiGetClientIntakes() {
    return getJson('/api/client-intakes');
}

export function apiGetClientIntakesForClient(clientId) {
    return getJson(`/api/client-intakes/client/${clientId}`);
}

export function apiGetClientIntake(intakeId) {
    return getJson(`/api/client-intakes/${intakeId}`);
}

export function apiCreateClientIntake(clientId) {
    return sendJson('/api/client-intakes', 'POST', {clientId});
}

export function apiSaveClientIntakeStep(intakeId, step, formData) {
    return sendJson(
        `/api/client-intakes/${intakeId}/step/${step}`,
        'PUT',
        {json: JSON.stringify(formData)}
    );
}

export function apiCompleteClientIntake(intakeId) {
    return sendJson(`/api/client-intakes/${intakeId}/complete`, 'PATCH');
}