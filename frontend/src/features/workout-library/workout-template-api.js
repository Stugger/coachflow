import {
    deleteRequest,
    getJson,
    sendJson,
} from '../../utils/api-client';

export function apiGetWorkoutTemplates() {
    return getJson('/api/workout-templates');
}

export function apiGetWorkoutTemplate(workoutTemplateId) {
    return getJson(`/api/workout-templates/${workoutTemplateId}`);
}

export function apiCreateWorkoutTemplate(payload) {
    return sendJson('/api/workout-templates', 'POST', payload);
}

export function apiUpdateWorkoutTemplate(workoutTemplateId, payload) {
    return sendJson(`/api/workout-templates/${workoutTemplateId}`, 'PUT', payload);
}

export function apiArchiveWorkoutTemplate(workoutTemplateId) {
    return deleteRequest(`/api/workout-templates/${workoutTemplateId}`);
}