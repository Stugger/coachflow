import {useEffect, useMemo, useState} from 'react';

import WorkoutBuilder from '../../workout-builder/WorkoutBuilder';

import {
    apiCreateInitialAssessmentWorkout,
    apiGetClientWorkout,
    apiUpdateClientWorkout,
} from '../client-workouts/client-workout-api';

import {
    apiGetExercises,
    apiGetWorkoutTemplate,
} from '../../workout-library/workout-template-api';

import {createEmptyWorkoutDraft} from '../../workout-builder/draft/workout-draft-factory';

import {
    buildWorkoutDefinitionPayload,
    createWorkoutDefinitionDraftFromTemplate,
    normalizeWorkoutDefinitionForDraft,
} from '../../workout-builder/draft/workout-draft-mappers';

import {WORKOUT_BUILDER_SOURCE} from '../../workout-builder/workout-builder-constants';

function InitialAssessmentBuilder({opened, client, clientWorkoutId, sourceWorkoutTemplateId = null, onClose, onSaved}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [initialDraft, setInitialDraft] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [persistedWorkoutId, setPersistedWorkoutId] = useState(null);
    const [createdDuringOpen, setCreatedDuringOpen] = useState(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const trainerId = client?.trainer?.id;

    const isEditing = Boolean(clientWorkoutId);
    const isPersisted = Boolean(clientWorkoutId || persistedWorkoutId);

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
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

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
    }, [opened, client?.id, clientWorkoutId, sourceWorkoutTemplateId]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Loading & event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function loadBuilderData() {
        setLoaded(false);
        setLoadError('');
        setInitialDraft(null);
        setExercises([]);

        Promise.all([
            apiGetExercises(),
            loadInitialDraft(),
        ])
            .then(([loadedExercises, loadedDraft]) => {
                setExercises(loadedExercises);
                setInitialDraft(loadedDraft);
            })
            .catch(error => {
                console.error('Failed to load initial assessment builder:', error);
                setLoadError(error.message || 'Failed to load the initial assessment workout.');
            })
            .finally(() => {
                setLoaded(true);
            });
    }

    async function loadInitialDraft() {
        if (isEditing) {
            const clientWorkout = await apiGetClientWorkout(clientWorkoutId);
            return normalizeWorkoutDefinitionForDraft(clientWorkout);
        }

        if (sourceWorkoutTemplateId) {
            const template = await apiGetWorkoutTemplate(sourceWorkoutTemplateId);
            return createWorkoutDefinitionDraftFromTemplate(template);
        }

        return createEmptyWorkoutDraft();
    }

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

    function resetBuilderState() {
        setInitialDraft(null);
        setExercises([]);
        setLoaded(false);
        setLoadError('');
        setPersistedWorkoutId(null);
        setCreatedDuringOpen(false);
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
            recoveryKey={recoveryKey}
            isDraft={!isPersisted}
            isNew={!isPersisted && !Boolean(sourceWorkoutTemplateId)}
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
        />
    );
}

export default InitialAssessmentBuilder;