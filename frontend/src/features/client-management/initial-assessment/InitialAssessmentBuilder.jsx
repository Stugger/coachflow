import {useCallback, useEffect, useMemo, useState} from 'react';

import WorkoutBuilder from '../../workout-builder/WorkoutBuilder';

import {apiGetExercises} from '../../exercises/exercises-api'

import {
    apiCreateInitialAssessmentWorkout,
    apiGetClientWorkout,
    apiUpdateClientWorkout,
} from '../client-workouts/client-workout-api';

import {
    apiGetWorkoutTemplate,
} from '../../workout-library/workout-template-api';

import {
    apiGetCurrentClientExerciseBenchmarks,
} from '../benchmarks/client-exercise-benchmarks-api.js';

import {createEmptyWorkoutDraft} from '../../workout-builder/draft/workout-draft-factory';

import {
    buildWorkoutDefinitionPayload,
    createWorkoutDefinitionDraftFromTemplate,
    normalizeWorkoutDefinitionForDraft,
} from '../../workout-builder/draft/workout-draft-mappers';

import {WORKOUT_BUILDER_SOURCE} from '../../workout-builder/workout-builder-constants';

function InitialAssessmentBuilder({opened, client, clientWorkoutId, sourceWorkoutTemplateId = null, onClose, onResume, onSaved}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [initialDraft, setInitialDraft] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [benchmarks, setBenchmarks] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [persistedWorkoutId, setPersistedWorkoutId] = useState(null);
    const [createdDuringOpen, setCreatedDuringOpen] = useState(false);
    const [workoutStatus, setWorkoutStatus] = useState(null);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const trainerId = client?.trainer?.id;

    const isEditing = Boolean(clientWorkoutId);
    const isPersisted = Boolean(clientWorkoutId || persistedWorkoutId);
    const isLiveWorkout = workoutStatus === 'IN_PROGRESS';

    const recoveryKey = useMemo(() => {
        const trainerKey = trainerId ?? 'unknown';

        if (clientWorkoutId) {
            return `coachflow.workoutDraft.initial-assessment.edit.${trainerKey}.${clientWorkoutId}`;
        }

        if (sourceWorkoutTemplateId) {
            return `coachflow.workoutDraft.initial-assessment.template.${trainerKey}.${client?.id}.${sourceWorkoutTemplateId}`;
        }

        return `coachflow.workoutDraft.initial-assessment.new.${trainerKey}.${client?.id}`;
    }, [client?.id, clientWorkoutId, sourceWorkoutTemplateId, trainerId]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects & Callbacks
    // ------------------------------------------------------------------------------------------------------------------------

    const resetBuilderState = useCallback(() => {
        setInitialDraft(null);
        setExercises([]);
        setBenchmarks(null);
        setLoaded(false);
        setLoadError('');
        setPersistedWorkoutId(null);
        setCreatedDuringOpen(false);
        setWorkoutStatus(null);
    }, []);

    const loadInitialDraft = useCallback(async () => {
        if (isEditing) {
            const clientWorkout = await apiGetClientWorkout(clientWorkoutId);
            return {
                draft: normalizeWorkoutDefinitionForDraft(clientWorkout),
                status: clientWorkout.status,
            };
        }
        if (sourceWorkoutTemplateId) {
            const template = await apiGetWorkoutTemplate(sourceWorkoutTemplateId);
            return {
                draft: createWorkoutDefinitionDraftFromTemplate(template),
                status: null,
            };
        }
        return {
            draft: createEmptyWorkoutDraft(),
            status: null,
        };
    }, [clientWorkoutId, isEditing, sourceWorkoutTemplateId]);

    const loadCurrentBenchmarks = useCallback(async () => {
        try {
            return await apiGetCurrentClientExerciseBenchmarks(client.id);
        } catch (error) {
            console.error(
                'Failed to load client exercise benchmarks:',
                error,
            );

            return null;
        }
    }, [client.id]);

    const loadBuilderData = useCallback(() => {
        setLoaded(false);
        setLoadError('');
        setInitialDraft(null);
        setExercises([]);
        setBenchmarks(null);
        setWorkoutStatus(null);

        return Promise.all([
            apiGetExercises(),
            loadInitialDraft(),
            loadCurrentBenchmarks(),
        ])
            .then(([loadedExercises, loadedWorkoutContext, loadedBenchmarks]) => {
                setExercises(loadedExercises);
                setInitialDraft(loadedWorkoutContext.draft);
                setWorkoutStatus(loadedWorkoutContext.status);
                setBenchmarks(loadedBenchmarks);
            })
            .catch(error => {
                console.error('Failed to load initial assessment builder:', error);
                setLoadError(error.message || 'Failed to load the initial assessment workout.');
            })
            .finally(() => {
                setLoaded(true);
            });
    }, [loadInitialDraft, loadCurrentBenchmarks]);

    useEffect(() => {
        if (!opened) {
            resetBuilderState();
            return;
        }

        if (!client?.id) {
            return;
        }

        setPersistedWorkoutId(clientWorkoutId ?? null);
        loadBuilderData();
    }, [opened, client?.id, clientWorkoutId, resetBuilderState, loadBuilderData]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    async function saveInitialAssessmentDraft(draft) {
        const workoutId = persistedWorkoutId ?? clientWorkoutId;
        const isCreating = !workoutId;

        const definitionPayload = buildWorkoutDefinitionPayload(draft);

        const payload = workoutId
            ? definitionPayload
            : {
                ...definitionPayload,
                sourceWorkoutTemplateId:
                    draft.sourceWorkoutTemplateId
                    ?? sourceWorkoutTemplateId
                    ?? null,
            };

        const savedWorkout = workoutId
            ? await apiUpdateClientWorkout(workoutId, payload)
            : await apiCreateInitialAssessmentWorkout(client.id, payload);

        if (isCreating) {
            setCreatedDuringOpen(true);
        }

        setPersistedWorkoutId(savedWorkout.id);
        setWorkoutStatus(currentStatus => savedWorkout.status ?? currentStatus);

        return {
            savedEntity: savedWorkout,
            savedDraft: normalizeWorkoutDefinitionForDraft(savedWorkout),
        };
    }

    function handleClose() {
        onClose({
            hasSavedWorkout: isPersisted,
            createdDuringOpen,
        });
    }

    function handleResume() {
        onResume(persistedWorkoutId ?? clientWorkoutId);
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <WorkoutBuilder
            opened={opened}
            loaded={loaded}
            loadError={loadError}
            initialDraft={initialDraft}
            exercises={exercises}
            benchmarks={benchmarks}
            recoveryKey={recoveryKey}
            isDraft={!isPersisted}
            isNew={!isPersisted && !sourceWorkoutTemplateId}
            isLiveWorkout={isLiveWorkout}
            allowSaveWithoutChanges={Boolean(sourceWorkoutTemplateId) && !isEditing}
            autoFocusName={!isPersisted}
            source={WORKOUT_BUILDER_SOURCE.INITIAL_ASSESSMENT}
            clientName={client.firstName}
            discardTitle={isPersisted
                ? 'Discard unsaved initial assessment changes?'
                : 'Discard this initial assessment draft?'
            }
            onSave={saveInitialAssessmentDraft}
            onSaved={onSaved}
            onClose={handleClose}
            onResume={handleResume}
        />
    );
}

export default InitialAssessmentBuilder;