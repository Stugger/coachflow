import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useIsSmallScreen} from '../../hooks/useIsSmallScreen.js'
import {
    useComputedColorScheme,
    Alert,
    Badge,
    Button,
    Drawer,
    Group,
    Loader,
    LoadingOverlay,
    Modal,
    Paper,
    Stack,
    Text,
    Textarea,
    TextInput,
    Box,
} from '@mantine/core';
import {
    IconAlertCircle,
    IconDeviceFloppy,
    IconDumbbell,
    IconHammer,
    IconSketching,
    IconX,
} from '@tabler/icons-react';

import ExerciseViewer from '../exercises/components/ExerciseViewer';
import WorkoutStructureEditor from './structure/WorkoutStructureEditor';

import {getWorkoutEquipment} from './draft/workout-draft-mappers';
import {
    validateWorkoutDraft,
    WORKOUT_VALIDATION_SCOPE,
} from './draft/workout-draft-validation';
import {
    clearWorkoutDraftRecovery,
    createWorkoutDraftSnapshot,
    readWorkoutDraftRecovery,
    writeWorkoutDraftRecovery,
} from './draft/workout-draft-recovery';

import {WORKOUT_BUILDER_SOURCE} from "../workout-builder/workout-builder-constants";

function WorkoutBuilder({
                        opened,
                        loaded,
                        loadError,
                        initialDraft,
                        exercises = [],
                        recoveryKey,
                        isDraft = false,
                        isNew = false,
                        allowSaveWithoutChanges = false,
                        autoFocusName = false,
                        source,
                        clientName = null,
                        headerActions,
                        discardTitle = 'Discard unsaved changes?',
                        onSave,
                        onSaved,
                        onClose,
                    }) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isSmallScreen = useIsSmallScreen();
    const computedColorScheme = useComputedColorScheme('light');

    const inputRef = useRef(null);
    const hasFocusedNameRef = useRef(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [draft, setDraft] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [savedSnapshot, setSavedSnapshot] = useState('');
    const [draftRecovered, setDraftRecovered] = useState(false);
    const [activeValidationIssueIds, setActiveValidationIssueIds] = useState([]);
    const [exitModalOpen, setExitModalOpen] = useState(false);
    const [exerciseOverlay, setExerciseOverlay] = useState(null);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const isLoading = !loaded || (!draft && !loadError);

    const title = useMemo(() => {
        if (draft?.name) {
            return draft.name;
        }

        return isLoading && !isNew ? '...' : 'Unnamed';
    }, [draft, isLoading, isNew]);

    const workoutEquipment = useMemo(() => {
        return getWorkoutEquipment(draft);
    }, [draft]);

    const currentSnapshot = useMemo(() => {
        return createWorkoutDraftSnapshot(draft);
    }, [draft]);

    const hasUnsavedChanges = Boolean(draft && currentSnapshot !== savedSnapshot);

    const hasSaveableChanges = allowSaveWithoutChanges || hasUnsavedChanges;

    const validationIssues = useMemo(() => {
        return validateWorkoutDraft(draft);
    }, [draft]);

    const activeValidationIssues = validationIssues.filter(issue =>
        activeValidationIssueIds.includes(issue.id)
    );

    const showValidation = activeValidationIssues.length > 0;

    const workoutNameIssue = activeValidationIssues.find(issue =>
        issue.scope === WORKOUT_VALIDATION_SCOPE.WORKOUT &&
        issue.field === 'name'
    );

    const editorStatus = useMemo(() => {
        if (!draft) {
            return null;
        }

        if (saving) {
            return {
                label: 'Saving…',
                color: 'var(--mantine-color-gray-5)',
                loading: true,
            };
        }

        if (isDraft) {
            return {
                label: hasUnsavedChanges ? 'Unsaved draft' : 'Draft',
                icon: <IconSketching size={16} color="gray" style={{flexShrink: 0}} />,
            };
        }

        return hasUnsavedChanges
            ? {
                label: 'Unsaved changes',
                color: 'var(--mantine-color-yellow-6)',
            }
            : {
                label: 'Saved',
                color: 'var(--mantine-color-green-6)',
            };
    }, [draft, saving, isDraft, hasUnsavedChanges]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects & Callbacks
    // ------------------------------------------------------------------------------------------------------------------------

    const resetEditorState = useCallback(() => {
        setDraft(null);
        setSaving(false);
        setMessage('');
        setSavedSnapshot('');
        setDraftRecovered(false);
        setActiveValidationIssueIds([]);
        setExitModalOpen(false);
        setExerciseOverlay(null);
    }, []);

    useEffect(() => {
        if (!opened) {
            resetEditorState();
            return;
        }

        if (!loaded || !initialDraft) {
            return;
        }

        const recoveredDraft = readWorkoutDraftRecovery(recoveryKey);

        setDraft(recoveredDraft ?? initialDraft);
        setSavedSnapshot(createWorkoutDraftSnapshot(initialDraft));
        setDraftRecovered(Boolean(recoveredDraft));
        setSaving(false);
        setMessage(loadError || '');
        setActiveValidationIssueIds([]);
    }, [opened, loaded, initialDraft, recoveryKey, loadError, resetEditorState]);

    useEffect(() => {
        if (!opened || !loadError) {
            return;
        }

        setMessage(loadError);
    }, [opened, loadError]);

    useEffect(() => {
        if (!opened) {
            hasFocusedNameRef.current = false;
            return;
        }

        if (!autoFocusName || !loaded || !draft || hasFocusedNameRef.current) {
            return;
        }

        hasFocusedNameRef.current = true;

        const timeoutId = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 50);

        return () => window.clearTimeout(timeoutId);
    }, [opened, loaded, recoveryKey, autoFocusName, draft]);

    useEffect(() => {
        if (!opened || !loaded || !draft || !recoveryKey) {
            return;
        }

        if (!hasUnsavedChanges) {
            clearWorkoutDraftRecovery(recoveryKey);
            return;
        }

        writeWorkoutDraftRecovery(recoveryKey, draft);
    }, [opened, loaded, draft, recoveryKey, hasUnsavedChanges]);

    useEffect(() => {
        setActiveValidationIssueIds(previousIds => {
            const currentIssueIds = new Set(
                validationIssues.map(issue => issue.id)
            );

            const nextIds = previousIds.filter(issueId =>
                currentIssueIds.has(issueId)
            );

            return nextIds.length === previousIds.length
                ? previousIds
                : nextIds;
        });
    }, [validationIssues]);

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

    function discardAndClose() {
        setExitModalOpen(false);
        clearWorkoutDraftRecovery(recoveryKey);
        onClose();
    }

    function handleClose() {
        if (!hasUnsavedChanges) {
            discardAndClose();
            return;
        }

        setExitModalOpen(true);
    }

    async function saveWorkout() {
        setMessage('');

        if (validationIssues.length > 0) {
            setActiveValidationIssueIds(
                validationIssues.map(issue => issue.id)
            );
            return;
        }

        setActiveValidationIssueIds([]);
        setSaving(true);

        try {
            const result = await onSave(draft);
            const savedDraft = result?.savedDraft;

            if (!savedDraft) {
                throw new Error('The workout could not be saved because no saved draft was returned.');
            }

            clearWorkoutDraftRecovery(recoveryKey);
            setDraft(savedDraft);
            setSavedSnapshot(createWorkoutDraftSnapshot(savedDraft));
            setDraftRecovered(false);
            setActiveValidationIssueIds([]);

            onSaved?.(result.savedEntity);
        } catch (error) {
            console.error('Failed to save workout:', error);
            setMessage(error.message || 'Failed to save workout.');
        } finally {
            setSaving(false);
        }
    }

    function openExerciseViewer(exercise) {
        setExerciseOverlay({
            mode: 'VIEW',
            exercise,
        });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderEditorContent() {
        return (
            <Stack gap="md" pos="relative">
                {draftRecovered && (
                    <Alert
                        color="blue"
                        icon={<IconAlertCircle size={16}/>}
                        withCloseButton
                        onClose={() => setDraftRecovered(false)}
                    >
                        Restored an unsaved workout draft from this browser.
                    </Alert>
                )}

                {message && (
                    <Alert
                        color="red"
                        icon={<IconAlertCircle size={16}/>}
                        withCloseButton
                        onClose={() => setMessage('')}
                    >
                        {message}
                    </Alert>
                )}

                {draft && (
                    <>
                        <Paper
                            withBorder
                            radius="md"
                            p="md"
                            bg={computedColorScheme === 'light'
                                ? 'var(--color-background)'
                                : 'var(--color-surface)'
                            }
                            style={{
                                borderColor: 'var(--color-border)'
                            }}
                        >
                            <Stack gap="lg">
                                <Group justify="space-between" align="center" wrap="nowrap">
                                    <TextInput
                                        classNames={{input: 'subtle-input'}}
                                        variant="filled"
                                        ref={inputRef}
                                        size="lg"
                                        placeholder={`Name ${source === WORKOUT_BUILDER_SOURCE.TEMPLATE ? 'your' : 'this'} workout`}
                                        value={draft.name}
                                        maxLength={255}
                                        onChange={event => updateDraftField('name', event.currentTarget.value)}
                                        error={workoutNameIssue?.message}
                                        required
                                        style={{
                                            flex: 1,
                                            minWidth: 0,
                                        }}
                                        styles={{
                                            input: {
                                                fontWeight: 600,
                                                fontSize: '1.3rem',
                                                ...(computedColorScheme === 'dark' ? {
                                                    backgroundColor: '#2f2f2f'
                                                } : {})
                                            },
                                        }}
                                    />

                                    {headerActions}
                                </Group>

                                <Textarea
                                    classNames={{input: 'subtle-input'}}
                                    variant="unstyled"
                                    pl="0.7rem"
                                    label={
                                        <Text size="xs" c="dimmed" fw={600} pl="0.7rem">
                                            DESCRIPTION
                                        </Text>
                                    }
                                    placeholder="Add a description"
                                    value={draft.description || ''}
                                    onChange={event => updateDraftField('description', event.currentTarget.value)}
                                    autosize
                                />

                                {workoutEquipment.length > 0 && (
                                    <Stack gap="sm">
                                        <Text size="xs" c="dimmed" fw={600} pl="1.4rem" pb={2}>
                                            EQUIPMENT
                                        </Text>

                                        <Group gap="xs" pl="1.4rem">
                                            {workoutEquipment.map(equipment => (
                                                <Badge
                                                    key={equipment}
                                                    bg="var(--color-surface)"
                                                    radius="sm"
                                                    leftSection={
                                                        <IconDumbbell
                                                            size={14}
                                                            color={computedColorScheme === 'light' ? 'black' : 'gray'}
                                                        />
                                                    }
                                                    styles={{
                                                        root: {
                                                            borderColor: computedColorScheme === 'light' ? 'black' : 'gray',
                                                        },
                                                        label: {
                                                            color: computedColorScheme === 'light' ? 'black' : 'gray',
                                                        },
                                                    }}
                                                >
                                                    {equipment}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </Stack>
                                )}
                            </Stack>
                        </Paper>

                        <WorkoutStructureEditor
                            draft={draft}
                            exercises={exercises}
                            validationIssues={activeValidationIssues}
                            onChange={setDraft}
                            onViewExercise={openExerciseViewer}
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
                    padding: isSmallScreen ? 'var(--mantine-spacing-sm)' : 'var(--mantine-spacing-md)',
                    borderTop: '2px solid var(--color-border)',
                    backgroundColor: computedColorScheme === 'dark'
                        ? 'var(--color-surface)'
                        : 'var(--color-background)',
                    flexShrink: 0,
                }}
            >
                <Stack gap="xs">
                    {showValidation && (
                        <Alert
                            color="red"
                            variant="light"
                            icon={<IconAlertCircle size={16} />}
                            p="xs"
                        >
                            {isSmallScreen
                                ? `${activeValidationIssues.length} issue${activeValidationIssues.length === 1 ? ' needs' : 's need'} attention.`
                                : `${activeValidationIssues.length} issue${activeValidationIssues.length === 1 ? ' needs' : 's need'} attention before saving.`}
                        </Alert>
                    )}

                    <Group justify={editorStatus ? 'space-between' : 'flex-end'} wrap="nowrap">
                        {editorStatus && (
                            <Group gap={editorStatus.icon ? 4 : 8} wrap="nowrap" pl={isSmallScreen && !editorStatus.icon ? 2 : 0}>
                                {editorStatus.loading ? (
                                    <Loader size={14} color="gray"/>
                                ) : editorStatus.icon ? (
                                    editorStatus.icon
                                ) : (
                                    <Box
                                        aria-hidden
                                        style={{
                                            width: '0.45rem',
                                            height: '0.45rem',
                                            borderRadius: '50%',
                                            backgroundColor: editorStatus.color,
                                            flexShrink: 0,
                                        }}
                                    />
                                )}

                                <Text size="sm" c="dimmed" fw={500}>
                                    {editorStatus.label}
                                </Text>
                            </Group>
                        )}

                        <Group wrap="nowrap" pr={isSmallScreen ? 2 : 0}>
                            <Button
                                variant="default"
                                size={isSmallScreen ? 'xs' : 'sm'}
                                leftSection={<IconX size={16}/>}
                                onClick={handleClose}
                            >
                                Close
                            </Button>

                            <Button
                                size={isSmallScreen ? 'xs' : 'sm'}
                                leftSection={<IconDeviceFloppy size={16}/>}
                                onClick={saveWorkout}
                                loading={saving}
                                disabled={
                                    isLoading ||
                                    saving ||
                                    !hasSaveableChanges ||
                                    activeValidationIssues.length > 0
                                }
                            >
                                Save
                            </Button>
                        </Group>
                    </Group>
                </Stack>
            </Box>
        );
    }

    function renderExitModal() {
        return (
            <Modal
                opened={exitModalOpen}
                onClose={() => setExitModalOpen(false)}
                title={discardTitle}
                centered
                zIndex="var(--mantine-z-index-popover)"
            >
                <Stack gap="lg">
                    <Text c="dimmed" size="sm">
                        Your unsaved changes and this browser's recovery draft will be discarded.
                    </Text>

                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            onClick={() => setExitModalOpen(false)}
                        >
                            Keep editing
                        </Button>

                        <Button
                            color="red"
                            onClick={discardAndClose}
                        >
                            Discard changes
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        );
    }

    function renderExerciseOverlay() {
        if (!exerciseOverlay) {
            return null;
        }

        const content = (
            <ExerciseViewer
                exercise={exerciseOverlay.exercise}
                onClose={() => setExerciseOverlay(null)}
            />
        );

        if (isSmallScreen) {
            return (
                <Drawer
                    opened
                    onClose={() => setExerciseOverlay(null)}
                    title="Exercise"
                    position="bottom"
                    size="100%"
                    zIndex={300}
                    styles={{
                        title: {fontSize: '1.2rem'},
                        body: {paddingBottom: '2rem'},
                    }}
                >
                    {content}
                </Drawer>
            );
        }

        return (
            <Modal
                opened
                onClose={() => setExerciseOverlay(null)}
                title="Exercise"
                centered
                size="48rem"
                zIndex={300}
                styles={{
                    title: {fontSize: '1.2rem'},
                }}
            >
                {content}
            </Modal>
        );
    }

    function renderHeaderTitle() {
        const sourceLabel = source
            ? `${source}${clientName ? ` for ${clientName}` : ''}`
            : null;

        return (
            <Stack gap={4}>
                {sourceLabel && (
                    <Group gap="0.2rem" wrap="nowrap" style={{minWidth: 0}}>
                        <IconHammer size={16} color="gray" style={{flexShrink: 0, paddingBottom: 1}} />
                            <Text
                                size="xs"
                                c="dimmed"
                                fw={600}
                                tt="uppercase"
                                truncate="end"
                            >
                                {sourceLabel}
                            </Text>
                    </Group>
                )}
                <Text
                    size={isSmallScreen ? '1.3rem' : '1.4rem'}
                    fw={600}
                    truncate="end"
                    style={{
                        minWidth: 0,
                        lineHeight: 1.2,
                    }}
                >
                    {title}
                </Text>
        </Stack>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            {renderExitModal()}
            {renderExerciseOverlay()}

            {isSmallScreen ? (
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
                        <LoadingOverlay visible={isLoading} overlayProps={{blur: 2}}/>

                        <Drawer.Header
                            style={{
                                flexShrink: 0,
                                paddingTop: '0.8rem',
                                paddingBottom: '0.8rem',
                                borderBottom: '2px solid var(--color-border)',
                                backgroundColor: computedColorScheme === 'dark'
                                    ? 'var(--color-surface)'
                                    : 'var(--color-background)',
                            }}
                        >
                            <Drawer.Title style={{flex: 1, minWidth: 0}}>
                                {renderHeaderTitle()}
                            </Drawer.Title>

                            <Drawer.CloseButton style={{flexShrink: 0}} />
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
            ) : (
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
                        <LoadingOverlay visible={isLoading} overlayProps={{blur: 2}}/>

                        <Modal.Header
                            style={{
                                flexShrink: 0,
                                paddingTop: '0.8rem',
                                paddingBottom: '0.8rem',
                                borderBottom: '2px solid var(--color-border)',
                                backgroundColor: computedColorScheme === 'dark'
                                    ? 'var(--color-surface)'
                                    : 'var(--color-background)',
                            }}
                        >
                            <Modal.Title style={{flex: 1, minWidth: 0}}>
                                {renderHeaderTitle()}
                            </Modal.Title>

                            <Modal.CloseButton style={{flexShrink: 0}} />
                        </Modal.Header>

                        <Modal.Body
                            style={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: 'auto',
                                padding: 'var(--mantine-spacing-lg)',
                            }}
                        >
                            {renderEditorContent()}
                        </Modal.Body>

                        {renderFooter()}
                    </Modal.Content>
                </Modal.Root>
            )}
        </>
    );
}

export default WorkoutBuilder;
