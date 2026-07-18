import {useEffect, useRef, useState} from 'react';

import {apiSaveClientWorkoutSetResult} from '../client-workout-api.js';

const AUTOSAVE_DELAY = 700;

function useClientWorkoutSetResultDraft({workoutId, clientWorkoutItemId = null, clientWorkoutItemExerciseId = null, setKey, config, result, onResultSaved}) {

    const [values, setValues] = useState(() => createInitialValues(config, result));
    const [notes, setNotes] = useState(result?.notes ?? '');
    const [saveStatus, setSaveStatus] = useState('idle');
    const [saveError, setSaveError] = useState('');

    const valuesRef = useRef(values);
    const notesRef = useRef(notes);
    const completedRef = useRef(Boolean(result?.completedAt));
    const revisionRef = useRef(0);
    const saveAttemptRef = useRef(0);
    const dirtyRef = useRef(false);
    const saveTimerRef = useRef(null);
    const saveQueueRef = useRef(Promise.resolve());

    const identity = {
        clientWorkoutItemId,
        clientWorkoutItemExerciseId,
        setKey,
    };

    useEffect(() => {
        return () => clearTimeout(saveTimerRef.current);
    }, []);

    function updateValue(side, fieldKey, nextValue) {
        const nextSideValues = {...valuesRef.current[side]};

        if (nextValue === '' || nextValue === null || nextValue === undefined) {
            delete nextSideValues[fieldKey];
        } else {
            nextSideValues[fieldKey] = nextValue;
        }

        const nextValues = {
            ...valuesRef.current,
            [side]: nextSideValues,
        };

        valuesRef.current = nextValues;
        setValues(nextValues);
        scheduleAutosave();
    }

    function updateNotes(nextNotes) {
        notesRef.current = nextNotes;
        setNotes(nextNotes);
        scheduleAutosave();
    }

    function scheduleAutosave() {
        revisionRef.current += 1;
        dirtyRef.current = true;

        setSaveStatus('dirty');
        setSaveError('');

        clearTimeout(saveTimerRef.current);

        saveTimerRef.current = setTimeout(() => {
            void saveResult(completedRef.current);
        }, AUTOSAVE_DELAY);
    }

    function flushAutosave() {
        if (dirtyRef.current) {
            void saveResult(completedRef.current);
        }
    }

    async function saveResult(nextCompleted = completedRef.current) {
        clearTimeout(saveTimerRef.current);

        const revision = revisionRef.current;
        const saveAttempt = ++saveAttemptRef.current;

        const payload = {
            ...identity,
            valuesJson: JSON.stringify(normalizeResultValues(valuesRef.current)),
            notes: notesRef.current,
            completed: nextCompleted,
        };

        dirtyRef.current = false;

        setSaveStatus('saving');
        setSaveError('');

        const request = saveQueueRef.current.then(() =>
            apiSaveClientWorkoutSetResult(workoutId, payload)
        );

        /*
         * Keep the internal queue fulfilled after a failed request so the
         * next attempted save may still proceed.
         */
        saveQueueRef.current = request.catch(() => null);

        try {
            const savedResult = await request;

            completedRef.current = Boolean(savedResult?.completedAt);
            onResultSaved(savedResult, identity);

            if (saveAttempt === saveAttemptRef.current && revision === revisionRef.current) {
                setSaveStatus('saved');
            }

            return true;
        } catch (error) {
            console.error('Failed to save workout set result:', error);

            if (saveAttempt === saveAttemptRef.current && revision === revisionRef.current) {
                dirtyRef.current = true;
                setSaveStatus('error');
                setSaveError(error.message || 'Failed to save this set.');
            }

            return false;
        }
    }

    return {
        values,
        notes,
        saveStatus,
        saveError,
        updateValue,
        updateNotes,
        flushAutosave,
        saveResult,
    };
}

function createInitialValues(config, result) {
    if (config.eachSide) {
        return {
            left: {...(result?.values?.left ?? {})},
            right: {...(result?.values?.right ?? {})},
        };
    }

    return {
        default: {...(result?.values?.default ?? {})},
    };
}

function normalizeResultValues(values) {
    return Object.fromEntries(
        Object.entries(values)
            .map(([side, sideValues]) => [
                side,
                Object.fromEntries(
                    Object.entries(sideValues).filter(([, value]) =>
                        value !== ''
                        && value !== null
                        && value !== undefined
                    ),
                ),
            ])
            .filter(([, sideValues]) => Object.keys(sideValues).length),
    );
}

export default useClientWorkoutSetResultDraft;