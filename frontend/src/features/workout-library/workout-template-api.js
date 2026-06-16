const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getWorkoutTemplates(trainerId) {
    return getJson(`${API_BASE_URL}/api/workout-templates/trainer/${trainerId}`);
}

export async function getWorkoutTemplate(workoutTemplateId, trainerId) {
    return getJson(`${API_BASE_URL}/api/workout-templates/${workoutTemplateId}?trainerId=${trainerId}`);
}

export async function createWorkoutTemplate(payload) {
    return sendJson(`${API_BASE_URL}/api/workout-templates`, 'POST', payload);
}

export async function updateWorkoutTemplate(workoutTemplateId, payload) {
    return sendJson(`${API_BASE_URL}/api/workout-templates/${workoutTemplateId}`, 'PUT', payload);
}

export async function archiveWorkoutTemplate(workoutTemplateId, trainerId) {
    const response = await fetch(`${API_BASE_URL}/api/workout-templates/${workoutTemplateId}?trainerId=${trainerId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw await buildError(response, 'Failed to archive workout template');
    }
}

export async function getExercises(trainerId) {
    return getJson(`${API_BASE_URL}/api/exercises/trainer/${trainerId}`);
}

async function getJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw await buildError(response, 'Request failed');
    }

    return response.json();
}

async function sendJson(url, method, payload) {
    const response = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw await buildError(response, 'Request failed');
    }

    return response.json();
}

async function buildError(response, fallbackMessage) {
    try {
        const body = await response.json();
        return new Error(body.message || fallbackMessage);
    } catch {
        return new Error(fallbackMessage);
    }
}
