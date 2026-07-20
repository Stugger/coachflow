import {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Group,
    Loader,
    Stack,
    Text,
    Textarea,
    Tooltip,
} from '@mantine/core';
import {
    IconAlertTriangle,
    IconCheck,
    IconEdit
} from '@tabler/icons-react';

import ClientWorkoutSessionResultInputs from './ClientWorkoutSessionResultInputs.jsx';
import ClientWorkoutSessionResultSummary from './ClientWorkoutSessionResultSummary.jsx';
import {getSetInstruction} from './client-workout-set-result-utils.js';
import useClientWorkoutSetResultDraft from './useClientWorkoutSetResultDraft.js';

function ClientWorkoutSessionSetEditor({workoutId, clientWorkoutItemId = null, exerciseId, benchmarks, clientWorkoutItemExerciseId = null, config, set, result, completeLabel, colorScheme,
                                           onResultSaved, onCompleted}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const completed = Boolean(result?.completedAt);

    const [editing, setEditing] = useState(!completed);
    const [completing, setCompleting] = useState(false);

    const instruction = getSetInstruction(config, set);

    const {
        values,
        notes,
        saveStatus,
        saveError,
        separateSides,
        updateValue,
        splitSides,
        mergeSides,
        updateNotes,
        flushAutosave,
        saveResult,
    } = useClientWorkoutSetResultDraft({
        workoutId,
        clientWorkoutItemId,
        clientWorkoutItemExerciseId,
        setKey: set.setKey,
        config,
        result,
        onResultSaved,
    });

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    async function handleComplete() {
        setCompleting(true);

        try {
            const saveSucceeded = await saveResult(true);

            if (!saveSucceeded) {
                return;
            }

            setEditing(false);
            onCompleted?.();
        } finally {
            setCompleting(false);
        }
    }

    async function handleSaveChanges() {
        setCompleting(true);

        try {
            const saveSucceeded = await saveResult(true);

            if (saveSucceeded) {
                setEditing(false);
            }
        } finally {
            setCompleting(false);
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Conditional return
    // ------------------------------------------------------------------------------------------------------------------------

    if (completed && !editing) {
        return (
            <Stack gap="sm">
                <ClientWorkoutSessionResultSummary
                    config={config}
                    values={values}
                />

                {notes.trim() && (
                    <Text
                        size="sm"
                        c="dimmed"
                        style={{whiteSpace: 'pre-wrap'}}
                    >
                        {notes}
                    </Text>
                )}

                <Button
                    variant="light"
                    w="fit-content"
                    leftSection={<IconEdit size={16}/>}
                    onClick={() => setEditing(true)}
                >
                    Edit Set
                </Button>
            </Stack>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Stack gap="md" onBlurCapture={flushAutosave}>
            {instruction && (
                <Text
                    size="sm"
                    c="dimmed"
                    fs="italic"
                    style={{whiteSpace: 'pre-wrap'}}
                >
                    {instruction}
                </Text>
            )}

            <ClientWorkoutSessionResultInputs
                exerciseId={exerciseId}
                benchmarks={benchmarks}
                config={config}
                set={set}
                values={values}
                stackItem={clientWorkoutItemExerciseId !== null}
                separateSides={separateSides}
                colorScheme={colorScheme}
                onChange={updateValue}
                onSplitSides={splitSides}
                onMergeSides={mergeSides}
            />

            <Textarea
                classNames={{input: "subtle-input"}}
                variant="unstyled"
                placeholder="Optional note..."
                value={notes}
                autosize
                label={
                    <Text size="sm" fw={600} pl="0.5rem">
                        Trainer note
                    </Text>
                }
                onChange={event =>
                    updateNotes(event.currentTarget.value)
                }
            />

            {saveError && (
                <Alert color="red">
                    {saveError}
                </Alert>
            )}

            <Group justify="space-between" align="center">
                <SaveStatus
                    status={saveStatus}
                    error={saveError}
                />

                {completed
                    ? (
                        <Button
                            loading={completing}
                            onClick={handleSaveChanges}
                        >
                            Save Changes
                        </Button>
                    ) : (
                        <Button
                            color="green"
                            loading={completing}
                            leftSection={<IconCheck size={17}/>}
                            onClick={handleComplete}
                        >
                            {completeLabel}
                        </Button>
                    )}
            </Group>
        </Stack>
    );
}

// ------------------------------------------------------------------------------------------------------------------------
// Components
// ------------------------------------------------------------------------------------------------------------------------

function SaveStatus({status, error}) {
    const syncing = status === 'dirty' || status === 'saving';

    const label = syncing
        ? 'Saving changes'
        : status === 'saved'
            ? 'Changes saved'
            : status === 'error'
                ? error || 'Failed to save changes'
                : null;

    if (!label) {
        return <div/>;
    }

    return (
        <Tooltip label={label} events={{hover: true, focus: false, touch: true}}>
            <Box
                role="status"
                aria-live="polite"
                aria-label={label}
                w="1.5rem"
                h="1.5rem"
                style={{
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                }}
            >
                {syncing ? (
                    <Loader size={15}/>
                ) : status === 'saved' ? (
                    <IconCheck
                        size={19}
                        color="var(--mantine-color-green-6)"
                    />
                ) : (
                    <IconAlertTriangle
                        size={19}
                        color="var(--mantine-color-error)"
                    />
                )}
            </Box>
        </Tooltip>
    );
}

export default ClientWorkoutSessionSetEditor;