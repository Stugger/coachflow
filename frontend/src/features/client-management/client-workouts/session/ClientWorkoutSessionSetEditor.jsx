import {useState} from 'react';
import {
    Alert,
    Button,
    Group,
    Stack,
    Text,
    Textarea,
} from '@mantine/core';
import {IconCheck, IconEdit} from '@tabler/icons-react';

import ClientWorkoutSessionResultInputs from './ClientWorkoutSessionResultInputs.jsx';
import ClientWorkoutSessionResultSummary from './ClientWorkoutSessionResultSummary.jsx';
import {getSetInstruction} from './client-workout-set-result-utils.js';
import useClientWorkoutSetResultDraft from './useClientWorkoutSetResultDraft.js';

function ClientWorkoutSessionSetEditor({workoutId, clientWorkoutItemId = null, clientWorkoutItemExerciseId = null, config, set, result, completeLabel, onResultSaved, onCompleted}) {

    const completed = Boolean(result?.completedAt);

    const [editing, setEditing] = useState(!completed);
    const [completing, setCompleting] = useState(false);

    const {
        values,
        notes,
        saveStatus,
        saveError,
        updateValue,
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

    const instruction = getSetInstruction(config, set);

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
                config={config}
                set={set}
                values={values}
                onChange={updateValue}
            />

            <Textarea
                label="Trainer note"
                placeholder="Optional note..."
                value={notes}
                minRows={2}
                autosize
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
                <SaveStatus status={saveStatus}/>

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

function SaveStatus({status}) {
    if (status === 'dirty') {
        return <Text size="xs" c="dimmed">Unsaved changes</Text>;
    }

    if (status === 'saving') {
        return <Text size="xs" c="dimmed">Saving…</Text>;
    }

    if (status === 'saved') {
        return <Text size="xs" c="green">Saved</Text>;
    }

    return <span/>;
}
export default ClientWorkoutSessionSetEditor;