import {
    deleteRequest,
    getJson,
    sendJson,
} from '../../../utils/api-client.js';

function buildBenchmarkQuery({exerciseIds, benchmarkType} = {}) {
    const params = new URLSearchParams();

    const normalizedExerciseIds = exerciseIds
        ? Array.from(exerciseIds)
        : [];

    if (normalizedExerciseIds.length > 0) {
        params.set('exerciseIds', normalizedExerciseIds.join(','));
    }

    if (benchmarkType) {
        params.set('benchmarkType', benchmarkType);
    }

    const query = params.toString();

    return query ? `?${query}` : '';
}

export function apiGetCurrentClientExerciseBenchmarks(clientId, options) {
    return getJson(
        `/api/clients/${clientId}/exercise-benchmarks`
        + buildBenchmarkQuery(options)
    );
}

export function apiGetClientExerciseBenchmarkHistory(clientId, options) {
    return getJson(
        `/api/clients/${clientId}/exercise-benchmarks/history`
        + buildBenchmarkQuery(options)
    );
}

export function apiCreateClientExerciseBenchmark(clientId, payload) {
    return sendJson(
        `/api/clients/${clientId}/exercise-benchmarks`,
        'POST',
        payload,
    );
}

export function apiUpdateClientExerciseBenchmark(clientId, benchmarkId, payload) {
    return sendJson(
        `/api/clients/${clientId}/exercise-benchmarks/${benchmarkId}`,
        'PUT',
        payload,
    );
}

export function apiDeleteClientExerciseBenchmark(clientId, benchmarkId) {
    return deleteRequest(
        `/api/clients/${clientId}/exercise-benchmarks/${benchmarkId}`,
    );
}
