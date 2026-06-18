import {useEffect, useMemo, useState} from 'react';
import {
    useComputedColorScheme,
    Alert,
    Button,
    Drawer,
    Group,
    LoadingOverlay,
    Modal,
    Paper,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
    Box,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {
    IconAlertCircle,
    IconCircleCheck,
    IconDeviceFloppy,
    IconSketching,
    IconX,
} from '@tabler/icons-react';

import WorkoutBuilder from '../workout-builder/WorkoutBuilder';

import {
    createWorkoutTemplate,
    getExercises,
    getWorkoutTemplate,
    updateWorkoutTemplate,
} from './workout-template-api';

import {createEmptyWorkoutDraft} from '../workout-builder/workout-draft-factory';

import {
    buildTemplatePayload,
    normalizeTemplateForCopy,
    normalizeTemplateForDraft,
} from '../workout-builder/workout-draft-mappers';

import {validateWorkoutDraft} from '../workout-builder/workout-draft-validation';

function WorkoutEditorModal({opened, mode, templateId, trainerId, onClose, onSaved}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isMobile = useMediaQuery('(max-width: 48em)');
    const computedColorScheme = useComputedColorScheme('light');

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [draft, setDraft] = useState(null);
    const [exercises, setExercises] = useState([]);

    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState('');

    const [savedSnapshot, setSavedSnapshot] = useState('');
    const [draftRecovered, setDraftRecovered] = useState(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const isEditing = mode === 'edit';
    const isCopying = mode === 'copy';
    const isCreating = mode === 'new';

    const title = useMemo(() => {
        if (isEditing) {
            return 'Edit Workout';
        }

        if (isCopying) {
            return 'Copy Workout';
        }

        return 'New Workout';
    }, [isEditing, isCopying]);

    const draftKey = useMemo(() => {
        if (isEditing && templateId) {
            return `coachflow.workoutDraft.template.edit.${trainerId}.${templateId}`;
        }

        if (isCopying && templateId) {
            return `coachflow.workoutDraft.template.copy.${trainerId}.${templateId}`;
        }

        return `coachflow.workoutDraft.template.new.${trainerId}`;
    }, [trainerId, isEditing, isCopying, templateId]);

    const currentSnapshot = useMemo(() => {
        return createSnapshot(draft);
    }, [draft, trainerId]);

    const hasUnsavedChanges = loaded && draft && currentSnapshot !== savedSnapshot;

    const canLoad = opened && trainerId && (isCreating || templateId);

    const statusLabel = useMemo(() => {
        if (!draft) {
            return '';
        }

        if (isCreating || isCopying) {
            return hasUnsavedChanges ? 'Unsaved' : 'Draft';
        }

        return hasUnsavedChanges ? 'Unsaved' : 'Saved';
    }, [draft, isCreating, isCopying, hasUnsavedChanges]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (!opened) {
            resetModalState();
            return;
        }

        if (!canLoad) {
            return;
        }

        loadEditorData();
    }, [opened, mode, templateId, trainerId]);

    useEffect(() => {
        if (!opened || !loaded || !draft) {
            return;
        }

        localStorage.setItem(draftKey, JSON.stringify(draft));
    }, [opened, loaded, draft, draftKey]);

    // ------------------------------------------------------------------------------------------------------------------------
    // API loading
    // ------------------------------------------------------------------------------------------------------------------------

    function loadEditorData() {
        setLoaded(false);
        setSaving(false);
        setMessage('');
        setDraftRecovered(false);

        Promise.all([
            getExercises(trainerId),
            loadInitialDraftState(),
        ])
            .then(([loadedExercises, draftState]) => {
                setExercises(loadedExercises);
                setDraft(draftState.draft);
                setSavedSnapshot(draftState.savedSnapshot);
            })
            .catch(error => {
                console.error('Failed to load workout editor:', error);
                setMessage(error.message || 'Failed to load workout editor.');
            })
            .finally(() => setLoaded(true));
    }

    async function loadInitialDraftState() {
        const savedDraft = readSavedDraft();

        if (isEditing) {
            const template = await getWorkoutTemplate(templateId, trainerId);
            const backendDraft = normalizeTemplateForDraft(template, trainerId);
            const backendSnapshot = createSnapshot(backendDraft);

            if (savedDraft) {
                setDraftRecovered(true);

                return {
                    draft: savedDraft,
                    savedSnapshot: backendSnapshot,
                };
            }

            return {
                draft: backendDraft,
                savedSnapshot: backendSnapshot,
            };
        }

        if (isCopying) {
            const template = await getWorkoutTemplate(templateId, trainerId);
            const copyDraft = normalizeTemplateForCopy(template, trainerId);

            if (savedDraft) {
                setDraftRecovered(true);

                return {
                    draft: savedDraft,
                    savedSnapshot: createSnapshot(copyDraft),
                };
            }

            return {
                draft: copyDraft,
                savedSnapshot: createSnapshot(copyDraft),
            };
        }

        const emptyDraft = createEmptyWorkoutDraft(trainerId);

        if (savedDraft) {
            setDraftRecovered(true);

            return {
                draft: savedDraft,
                savedSnapshot: createSnapshot(emptyDraft),
            };
        }

        return {
            draft: emptyDraft,
            savedSnapshot: createSnapshot(emptyDraft),
        };
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Draft persistence helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function readSavedDraft() {
        const rawDraft = localStorage.getItem(draftKey);

        if (!rawDraft) {
            return null;
        }

        try {
            return JSON.parse(rawDraft);
        } catch (error) {
            console.error('Failed to parse saved workout draft:', error);
            localStorage.removeItem(draftKey);
            return null;
        }
    }

    function clearSavedDraft() {
        localStorage.removeItem(draftKey);
    }

    function createSnapshot(nextDraft) {
        if (!nextDraft) {
            return '';
        }

        return JSON.stringify(buildTemplatePayload(nextDraft, trainerId));
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Draft update helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function updateDraftField(field, value) {
        setDraft(currentDraft => ({
            ...currentDraft,
            [field]: value,
        }));
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function handleClose() {
        const confirmed = !hasUnsavedChanges || window.confirm('Discard unsaved workout changes?');

        if (!confirmed) {
            return;
        }

        clearSavedDraft();
        onClose();
    }

    function saveWorkout() {
        const validationErrors = validateWorkoutDraft(draft);

        if (validationErrors.length > 0) {
            setMessage(validationErrors[0]);
            return;
        }

        setSaving(true);
        setMessage('');

        const payload = buildTemplatePayload(draft, trainerId);

        const request = isEditing
            ? updateWorkoutTemplate(templateId, payload)
            : createWorkoutTemplate(payload);

        request
            .then(savedTemplate => {
                clearSavedDraft();
                setSavedSnapshot(currentSnapshot);

                if (onSaved) {
                    onSaved(savedTemplate);
                    return;
                }

                onClose();
            })
            .catch(error => {
                console.error('Failed to save workout:', error);
                setMessage(error.message || 'Failed to save workout.');
            })
            .finally(() => setSaving(false));
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Reset helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function resetModalState() {
        setDraft(null);
        setExercises([]);
        setLoaded(false);
        setSaving(false);
        setMessage('');
        setSavedSnapshot('');
        setDraftRecovered(false);
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderEditorContent() {
        return (
            <Stack gap="md" pos="relative">
                <LoadingOverlay visible={!loaded || saving}/>

                {draftRecovered && (
                    <Alert color="blue"
                           icon={<IconAlertCircle size={16}/>}
                           withCloseButton
                           onClose={() => setDraftRecovered(false)}
                    >
                        Restored an unsaved workout draft from this browser.
                    </Alert>
                )}

                {message && (
                    <Alert color="red"
                           icon={<IconAlertCircle size={16}/>}
                           withCloseButton
                           onClose={() => setMessage('')}
                    >
                        {message}
                    </Alert>
                )}

                {draft && (
                    <>
                        <Paper withBorder radius="md" p="md">
                            <Stack gap="md">
                                <Stack gap={2}>
                                    <Text fw={800}>Workout Details</Text>
                                    <Text size="sm" c="dimmed">
                                        Name and describe this workout.
                                    </Text>
                                </Stack>

                                <TextInput
                                    label="Workout name"
                                    placeholder="Full Body Strength A"
                                    value={draft.name}
                                    onChange={event => updateDraftField('name', event.currentTarget.value)}
                                    required
                                />

                                <Textarea
                                    label="Description"
                                    placeholder="Optional notes about when or how to use this workout"
                                    value={draft.description || ''}
                                    onChange={event => updateDraftField('description', event.currentTarget.value)}
                                    autosize
                                    minRows={2}
                                />

                                <TextInput
                                    label="Cover image URL"
                                    placeholder="Optional image URL"
                                    value={draft.coverImageUrl || ''}
                                    onChange={event => updateDraftField('coverImageUrl', event.currentTarget.value)}
                                />
                            </Stack>
                        </Paper>

                        <WorkoutBuilder
                            draft={draft}
                            exercises={exercises}
                            onChange={setDraft}
                        />
                    </>
                )}
            </Stack>
        );
    }

    function renderFooter() {
        return (
            <Box
                style={{
                    padding: 'var(--mantine-spacing-md)',
                    borderTop: '1px solid var(--color-border)',
                    backgroundColor: computedColorScheme === 'dark'
                        ? 'var(--color-surface)'
                        : 'var(--color-background)',
                    flexShrink: 0,
                }}
            >
                <Group justify="space-between">
                    {statusLabel === 'Saved' && (
                        <Group gap={3}>
                            <IconCircleCheck size={16} stroke={2.4} color='green'/>
                            <Text size="sm" c='dimmed' fw={600}>Saved</Text>
                        </Group>
                    )}
                    {statusLabel === 'Draft' && (
                        <Group gap={3}>
                            <IconSketching size={16} stroke={2.4} color='gray'/>
                            <Text size="sm" c='dimmed' fw={600}>Draft</Text>
                        </Group>
                    )}
                    {statusLabel === 'Unsaved' && (
                        <Group gap={3}>
                            <IconAlertCircle size={16} stroke={2.4} color='orange'/>
                            <Text size="sm" c='dimmed' fw={600}>Unsaved</Text>
                        </Group>
                    )}

                    <Group>
                        <Button variant="default" size={isMobile ? "xs" : "sm"} leftSection={<IconX size={16}/>} onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            size={isMobile ? "xs" : "sm"}
                            leftSection={<IconDeviceFloppy size={16}/>}
                            onClick={saveWorkout}
                            loading={saving}
                        >
                            Save & Close
                        </Button>
                    </Group>
                </Group>
            </Box>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    if (isMobile) {
        return (
            <Drawer.Root
                opened={opened}
                onClose={handleClose}
                position="bottom"
                size="100%"
                closeOnClickOutside={false}
                closeOnEscape={false}
            >
                <Drawer.Overlay/>

                <Drawer.Content
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100dvh',
                        width: '100dvw',
                        overflow: 'hidden',
                    }}
                >
                    <Drawer.Header
                        style={{
                            flexShrink: 0,
                            borderBottom: '1px solid var(--color-border)',
                            backgroundColor: computedColorScheme === 'dark'
                                ? 'var(--color-surface)'
                                : 'var(--color-background)',
                        }}
                    >
                        <Drawer.Title style={{fontSize: '1.5rem', fontWeight: 'bold'}}>
                            {title}
                        </Drawer.Title>
                        <Drawer.CloseButton/>
                    </Drawer.Header>

                    <Drawer.Body
                        style={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            padding: 'var(--mantine-spacing-md)',
                        }}
                    >
                        {renderEditorContent()}
                    </Drawer.Body>

                    {renderFooter()}
                </Drawer.Content>
            </Drawer.Root>
        );
    }

    return (
        <Modal.Root
            opened={opened}
            onClose={handleClose}
            centered
            closeOnClickOutside={false}
            closeOnEscape={false}
            fullScreen
        >
            <Modal.Overlay/>

            <Modal.Content
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 'none',
                    width: 'calc(100vw - 6rem)',
                    height: 'calc(100vh - 6rem)',
                    margin: '3rem',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                }}
            >
                <Modal.Header
                    style={{
                        flexShrink: 0,
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: computedColorScheme === 'dark'
                            ? 'var(--color-surface)'
                            : 'var(--color-background)',
                    }}
                >
                    <Modal.Title style={{fontSize: '1.5rem', fontWeight: 'bold'}}>
                        {title}
                    </Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>

                <Modal.Body
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        padding: 'var(--mantine-spacing-md)',
                    }}
                >
                    {renderEditorContent()}
                </Modal.Body>

                {renderFooter()}
            </Modal.Content>
        </Modal.Root>
    );
}

export default WorkoutEditorModal;