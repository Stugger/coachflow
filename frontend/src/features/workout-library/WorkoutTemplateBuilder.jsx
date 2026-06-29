import {useEffect, useMemo, useState} from 'react';
import {
    ActionIcon,
    Menu,
    Tooltip,
} from '@mantine/core';
import {
    IconDots,
    IconTrash,
} from '@tabler/icons-react';

import WorkoutBuilder from '../workout-builder/WorkoutBuilder';

import {
    apiCreateWorkoutTemplate,
    apiGetExercises,
    apiGetWorkoutTemplate,
    apiUpdateWorkoutTemplate,
} from './workout-template-api';

import {createEmptyWorkoutDraft} from '../workout-builder/draft/workout-draft-factory';

import {
    buildWorkoutDefinitionPayload,
    createWorkoutDefinitionCopy,
    normalizeWorkoutDefinitionForDraft,
} from '../workout-builder/draft/workout-draft-mappers';

function WorkoutTemplateBuilder({opened, mode, templateId, trainerId, onClose, onSaved}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [initialDraft, setInitialDraft] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [loadError, setLoadError] = useState('');

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const isEditing = mode === 'edit';
    const isCopying = mode === 'copy';
    const isCreating = mode === 'new';

    const canLoad = opened && (isCreating || templateId);

    const recoveryKey = useMemo(() => {
        if (isEditing && templateId) {
            return `coachflow.workoutDraft.template.edit.${trainerId}.${templateId}`;
        }

        if (isCopying && templateId) {
            return `coachflow.workoutDraft.template.copy.${trainerId}.${templateId}`;
        }

        return `coachflow.workoutDraft.template.new.${trainerId}`;
    }, [trainerId, isEditing, isCopying, templateId]);

    const headerActions = (
        <Menu shadow="md" withinPortal position="bottom-end">
            <Menu.Target>
                <Tooltip label="Workout options" position="top-end">
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        style={{flexShrink: 0}}
                    >
                        <IconDots size={18}/>
                    </ActionIcon>
                </Tooltip>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14}/>}
                    onClick={() => console.log('TODO - archive this workout')}
                    disabled={!isEditing}
                >
                    Archive workout
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (!opened) {
            resetTemplateEditorState();
            return;
        }

        if (!canLoad) {
            return;
        }

        loadTemplateEditorData();
    }, [opened, mode, templateId, trainerId]);

    // ------------------------------------------------------------------------------------------------------------------------
    // API loading
    // ------------------------------------------------------------------------------------------------------------------------

    function loadTemplateEditorData() {
        setLoaded(false);
        setLoadError('');
        setInitialDraft(null);
        setExercises([]);

        Promise.all([
            apiGetExercises(),
            loadInitialTemplateDraft(),
        ])
            .then(([loadedExercises, loadedDraft]) => {
                setExercises(loadedExercises);
                setInitialDraft(loadedDraft);
            })
            .catch(error => {
                console.error('Failed to load workout template editor:', error);
                setLoadError(error.message || 'Failed to load workout editor.');
            })
            .finally(() => setLoaded(true));
    }

    async function loadInitialTemplateDraft() {
        if (isEditing) {
            const template = await apiGetWorkoutTemplate(templateId);
            return normalizeWorkoutDefinitionForDraft(template);
        }

        if (isCopying) {
            const template = await apiGetWorkoutTemplate(templateId);
            return createWorkoutDefinitionCopy(template);
        }

        return createEmptyWorkoutDraft();
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Save handling
    // ------------------------------------------------------------------------------------------------------------------------

    async function saveTemplateDraft(draft) {
        const payload = buildWorkoutDefinitionPayload(draft);

        const savedTemplate = isEditing
            ? await apiUpdateWorkoutTemplate(templateId, payload)
            : await apiCreateWorkoutTemplate(payload);

        return {
            savedEntity: savedTemplate,
            savedDraft: normalizeWorkoutDefinitionForDraft(savedTemplate),
        };
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Reset helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function resetTemplateEditorState() {
        setInitialDraft(null);
        setExercises([]);
        setLoaded(false);
        setLoadError('');
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
            isDraft={isCreating || isCopying}
            isNew={isCreating}
            allowSaveWithoutChanges={isCopying}
            autoFocusName={!isEditing}
            headerActions={headerActions}
            discardTitle={isEditing
                ? 'Discard unsaved changes?'
                : 'Discard this workout draft?'
            }
            onSave={saveTemplateDraft}
            onSaved={onSaved}
            onClose={onClose}
        />
    );
}

export default WorkoutTemplateBuilder;
