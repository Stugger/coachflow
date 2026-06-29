import {buildWorkoutDefinitionPayload} from './workout-draft-mappers';

export function readWorkoutDraftRecovery(key) {
    const rawDraft = localStorage.getItem(key);

    if (!rawDraft) {
        return null;
    }

    try {
        return JSON.parse(rawDraft);
    } catch (error) {
        console.error('Failed to parse saved workout draft:', error);
        localStorage.removeItem(key);
        return null;
    }
}

export function writeWorkoutDraftRecovery(key, draft) {
    localStorage.setItem(key, JSON.stringify(draft));
}

export function clearWorkoutDraftRecovery(key) {
    localStorage.removeItem(key);
}

export function createWorkoutDraftSnapshot(draft) {
    if (!draft) {
        return '';
    }

    return JSON.stringify(buildWorkoutDefinitionPayload(draft));
}