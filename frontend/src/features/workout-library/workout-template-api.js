import {apiFetch} from '../../utils/api-client.js';

export async function getWorkoutTemplates() {
    return getJson('/api/workout-templates');
}

export async function getWorkoutTemplate(workoutTemplateId) {
    return getJson(`/api/workout-templates/${workoutTemplateId}`);
}

export async function createWorkoutTemplate(payload) {
    return sendJson('/api/workout-templates', 'POST', payload);
}

export async function updateWorkoutTemplate(workoutTemplateId, payload) {
    return sendJson(`/api/workout-templates/${workoutTemplateId}`, 'PUT', payload);
}

export async function archiveWorkoutTemplate(workoutTemplateId) {
    const response = await apiFetch(
        `/api/workout-templates/${workoutTemplateId}`,
        {method: 'DELETE'}
    );

    if (!response.ok) {
        throw await buildError(response);
    }
}

export async function getExercises() {
    return getJson('/api/exercises');
}

async function getJson(path) {
    const response = await apiFetch(path);

    if (!response.ok) {
        throw await buildError(response);
    }

    return response.json();
}

async function sendJson(path, method, payload) {
    const response = await apiFetch(path, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw await buildError(response);
    }

    return response.json();
}

async function buildError(response) {
    let message = `Request failed (${response.status})`;

    try {
        const text = await response.text();

        if (text) {
            try {
                const json = JSON.parse(text);
                message = json.message || json.error || text;
            } catch {
                message = text;
            }
        }
    } catch {
        // Keep fallback message
    }

    return new Error(message);
}