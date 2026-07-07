import {
    deleteRequest,
    getJson,
    sendJson,
} from '../../utils/api-client.js';

export function apiGetExercises() {
    return getJson('/api/exercises');
}

export function apiCreateExercise(payload) {
    return sendJson('/api/exercises', 'POST', payload);
}

export function apiUpdateExercise(exerciseId, payload) {
    return sendJson(`/api/exercises/${exerciseId}`, 'PUT', payload);
}

export function apiArchiveExercise(exerciseId) {
    return deleteRequest(`/api/exercises/${exerciseId}`);
}