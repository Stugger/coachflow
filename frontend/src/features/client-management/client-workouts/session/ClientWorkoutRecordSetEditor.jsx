import {useState} from 'react';
import {
    Alert,
    Button,
    Checkbox,
    Group,
    Stack,
    Text,
} from '@mantine/core';
import {IconEdit} from '@tabler/icons-react';

import ClientWorkoutSetResultFields from './ClientWorkoutSetResultFields.jsx';
import ClientWorkoutSessionResultSummary from './ClientWorkoutSessionResultSummary.jsx';

import {
    getSetInstruction,
} from './client-workout-set-result-utils.js';

import useClientWorkoutRecordSetResultDraft from './useClientWorkoutRecordSetResultDraft.js';

function ClientWorkoutRecordSetEditor({workoutId, clientWorkoutItemId = null, clientWorkoutItemExerciseId = null, exerciseId, benchmarks, config, set, result, colorScheme, onResultSaved}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [editing, setEditing] = useState(false);

    const instruction = getSetInstruction(config, set);

    const {
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
        updateNotes,
        updateCompleted,
        resetDraft,
        saveResult,
    } = useClientWorkoutRecordSetResultDraft({
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

    function beginEditing() {
        resetDraft();
        setEditing(true);
    }

    function cancelEditing() {
        resetDraft();
        setEditing(false);
    }

    async function saveChanges() {
        const saveSucceeded = await saveResult();

        if (saveSucceeded) {
            setEditing(false);
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Summary return
    // ------------------------------------------------------------------------------------------------------------------------

    if (!editing) {
        return (
            <Stack gap="sm">
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
                        <Text component="span" fw={600}>
                            Trainer note:{' '}
                        </Text>

                        {notes}
                    </Text>
                )}

                <Button
                    variant="light"
                    w="fit-content"
                    leftSection={<IconEdit size={16}/>}
                    onClick={beginEditing}
                >
                    Edit set
                </Button>
            </Stack>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Editing return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Stack gap="md">
            <ClientWorkoutSetResultFields
                exerciseId={exerciseId}
                benchmarks={benchmarks}
                config={config}
                set={set}
                values={values}
                notes={notes}
                stackItem={clientWorkoutItemExerciseId !== null}
                separateSides={separateSides}
                recordMode
                colorScheme={colorScheme}
                onChange={updateValue}
                onSplitSides={splitSides}
                onMergeSides={mergeSides}
                onNotesChange={updateNotes}
            />

            <Checkbox
                checked={completed}
                label="Set was completed"
                disabled={saving}
                onChange={event => updateCompleted(event.currentTarget.checked)}
            />

            {saveError && (
                <Alert color="red">
                    {saveError}
                </Alert>
            )}

            <Group justify="flex-end" gap="sm">
                <Button
                    variant="default"
                    disabled={saving}
                    onClick={cancelEditing}
                >
                    Cancel
                </Button>

                <Button
                    loading={saving}
                    disabled={!dirty}
                    onClick={saveChanges}
                >
                    Save changes
                </Button>
            </Group>
        </Stack>
    );
}

export default ClientWorkoutRecordSetEditor;