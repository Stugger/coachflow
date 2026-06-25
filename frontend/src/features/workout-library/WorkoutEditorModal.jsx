import {useEffect, useMemo, useState, useRef} from 'react';
import {
    useComputedColorScheme,
    ActionIcon,
    Alert,
    Badge,
    Button,
    Drawer,
    Group,
    Loader,
    LoadingOverlay,
    Modal,
    Menu,
    Paper,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
    Tooltip,
    Box,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {
    IconAlertCircle,
    IconCircleCheck,
    IconDeviceFloppy,
    IconDots,
    IconDumbbell,
    IconHammer,
    IconSketching,
    IconTrash,
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
    getWorkoutEquipment,
} from '../workout-builder/workout-draft-mappers';

import {
    validateWorkoutDraft,
    WORKOUT_VALIDATION_SCOPE,
} from '../workout-builder/workout-draft-validation';

function WorkoutEditorModal({opened, mode, templateId, trainerId, onClose, onSaved}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isMobile = useMediaQuery('(max-width: 48em)');
    const computedColorScheme = useComputedColorScheme('light');

    const inputRef = useRef(null);
    const hasFocusedNameRef = useRef(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [draft, setDraft] = useState(null);
    const [exercises, setExercises] = useState([]);

    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);

    const [activeValidationIssueIds, setActiveValidationIssueIds] = useState([]);
    const [message, setMessage] = useState('');

    const [savedSnapshot, setSavedSnapshot] = useState('');
    const [draftRecovered, setDraftRecovered] = useState(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const isEditing = mode === 'edit';
    const isCopying = mode === 'copy';
    const isCreating = mode === 'new';

    const canLoad = opened && trainerId && (isCreating || templateId);

    const [exitModalOpen, setExitModalOpen] = useState(false);

    const title = useMemo(() => {
        if (draft && draft.name) {
            return draft.name;
        }
        return !loaded && !isCreating ? "..." : "Unnamed";
    }, [draft, loaded, isCreating]);

    const workoutEquipment = useMemo(() => {
        return getWorkoutEquipment(draft);
    }, [draft]);

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
    const hasSaveableChanges = isCopying || hasUnsavedChanges;

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

        if (isCreating || isCopying) {
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
    }, [draft, saving, isCreating, isCopying, hasUnsavedChanges]);

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
        if (!opened) {
            hasFocusedNameRef.current = false;
            return;
        }

        if (isEditing || !loaded || !draft || hasFocusedNameRef.current) {
            return;
        }

        hasFocusedNameRef.current = true;

        const timeoutId = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 50);

        return () => window.clearTimeout(timeoutId);
    }, [opened, loaded, draftKey, !!draft]);

    useEffect(() => {
        if (!opened || !loaded || !draft) {
            return;
        }

        localStorage.setItem(draftKey, JSON.stringify(draft));
    }, [opened, loaded, draft, draftKey]);

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
    // API loading
    // ------------------------------------------------------------------------------------------------------------------------

    function loadEditorData() {
        setLoaded(false);
        setSaving(false);
        setMessage('');
        setDraftRecovered(false);
        setActiveValidationIssueIds([]);

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

    function discardAndClose() {
        setExitModalOpen(false);
        clearSavedDraft();
        onClose();
    }

    function handleClose() {
        if (!hasUnsavedChanges) {
            discardAndClose();
            return;
        }

        setExitModalOpen(true);
    }

    function saveWorkout() {
        setMessage('');

        if (validationIssues.length > 0) {
            setActiveValidationIssueIds(
                validationIssues.map(issue => issue.id)
            );
            return;
        }

        setActiveValidationIssueIds([]);

        setSaving(true);

        const payload = buildTemplatePayload(draft, trainerId);

        const request = isEditing
            ? updateWorkoutTemplate(templateId, payload)
            : createWorkoutTemplate(payload);

        request
            .then(savedTemplate => {
                const savedDraft = normalizeTemplateForDraft(
                    savedTemplate,
                    trainerId,
                );

                clearSavedDraft();
                setDraft(savedDraft);
                setSavedSnapshot(createSnapshot(savedDraft));
                setDraftRecovered(false);
                setActiveValidationIssueIds([]);

                onSaved?.(savedTemplate);
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
        setExitModalOpen(false);
        setMessage('');
        setSavedSnapshot('');
        setDraftRecovered(false);
        setActiveValidationIssueIds([]);
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderEditorContent() {
        return (
            <Stack gap="md" pos="relative">
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
                        <Paper withBorder radius="md" p="md" bg={computedColorScheme === 'light' ? "var(--color-background)" : "var(--color-surface)"}>
                            <Stack gap="sm">
                                <Group justify="space-between" align="center" wrap="nowrap">
                                    <TextInput
                                        classNames={{ input: 'subtleInput' }}
                                        variant="filled"
                                        ref={inputRef}
                                        size="lg"
                                        placeholder="Name your workout"
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
                                            }
                                        }}
                                    />
                                    <Menu withinPortal position="bottom-end">
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
                                            <Menu.Item color="red" leftSection={<IconTrash size={14}/>} onClick={() => console.log('TODO - archive this workout')} disabled={!isEditing}>
                                                Archive workout
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>
                                <Textarea
                                    label={
                                        <Text size="xs" c="dimmed" fw={600} pl={10}>
                                            DESCRIPTION
                                        </Text>
                                    }
                                    pl={10}
                                    classNames={{ input: 'subtleInput' }}
                                    variant="unstyled"
                                    placeholder="Add a description"
                                    value={draft.description || ''}
                                    onChange={event => updateDraftField('description', event.currentTarget.value)}
                                    autosize
                                />

                                <TextInput
                                    label={
                                        <Text size="xs" c="dimmed" fw={600} pl={10}>
                                            COVER IMAGE URL
                                        </Text>
                                    }
                                    pl={10}
                                    classNames={{ input: 'subtleInput' }}
                                    variant="unstyled"
                                    placeholder="Add an image URL"
                                    value={draft.coverImageUrl || ''}
                                    onChange={event => updateDraftField('coverImageUrl', event.currentTarget.value)}
                                />

                                {workoutEquipment.length > 0 && (
                                    <Stack gap="sm">
                                        <Text size="xs" c="dimmed" fw={600} pl={20} pt={5}>
                                            EQUIPMENT
                                        </Text>
                                        <Group gap="xs" pl={20}>
                                            {workoutEquipment.map(equipment => (
                                                <Badge
                                                    key={equipment}
                                                    bg="var(--color-surface)"
                                                    radius="sm"
                                                    leftSection={<IconDumbbell size={14} color={computedColorScheme === 'light' ? "black" : "gray"}/>}
                                                    styles={{
                                                        root: {
                                                            borderColor: computedColorScheme === 'light' ? "black" : "gray",
                                                        },
                                                        label: {
                                                            color: computedColorScheme === 'light' ? "black" : "gray",
                                                        }
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

                        <WorkoutBuilder
                            draft={draft}
                            exercises={exercises}
                            validationIssues={activeValidationIssues}
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
                <Stack gap="xs">
                    {showValidation && (
                        <Alert
                            color="red"
                            variant="light"
                            icon={<IconAlertCircle size={16} />}
                            p="xs"
                        >
                            {isMobile
                                ? `${activeValidationIssues.length} issue${activeValidationIssues.length === 1 ? ' needs' : 's need'} attention.`
                                : `${activeValidationIssues.length} issue${activeValidationIssues.length === 1 ? ' needs' : 's need'} attention before saving.`}
                        </Alert>
                    )}

                    <Group justify={editorStatus ? 'space-between' : 'flex-end'} wrap="nowrap">
                        {editorStatus && (
                            <Group gap={editorStatus.icon ? 4 : 8} wrap="nowrap">
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

                        <Group wrap="nowrap">
                            <Button
                                variant="default"
                                size={isMobile ? 'xs' : 'sm'}
                                leftSection={<IconX size={16}/>}
                                onClick={handleClose}
                            >
                                Close
                            </Button>

                            <Button
                                size={isMobile ? 'xs' : 'sm'}
                                leftSection={<IconDeviceFloppy size={16}/>}
                                onClick={saveWorkout}
                                loading={saving}
                                disabled={
                                    !loaded ||
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
                title={isEditing ? 'Discard unsaved changes?' : 'Discard this workout draft?'}
                centered
                zIndex='var(--mantine-z-index-popover)'
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

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------
    return (
        <>
            {renderExitModal()}

            {isMobile ? (
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

                        <LoadingOverlay visible={!loaded} overlayProps={{blur: 2}}/>

                        <Drawer.Header
                            style={{
                                flexShrink: 0,
                                borderBottom: '1px solid var(--color-border)',
                                backgroundColor: computedColorScheme === 'dark'
                                    ? 'var(--color-surface)'
                                    : 'var(--color-background)',
                            }}
                        >
                            <Drawer.Title style={{ flex: 1, minWidth: 0 }}>
                                <Group gap="0.5rem" wrap="nowrap" style={{ minWidth: 0 }}>
                                    <IconHammer size={22} style={{ flexShrink: 0 }} />
                                    <Text size="1.5rem" fw={600} truncate="end" style={{ flex: 1, minWidth: 0 }}>
                                        {title}
                                    </Text>
                                </Group>
                            </Drawer.Title>

                            <Drawer.CloseButton style={{ flexShrink: 0 }} />
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
                        <LoadingOverlay visible={!loaded} overlayProps={{blur: 2}}/>

                        <Modal.Header
                            style={{
                                flexShrink: 0,
                                borderBottom: '1px solid var(--color-border)',
                                backgroundColor: computedColorScheme === 'dark'
                                    ? 'var(--color-surface)'
                                    : 'var(--color-background)',
                            }}
                        >
                            <Modal.Title style={{ flex: 1, minWidth: 0 }}>
                                <Group gap="0.5rem" wrap="nowrap" style={{ minWidth: 0 }}>
                                    <IconHammer size={22} style={{ flexShrink: 0 }} />
                                    <Text size="1.5rem" fw={600} truncate="end" style={{ flex: 1, minWidth: 0 }}>
                                        {title}
                                    </Text>
                                </Group>
                            </Modal.Title>

                            <Modal.CloseButton style={{ flexShrink: 0 }} />
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

export default WorkoutEditorModal;