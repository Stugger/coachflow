import {useEffect, useMemo, useState} from 'react';
import {
    Alert,
    Avatar,
    Button,
    Group,
    Modal,
    NumberInput,
    Paper,
    Select,
    Stack,
    Text,
    Textarea,
} from '@mantine/core';
import {DateInput, DatePickerInput} from '@mantine/dates';
import {
    IconAlertCircle,
    IconCalendar,
    IconPhoto,
} from '@tabler/icons-react';

import {
    EXERCISE_BENCHMARK_VALUE_TYPE,
    getAvailableExerciseBenchmarkDefinitions,
    getExerciseBenchmarkDefinition,
} from '../exercise-benchmark-definitions.js';

import DurationInput from "../../../../components/input/DurationInput.jsx";

import {resolveMediaUrl} from '../../../../utils/media-url-utils.js';
import {getDateKeyFromDate} from '../../../../utils/time-utils.js';

// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

function getDateOnly(dateTime) {
    return dateTime?.slice(0, 10) || getDateKeyFromDate(new Date());
}

function createInitialForm(exercise, benchmark, initialBenchmarkType) {
    const definitions = getAvailableExerciseBenchmarkDefinitions(exercise);
    const benchmarkType = benchmark?.benchmarkType
        ?? initialBenchmarkType
        ?? definitions[0]?.type
        ?? '';

    const definition = getExerciseBenchmarkDefinition(benchmarkType);

    return {
        benchmarkType,
        value: benchmark?.value ?? '',
        unit: benchmark?.unit ?? definition?.defaultUnit ?? null,
        achievedDate: getDateOnly(benchmark?.achievedAt),
        notes: benchmark?.notes ?? '',
    };
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

function ExerciseBenchmarkForm({opened, exercise, benchmark, initialBenchmarkType, onClose, onSubmit}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [form, setForm] = useState(() => (createInitialForm(exercise, benchmark, initialBenchmarkType)));
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);

    const definitions = useMemo(() => {
        const availableDefinitions = getAvailableExerciseBenchmarkDefinitions(exercise);

        if (!benchmark) {
            return availableDefinitions;
        }

        const existingDefinition = getExerciseBenchmarkDefinition(
            benchmark.benchmarkType,
        );

        if (!existingDefinition || availableDefinitions.some(item => item.type === existingDefinition.type)) {
            return availableDefinitions;
        }

        return [existingDefinition, ...availableDefinitions];
    }, [exercise, benchmark]);

    const definition = getExerciseBenchmarkDefinition(form.benchmarkType);

    const benchmarkOptions = definitions.map(item => ({
        value: item.type,
        label: item.label,
    }));

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (!opened) {
            return;
        }

        setForm(createInitialForm(exercise, benchmark, initialBenchmarkType));
        setErrors({});
        setMessage('');
        setSaving(false);
    }, [opened, exercise, benchmark, initialBenchmarkType]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function updateBenchmarkType(benchmarkType) {
        const definition = getExerciseBenchmarkDefinition(benchmarkType);

        setForm(current => ({
            ...current,
            benchmarkType,
            value: null,
            unit: definition?.defaultUnit ?? null,
        }));

        setErrors(current => ({
            ...current,
            benchmarkType: '',
            value: '',
            unit: '',
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const nextErrors = {};

        if (!form.benchmarkType) {
            nextErrors.benchmarkType = 'Select a benchmark.';
        }
        if (form.value === '' || form.value === null || Number(form.value) <= 0) {
            nextErrors.value = 'Enter a value greater than zero.';
        }
        if (definition?.units?.length > 0 && !form.unit) {
            nextErrors.unit = 'Select a unit.';
        }
        if (!form.achievedDate) {
            nextErrors.achievedAt = 'Select the date achieved.';
        }

        setErrors(nextErrors);
        setMessage('');

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setSaving(true);

        try {
            await onSubmit({
                ...(benchmark ? {} : {
                    exerciseId: exercise.id,
                    benchmarkType: form.benchmarkType,
                }),
                value: Number(form.value),
                unit: form.unit,
                achievedAt: `${form.achievedDate}T12:00:00`,
                notes: form.notes,
            });
        } catch (error) {
            console.error('Failed to save exercise benchmark:', error);
            setErrors(error.fieldErrors ?? {});
            setMessage(error.message || 'Failed to save the exercise benchmark.');
        } finally {
            setSaving(false);
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={benchmark ? 'Edit benchmark record' : 'Record benchmark'}
            centered
            size="md"
            closeOnClickOutside={!saving}
            closeOnEscape={!saving}
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <Paper withBorder radius="md" p="sm">
                        <Group wrap="nowrap">
                            <Avatar
                                src={resolveMediaUrl(exercise?.thumbnailUrl)}
                                alt={exercise?.name}
                                size={52}
                                radius="sm"
                            >
                                <IconPhoto size={20}/>
                            </Avatar>

                            <Stack gap={1} style={{minWidth: 0}}>
                                <Text fw={700} truncate="end">
                                    {exercise?.name}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    {benchmark
                                        ? 'Correct this recorded benchmark.'
                                        : 'Record a new benchmark result.'
                                    }
                                </Text>
                            </Stack>
                        </Group>
                    </Paper>

                    {message && (
                        <Alert color="red" icon={<IconAlertCircle size={16}/>}> 
                            {message}
                        </Alert>
                    )}

                    <Select
                        label="Benchmark"
                        placeholder="Select benchmark"
                        data={benchmarkOptions}
                        value={form.benchmarkType}
                        disabled={Boolean(benchmark)}
                        error={errors.benchmarkType}
                        required
                        allowDeselect={false}
                        onChange={updateBenchmarkType}
                        comboboxProps={{ offset: 2 }}
                    />

                    <Group grow align="flex-start">
                        {(definition?.valueType === EXERCISE_BENCHMARK_VALUE_TYPE.DURATION) ? (
                            <DurationInput
                                label="Value"
                                value={form.value}
                                required
                                error={errors.value}
                                onChange={value => setForm(current => ({
                                    ...current,
                                    value,
                                }))}
                            />
                        ) : (
                            <NumberInput
                                label="Value"
                                value={form.value}
                                min={0}
                                decimalScale={3}
                                hideControls
                                required
                                error={errors.value}
                                onChange={value => setForm(current => ({
                                    ...current,
                                    value,
                                }))}
                            />
                        )}

                        {definition?.units?.length > 1 && (
                            <Select
                                label="Unit"
                                data={definition.units}
                                value={form.unit}
                                required
                                allowDeselect={false}
                                error={errors.unit}
                                onChange={unit => setForm(current => ({
                                    ...current,
                                    unit,
                                }))}
                            />
                        )}
                    </Group>

                    <DateInput
                        visibleFrom="sm"
                        label="Date achieved"
                        valueFormat="MM/DD/YYYY"
                        value={form.achievedDate}
                        maxDate={new Date()}
                        required
                        error={errors.achievedAt}
                        rightSection={<IconCalendar size={18} stroke={1.8}/>}
                        onChange={value => setForm(current => ({
                            ...current,
                            achievedDate: value || '',
                        }))}
                    />

                    <DatePickerInput
                        hiddenFrom="sm"
                        label="Date achieved"
                        valueFormat="MM/DD/YYYY"
                        value={form.achievedDate || null}
                        maxDate={new Date()}
                        required
                        dropdownType="modal"
                        error={errors.achievedAt}
                        rightSection={<IconCalendar size={18} stroke={1.8}/>}
                        onChange={value => setForm(current => ({
                            ...current,
                            achievedDate: value || '',
                        }))}
                    />

                    <Textarea
                        label="Notes"
                        placeholder="Optional"
                        value={form.notes}
                        autosize
                        minRows={3}
                        maxRows={6}
                        error={errors.notes}
                        onChange={event => {
                            const notes = event.currentTarget.value;
                            setForm(current => ({
                                ...current,
                                notes,
                            }));
                        }}
                    />

                    <Group justify="flex-end">
                        <Button
                            type="button"
                            variant="default"
                            disabled={saving}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" loading={saving} disabled={!benchmark && exercise?.archived}>
                            {benchmark ? 'Save changes' : 'Record benchmark'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

export default ExerciseBenchmarkForm;
