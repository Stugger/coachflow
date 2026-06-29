import {
    deleteRequest,
    getJson,
    sendJson,
} from '../../utils/api-client.js';

export async function apiGetWorkoutTemplates() {
    return getJson('/api/workout-templates');
}

export async function apiGetWorkoutTemplate(workoutTemplateId) {
    return getJson(`/api/workout-templates/${workoutTemplateId}`);
}

export async function apiCreateWorkoutTemplate(payload) {
    return sendJson('/api/workout-templates', 'POST', payload);
}

export async function apiUpdateWorkoutTemplate(workoutTemplateId, payload) {
    return sendJson(`/api/workout-templates/${workoutTemplateId}`, 'PUT', payload);
}

export async function apiArchiveWorkoutTemplate(workoutTemplateId) {
    return deleteRequest(`/api/workout-templates/${workoutTemplateId}`);
}

export async function apiGetExercises() {
    return getJson('/api/exercises');
}