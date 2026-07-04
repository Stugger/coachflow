import {
    deleteRequest,
    getJson,
    sendJson,
} from '../../../utils/api-client.js';

export function apiGetInitialAssessmentWorkout(clientId) {
    return getJson(`/api/clients/${clientId}/initial-assessment-workout`);
}

export function apiCreateInitialAssessmentWorkout(clientId, payload) {
    return sendJson(`/api/clients/${clientId}/initial-assessment-workout`, 'POST', payload);
}

export function apiGetClientWorkout(clientWorkoutId) {
    return getJson(`/api/client-workouts/${clientWorkoutId}`);
}

export function apiUpdateClientWorkout(clientWorkoutId, payload) {
    return sendJson(`/api/client-workouts/${clientWorkoutId}`, 'PUT', payload);
}

export function apiDeleteClientWorkout(clientWorkoutId) {
    return deleteRequest(`/api/client-workouts/${clientWorkoutId}`);
}