import {useState} from 'react';

import {
    apiSaveClientWorkoutRecordSetResult,
} from '../client-workout-api.js';

import {
    usesSeparateSideValues,
} from './client-workout-set-result-utils.js';

import {
    cloneSetResultValues,
    createSetResultDraft,
    mergeSetResultValues,
    normalizeSetResultValues,
    serializeSetResultDraft,
    splitSetResultValues,
    updateSetResultValue,
} from './client-workout-set-result-draft-utils.js';

function useClientWorkoutRecordSetResultDraft({workoutId, clientWorkoutItemId = null, clientWorkoutItemExerciseId = null, setKey, config, result, onResultSaved}) {

    const [persistedDraft, setPersistedDraft] = useState(() => createSetResultDraft(config, result));

    const [values, setValues] = useState(() => cloneSetResultValues(persistedDraft.values));

    const [notes, setNotes] = useState(persistedDraft.notes);
    const [completed, setCompleted] = useState(persistedDraft.completed);

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const identity = {
        clientWorkoutItemId,
        clientWorkoutItemExerciseId,
        setKey,
    };

    const separateSides = config.eachSide && usesSeparateSideValues(values);

    const dirty = serializeSetResultDraft(values, notes, completed) !== persistedDraft.serialized;

    function applyDraft(draft) {
        setValues(cloneSetResultValues(draft.values));
        setNotes(draft.notes);
        setCompleted(draft.completed);
    }

    function resetDraft() {
        applyDraft(persistedDraft);
        setSaveError('');
    }

    function updateValue(side, fieldKey, nextValue) {
        setValues(currentValues => updateSetResultValue(currentValues, side, fieldKey, nextValue));
    }

    function splitSides() {
        setValues(currentValues => splitSetResultValues(currentValues));
    }

    function mergeSides(sourceSide) {
        setValues(currentValues => mergeSetResultValues(currentValues, sourceSide));
    }

    async function saveResult() {
        if (!dirty) {
            return true;
        }

        setSaving(true);
        setSaveError('');

        try {
            const savedResult = await apiSaveClientWorkoutRecordSetResult(
                workoutId,
                {
                    ...identity,
                    valuesJson: JSON.stringify(normalizeSetResultValues(values)),
                    notes,
                    completed,
                },
            );

            const savedDraft = createSetResultDraft(config, savedResult);

            setPersistedDraft(savedDraft);
            applyDraft(savedDraft);
            onResultSaved(savedResult, identity);

            return true;
        } catch (error) {
            console.error('Failed to update workout record result:', error,);
            setSaveError(error.message || 'Failed to save record changes.',);
            return false;
        } finally {
            setSaving(false);
        }
    }

    return {
        values,
        notes,
        completed,
        saving,
        saveError,
        dirty,
        separateSides,
        updateValue,
        splitSides,
        mergeSides,
        updateNotes: setNotes,
        updateCompleted: setCompleted,
        resetDraft,
        saveResult,
    };
}

export default useClientWorkoutRecordSetResultDraft;