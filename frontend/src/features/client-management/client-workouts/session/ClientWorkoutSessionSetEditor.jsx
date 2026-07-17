import {useEffect, useRef, useState} from 'react';
import {
    Alert,
    Button,
    Group,
    NumberInput,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    TextInput,
} from '@mantine/core';
import {IconCheck, IconEdit} from '@tabler/icons-react';

import DurationInput from '../../../../components/input/DurationInput.jsx';
import {
    TRACKING_FIELD_DEFINITIONS,
    TRACKING_FIELD_KEY,
    TRACKING_FIELD_TYPE,
} from '../../../exercises/exercise-tracking-fields.js';
import {getExerciseUnitLabel} from '../../../exercises/exercise-units.js';
import {formatDurationSeconds} from '../../../../utils/time-utils.js';

import {apiSaveClientWorkoutSetResult} from '../client-workout-api.js';

const AUTOSAVE_DELAY = 700;

function ClientWorkoutSessionSetEditor({workoutId, clientWorkoutItemId = null, clientWorkoutItemExerciseId = null, config, set, result, completeLabel, onResultSaved, onCompleted}) {

    const completed = Boolean(result?.completedAt);

    const [values, setValues] = useState(() => createInitialValues(config, result));
    const [notes, setNotes] = useState(result?.notes ?? '');
    const [editing, setEditing] = useState(!completed);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [saveError, setSaveError] = useState('');
    const [completing, setCompleting] = useState(false);

    const valuesRef = useRef(values);
    const notesRef = useRef(notes);
    const completedRef = useRef(completed);
    const revisionRef = useRef(0);
    const saveTimerRef = useRef(null);
    const saveQueueRef = useRef(Promise.resolve());

    const identity = {
        clientWorkoutItemId,
        clientWorkoutItemExerciseId,
        setKey: set.setKey,
    };

    const inputFields = config.trackingFields.filter(field => field.key !== TRACKING_FIELD_KEY.NOTES);
    const instruction = getSetInstruction(config, set);

    useEffect(() => {
        return () => clearTimeout(saveTimerRef.current);
    }, []);

    function updateValue(side, fieldKey, nextValue) {
        const nextSideValues = {...valuesRef.current[side]};

        if (nextValue === '' || nextValue === null || nextValue === undefined) {
            delete nextSideValues[fieldKey];
        } else {
            nextSideValues[fieldKey] = nextValue;
        }

        const nextValues = {
            ...valuesRef.current,
            [side]: nextSideValues,
        };

        valuesRef.current = nextValues;
        setValues(nextValues);
        scheduleAutosave();
    }

    function updateNotes(nextNotes) {
        notesRef.current = nextNotes;
        setNotes(nextNotes);
        scheduleAutosave();
    }

    function scheduleAutosave() {
        revisionRef.current += 1;
        setSaveStatus('dirty');
        setSaveError('');

        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            queueSave(completedRef.current);
        }, AUTOSAVE_DELAY);
    }

    function queueSave(nextCompleted = completedRef.current) {
        clearTimeout(saveTimerRef.current);

        const revision = revisionRef.current;
        const payload = {
            ...identity,
            valuesJson: JSON.stringify(normalizeResultValues(valuesRef.current)),
            notes: notesRef.current,
            completed: nextCompleted,
        };

        setSaveStatus('saving');
        setSaveError('');

        const request = saveQueueRef.current
            .catch(() => null)
            .then(() => apiSaveClientWorkoutSetResult(workoutId, payload));

        saveQueueRef.current = request.catch(() => null);

        return request
            .then(savedResult => {
                completedRef.current = Boolean(savedResult?.completedAt);
                onResultSaved(savedResult, identity);

                if (revision === revisionRef.current) {
                    setSaveStatus('saved');
                }

                return savedResult;
            })
            .catch(error => {
                console.error('Failed to save workout set result:', error);
                setSaveStatus('error');
                setSaveError(error.message || 'Failed to save this set.');
                throw error;
            });
    }

    function handleBlur() {
        if (saveStatus === 'dirty') {
            queueSave(completedRef.current);
        }
    }

    async function handleComplete() {
        setCompleting(true);

        try {
            await queueSave(true);
            completedRef.current = true;
            setEditing(false);
            onCompleted?.();
        } finally {
            setCompleting(false);
        }
    }

    async function handleSaveChanges() {
        setCompleting(true);

        try {
            await queueSave(true);
            setEditing(false);
        } finally {
            setCompleting(false);
        }
    }

    if (completed && !editing) {
        return (
            <Stack gap="sm">
                <SessionResultSummary config={config} values={values}/>

                {notes.trim() && (
                    <Text size="sm" c="dimmed" style={{whiteSpace: 'pre-wrap'}}>
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
        <Stack gap="md" onBlurCapture={handleBlur}>
            {instruction && (
                <Text size="sm" c="dimmed" fs="italic" style={{whiteSpace: 'pre-wrap'}}>
                    {instruction}
                </Text>
            )}

            {config.eachSide
                ? (
                    <Stack gap="lg">
                        <ResultInputGroup
                            label="Left"
                            side="left"
                            fields={inputFields}
                            set={set}
                            values={values.left}
                            onChange={updateValue}
                        />

                        <ResultInputGroup
                            label="Right"
                            side="right"
                            fields={inputFields}
                            set={set}
                            values={values.right}
                            onChange={updateValue}
                        />
                    </Stack>
                )
                : (
                    <ResultInputGroup
                        side="default"
                        fields={inputFields}
                        set={set}
                        values={values.default}
                        onChange={updateValue}
                    />
                )}

            <Textarea
                label="Trainer note"
                placeholder="Optional note..."
                value={notes}
                minRows={2}
                autosize
                onChange={event => updateNotes(event.currentTarget.value)}
            />

            {saveError && <Alert color="red">{saveError}</Alert>}

            <Group justify="space-between" align="center">
                <SaveStatus status={saveStatus}/>

                {completed
                    ? (
                        <Button loading={completing} onClick={handleSaveChanges}>
                            Save Changes
                        </Button>
                    )
                    : (
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

function ResultInputGroup({label, side, fields, set, values = {}, onChange}) {
    return (
        <Stack gap="xs">
            {label && <Text fw={700}>{label}</Text>}

            {fields.length
                ? (
                    <SimpleGrid cols={{base: 2, sm: 2}} spacing="sm">
                        {fields.map(field => (
                            <SessionResultInput
                                key={field.key}
                                field={field}
                                target={set.targets?.[field.key]}
                                value={values[field.key] ?? ''}
                                onChange={nextValue => onChange(side, field.key, nextValue)}
                            />
                        ))}
                    </SimpleGrid>
                )
                : <Text size="sm" c="dimmed">No result fields configured.</Text>}
        </Stack>
    );
}

function SessionResultInput({field, target, value, onChange}) {
    const definition = TRACKING_FIELD_DEFINITIONS[field.key];
    const activeMode = definition?.modes?.find(mode => mode.value === field.mode) ?? definition?.modes?.[0];
    const type = activeMode?.type ?? definition?.type;
    const targetLabel = formatTarget(field, target, type);
    const unit = getExerciseUnitLabel(field.unit ?? activeMode?.unit ?? definition?.unit);
    const label = definition?.label ?? field.key;
    const description = `Target: ${targetLabel}`;

    if (field.key === TRACKING_FIELD_KEY.TIME || field.key === TRACKING_FIELD_KEY.REST) {
        return (
            <DurationInput
                label={label}
                description={description}
                value={value}
                onChange={onChange}
            />
        );
    }

    if (type === TRACKING_FIELD_TYPE.TEXT) {
        return (
            <TextInput
                label={label}
                description={description}
                value={value}
                placeholder={getTargetPlaceholder(target, type)}
                onChange={event => onChange(event.currentTarget.value)}
            />
        );
    }

    const integer = field.key === TRACKING_FIELD_KEY.REPS;

    return (
        <NumberInput
            label={label}
            description={description}
            value={value}
            placeholder={getTargetPlaceholder(target, type)}
            suffix={unit ? ` ${unit}` : undefined}
            decimalScale={integer ? 0 : 2}
            allowDecimal={!integer}
            hideControls
            min={0}
            max={field.key === TRACKING_FIELD_KEY.RPE ? 10 : undefined}
            onChange={onChange}
        />
    );
}

function SessionResultSummary({config, values}) {
    const groups = config.eachSide
        ? [['Left', values.left], ['Right', values.right]]
        : [['', values.default]];

    const summaries = groups
        .map(([label, sideValues]) => ({
            label,
            text: formatResultValues(config.trackingFields, sideValues),
        }))
        .filter(summary => summary.text);

    if (!summaries.length) {
        return <Text size="sm" c="dimmed">No result values entered.</Text>;
    }

    return (
        <Stack gap={2}>
            {summaries.map(summary => (
                <Text key={summary.label || 'default'} size="sm">
                    {summary.label && <Text component="span" fw={700}>{summary.label}: </Text>}
                    {summary.text}
                </Text>
            ))}
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

function createInitialValues(config, result) {
    if (config.eachSide) {
        return {
            left: {...(result?.values?.left ?? {})},
            right: {...(result?.values?.right ?? {})},
        };
    }

    return {
        default: {...(result?.values?.default ?? {})},
    };
}

function normalizeResultValues(values) {
    return Object.fromEntries(
        Object.entries(values)
            .map(([side, sideValues]) => [
                side,
                Object.fromEntries(
                    Object.entries(sideValues).filter(([, value]) =>
                        value !== '' && value !== null && value !== undefined
                    ),
                ),
            ])
            .filter(([, sideValues]) => Object.keys(sideValues).length),
    );
}

function getSetInstruction(config, set) {
    const notesField = config.trackingFields.find(field => field.key === TRACKING_FIELD_KEY.NOTES);

    if (!notesField) {
        return '';
    }

    return String(set.targets?.[TRACKING_FIELD_KEY.NOTES] ?? '').trim();
}

function formatTarget(field, value, type) {
    if (value === '' || value === null || value === undefined) {
        return '—';
    }

    if (type === TRACKING_FIELD_TYPE.RANGE) {
        return `${value.min ?? '—'}–${value.max ?? '—'}`;
    }

    if (field.key === TRACKING_FIELD_KEY.TIME || field.key === TRACKING_FIELD_KEY.REST) {
        return formatDurationSeconds(value) ?? '—';
    }

    if (type === TRACKING_FIELD_TYPE.BENCHMARK_PERCENT) {
        return `${value}% 1RM`;
    }

    const definition = TRACKING_FIELD_DEFINITIONS[field.key];
    const activeMode = definition?.modes?.find(mode => mode.value === field.mode) ?? definition?.modes?.[0];
    const unit = getExerciseUnitLabel(field.unit ?? activeMode?.unit ?? definition?.unit);

    return unit ? `${value} ${unit}` : String(value);
}

function getTargetPlaceholder(value, type) {
    if (value === '' || value === null || value === undefined) {
        return '—';
    }

    if (type === TRACKING_FIELD_TYPE.RANGE) {
        return `${value.min ?? '—'}–${value.max ?? '—'}`;
    }

    if (type === TRACKING_FIELD_TYPE.BENCHMARK_PERCENT) {
        return '—';
    }

    return String(value);
}

function formatResultValues(trackingFields, values) {
    if (!values) {
        return '';
    }

    return trackingFields
        .filter(field =>
            field.key !== TRACKING_FIELD_KEY.NOTES
            && values[field.key] !== ''
            && values[field.key] !== null
            && values[field.key] !== undefined
        )
        .map(field => {
            const definition = TRACKING_FIELD_DEFINITIONS[field.key];
            const activeMode = definition?.modes?.find(mode => mode.value === field.mode) ?? definition?.modes?.[0];
            const value = field.key === TRACKING_FIELD_KEY.TIME || field.key === TRACKING_FIELD_KEY.REST
                ? formatDurationSeconds(values[field.key]) ?? values[field.key]
                : values[field.key];
            const unit = getExerciseUnitLabel(field.unit ?? activeMode?.unit ?? definition?.unit);

            return `${definition?.label ?? field.key}: ${value}${unit ? ` ${unit}` : ''}`;
        })
        .join(' · ');
}

export default ClientWorkoutSessionSetEditor;