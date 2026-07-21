import {useState} from 'react';
import {
    Alert,
    Button,
    Checkbox,
    Group,
    Stack,
    Text,
    Textarea,
} from '@mantine/core';
import {IconEdit} from '@tabler/icons-react';

import {
    TRACKING_FIELD_KEY,
} from '../../../exercises/exercise-tracking-fields.js';

import {
    apiSaveClientWorkoutRecordSetResult,
} from '../client-workout-api.js';

import ClientWorkoutSessionResultInputs from './ClientWorkoutSessionResultInputs.jsx';
import ClientWorkoutSessionResultSummary from './ClientWorkoutSessionResultSummary.jsx';

import {
    getSetInstruction,
    usesSeparateSideValues,
} from './client-workout-set-result-utils.js';

function ClientWorkoutRecordSetEditor({workoutId, clientWorkoutItemId = null, clientWorkoutItemExerciseId = null, exerciseId, benchmarks, config, set, result, colorScheme, onResultSaved}) {

    const [persistedDraft, setPersistedDraft] = useState(() => createRecordDraft(config, result),);

    const [values, setValues] = useState(() => cloneValues(persistedDraft.values));

    const [notes, setNotes] = useState(persistedDraft.notes);
    const [completed, setCompleted] = useState(persistedDraft.completed);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const instruction = getSetInstruction(config, set);

    const separateSides = config.eachSide && usesSeparateSideValues(values);

    const dirty = serializeDraft(values, notes, completed) !== persistedDraft.serialized;

    const identity = {
        clientWorkoutItemId,
        clientWorkoutItemExerciseId,
        setKey: set.setKey,
    };

    function applyDraft(draft) {
        setValues(cloneValues(draft.values));
        setNotes(draft.notes);
        setCompleted(draft.completed);
    }

    function beginEditing() {
        applyDraft(persistedDraft);
        setSaveError('');
        setEditing(true);
    }

    function cancelEditing() {
        applyDraft(persistedDraft);
        setSaveError('');
        setEditing(false);
    }

    function updateValue(side, fieldKey, nextValue) {
        const nextSideValues = {
            ...(values[side] ?? {}),
        };

        if (nextValue === '' || nextValue === null || nextValue === undefined) {
            delete nextSideValues[fieldKey];
        } else {
            nextSideValues[fieldKey] = nextValue;
        }

        setValues({
            ...values,
            [side]: nextSideValues,
        });
    }

    function splitSides() {
        const sharedValues = {
            ...(values.default ?? {}),
        };

        setValues({
            left: {...sharedValues},
            right: {...sharedValues},
        });
    }

    function mergeSides(sourceSide) {
        setValues({
            default: {
                ...(values[sourceSide] ?? {}),
            },
        });
    }

    async function saveChanges() {
        if (!dirty) {
            return;
        }

        setSaving(true);
        setSaveError('');

        try {
            const savedResult =
                await apiSaveClientWorkoutRecordSetResult(
                    workoutId,
                    {
                        ...identity,
                        valuesJson: JSON.stringify(normalizeResultValues(values)),
                        notes,
                        completed,
                    },
                );

            const savedDraft = createRecordDraft(
                config,
                savedResult
                    ? {
                        ...savedResult,
                        values: parseResultValues(savedResult.valuesJson),
                    }
                    : null,
            );

            setPersistedDraft(savedDraft);
            applyDraft(savedDraft);

            onResultSaved(savedResult, identity);
            setEditing(false);
        } catch (error) {
            console.error('Failed to update workout record result:', error,);
            setSaveError(error.message || 'Failed to save record changes.',);
        } finally {
            setSaving(false);
        }
    }

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

    return (
        <Stack gap="md">
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
                recordMode
                colorScheme={colorScheme}
                onChange={updateValue}
                onSplitSides={splitSides}
                onMergeSides={mergeSides}
            />

            <Textarea
                classNames={{input: 'subtle-input'}}
                variant="unstyled"
                placeholder="Optional note..."
                value={notes}
                autosize
                label={
                    <Text size="sm" fw={600} pl="0.5rem">
                        Trainer note
                    </Text>
                }
                onChange={event => setNotes(event.currentTarget.value)}
            />

            <Checkbox
                checked={completed}
                label="Set was completed"
                disabled={saving}
                onChange={event => setCompleted(event.currentTarget.checked)}
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

function createRecordDraft(config, result) {
    const values = createInitialValues(config, result);
    const notes = result?.notes ?? '';
    const completed = Boolean(result?.completedAt);

    return {
        values,
        notes,
        completed,
        serialized: serializeDraft(
            values,
            notes,
            completed,
        ),
    };
}

function createInitialValues(config, result) {
    const resultValues = result?.values ?? {};

    if (!config.eachSide) {
        return {
            default: {
                ...(resultValues.default ?? {}),
            },
        };
    }

    if (usesSeparateSideValues(resultValues)) {
        return {
            left: {
                ...(resultValues.left ?? {}),
            },
            right: {
                ...(resultValues.right ?? {}),
            },
        };
    }

    if (Object.hasOwn(resultValues, 'default')) {
        return {
            default: {
                ...resultValues.default,
            },
        };
    }

    const hasTimeField = config.trackingFields?.some(field => field.key === TRACKING_FIELD_KEY.TIME);

    return hasTimeField
        ? {
            left: {},
            right: {},
        }
        : {
            default: {},
        };
}

function serializeDraft(values, notes, completed) {
    return JSON.stringify({
        values: sortObject(
            normalizeResultValues(values),
        ),
        notes: notes.trim(),
        completed: Boolean(completed),
    });
}

function normalizeResultValues(values) {
    return Object.fromEntries(
        Object.entries(values)
            .map(([side, sideValues]) => [
                side,
                Object.fromEntries(
                    Object.entries(sideValues)
                        .filter(([, value]) =>
                            value !== ''
                            && value !== null
                            && value !== undefined
                        ),
                ),
            ])
            .filter(([, sideValues]) =>
                Object.keys(sideValues).length
            ),
    );
}

function sortObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value)
            .sort(([leftKey], [rightKey]) =>
                leftKey.localeCompare(rightKey)
            )
            .map(([key, nestedValue]) => [
                key,
                sortObject(nestedValue),
            ]),
    );
}

function cloneValues(values) {
    return Object.fromEntries(
        Object.entries(values).map(
            ([side, sideValues]) => [
                side,
                {...sideValues},
            ],
        ),
    );
}

function parseResultValues(valuesJson) {
    if (!valuesJson) {
        return {};
    }

    if (typeof valuesJson === 'object' && !Array.isArray(valuesJson)) {
        return valuesJson;
    }

    try {
        const values = JSON.parse(valuesJson);

        return values && typeof values === 'object' && !Array.isArray(values) ? values : {};
    } catch {
        return {};
    }
}

export default ClientWorkoutRecordSetEditor;