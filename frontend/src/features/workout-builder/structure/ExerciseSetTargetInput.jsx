import {
    Group,
    NumberInput,
    Stack,
    Text,
    Textarea,
    TextInput,
    Tooltip,
} from '@mantine/core';
import {
    IconAlertTriangle,
} from '@tabler/icons-react';

import DurationInput from '../../../components/input/DurationInput';

import {TRACKING_FIELD_DEFINITIONS, TRACKING_FIELD_TYPE} from '../../exercises/exercise-tracking-fields';

import {getExerciseUnitLabel} from '../../exercises/exercise-units.js';

import {
    getBenchmarkTargetResolutionMessage,
    resolveExerciseBenchmarkPercentageTarget,
} from '../../client-management/benchmarks/exercise-benchmark-resolution.js';

import {useWorkoutBenchmarks} from '../workout-benchmark-context.js';

// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

function formatResolvedBenchmarkValue(value, unit) {
    const formattedValue = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
    }).format(value);

    const unitLabel = getExerciseUnitLabel(unit);

    return unitLabel
        ? `${formattedValue} ${unitLabel}`
        : formattedValue;
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

function ExerciseSetTargetInput({exerciseId, field, value, locked, onChange}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const definition = TRACKING_FIELD_DEFINITIONS[field.key];

    const activeMode = definition.modes?.find(
        mode => mode.value === field.mode
    ) ?? definition.modes?.[0];

    const type = activeMode?.type ?? definition.type;

    const {
        enabled: benchmarkResolutionEnabled,
        benchmarks,
    } = useWorkoutBenchmarks();

    const inputWidth =
        activeMode?.inputWidth
        ?? definition.inputWidth
        ?? '5rem';

    const inputStyle = {
        width: inputWidth,
        marginInline: 'auto',
    };

    const hasTargetValue = value !== null && value !== undefined && value !== '';

    const benchmarkResolution =
        type === TRACKING_FIELD_TYPE.BENCHMARK_PERCENT
        && benchmarkResolutionEnabled
        && exerciseId
        && activeMode?.benchmarkType
        && hasTargetValue
            ? resolveExerciseBenchmarkPercentageTarget({
                benchmarks,
                exerciseId,
                benchmarkType: activeMode.benchmarkType,
                percentage: value,
                targetUnit: field.unit
                    ?? activeMode.unit
                    ?? definition.unit
                    ?? null,
            })
            : null;

    // ------------------------------------------------------------------------------------------------------------------------
    // Utility
    // ------------------------------------------------------------------------------------------------------------------------

    function isEmptyRange(value) {
        return value?.min === null || value?.min === undefined
            ? value?.max === null || value?.max === undefined
            : false;
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Return integer input
    // ------------------------------------------------------------------------------------------------------------------------

    if (type === TRACKING_FIELD_TYPE.INTEGER) {
        return (
            <NumberInput
                readOnly={locked}
                classNames={{input: 'subtle-input'}}
                variant="unstyled"
                value={value ?? ''}
                onChange={onChange}
                placeholder="—"
                decimalScale={0}
                allowDecimal={false}
                hideControls
                min={0}
                style={inputStyle}
                styles={{
                    input: {
                        textAlign: 'center',
                        cursor: locked ? 'default' : undefined,
                    },
                }}
            />
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Return decimal input
    // ------------------------------------------------------------------------------------------------------------------------

    if (type === TRACKING_FIELD_TYPE.DECIMAL) {
        return (
            <NumberInput
                readOnly={locked}
                classNames={{input: 'subtle-input'}}
                variant="unstyled"
                value={value ?? ''}
                onChange={onChange}
                placeholder="—"
                decimalScale={2}
                hideControls
                min={0}
                style={inputStyle}
                styles={{
                    input: {
                        textAlign: 'center',
                        cursor: locked ? 'default' : undefined,
                    },
                }}
            />
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Return benchmark percentage input
    // ------------------------------------------------------------------------------------------------------------------------

    if (type === TRACKING_FIELD_TYPE.BENCHMARK_PERCENT) {
        const resolutionMessage =
            benchmarkResolution
            && !benchmarkResolution.resolved
                ? getBenchmarkTargetResolutionMessage(
                    benchmarkResolution,
                    activeMode?.benchmarkType,
                )
                : null;

        return (
            <Stack gap={2} align="center">
                <NumberInput
                    readOnly={locked}
                    classNames={{input: 'subtle-input'}}
                    variant="unstyled"
                    value={value ?? ''}
                    onChange={onChange}
                    placeholder="—%"
                    suffix="%"
                    decimalScale={2}
                    hideControls
                    min={0}
                    style={inputStyle}
                    styles={{
                        input: {
                            textAlign: 'center',
                            cursor: locked ? 'default' : undefined,
                        },
                    }}
                />

                {benchmarkResolution?.resolved && (
                    <Text
                        size="xs"
                        c="dimmed"
                        fw={600}
                        lh={1.1}
                        style={{whiteSpace: 'nowrap'}}
                    >
                        {formatResolvedBenchmarkValue(
                            benchmarkResolution.resolvedValue,
                            benchmarkResolution.resolvedUnit,
                        )}
                    </Text>
                )}

                {resolutionMessage && (
                    <Tooltip
                        label={resolutionMessage}
                        position="bottom"
                        withArrow
                        arrowSize={12}
                        multiline
                        events={{ hover: true, focus: false, touch: true }}
                    >
                        <Group
                            gap={3}
                            wrap="nowrap"
                            c="yellow"
                            style={{cursor: 'help'}}
                        >
                            <IconAlertTriangle
                                size={13}
                                style={{flexShrink: 0}}
                            />

                            <Text
                                size="xs"
                                c="yellow"
                                fw={600}
                                lh={1.1}
                                style={{whiteSpace: 'nowrap'}}
                            >
                                Missing benchmark
                            </Text>
                        </Group>
                    </Tooltip>
                )}
            </Stack>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Return range input
    // ------------------------------------------------------------------------------------------------------------------------

    if (type === TRACKING_FIELD_TYPE.RANGE) {
        const rangeValue = value ?? {};

        function updateRange(key, nextValue) {
            const nextRange = {
                ...rangeValue,
                [key]: nextValue === '' ? undefined : nextValue,
            };

            onChange(
                isEmptyRange(nextRange)
                    ? null
                    : nextRange
            );
        }

        return (
            <Group gap={0} wrap="nowrap" justify="center"
                style={{
                    marginInline: 'auto',
                    paddingInline: 0,
                }}
            >
                <NumberInput
                    readOnly={locked}
                    classNames={{input: 'subtle-input'}}
                    variant="unstyled"
                    value={rangeValue.min ?? ''}
                    onChange={nextValue => updateRange('min', nextValue)}
                    placeholder="—"
                    allowDecimal={false}
                    hideControls
                    min={0}
                    style={{width: inputWidth}}
                    styles={{
                        input: {
                            textAlign: 'right',
                            cursor: locked ? 'default' : undefined,
                        },
                    }}
                />

                <Text size="sm" c="dimmed" styles={{root: {cursor: 'default'}}}>
                    –
                </Text>

                <NumberInput
                    readOnly={locked}
                    classNames={{input: 'subtle-input'}}
                    variant="unstyled"
                    value={rangeValue.max ?? ''}
                    onChange={nextValue => updateRange('max', nextValue)}
                    placeholder="—"
                    allowDecimal={false}
                    hideControls
                    min={0}
                    style={{width: inputWidth}}
                    styles={{
                        input: {
                            textAlign: 'left',
                            cursor: locked ? 'default' : undefined,
                        },
                    }}
                />
            </Group>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Return time input
    // ------------------------------------------------------------------------------------------------------------------------

    if (type === TRACKING_FIELD_TYPE.TIME) {
        return (
            <DurationInput
                value={value}
                locked={locked}
                variant='subtle'
                width={inputWidth}
                onChange={onChange}
            />
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Return text input
    // ------------------------------------------------------------------------------------------------------------------------

    if (type === TRACKING_FIELD_TYPE.TEXT) {
        return (
            <TextInput
                readOnly={locked}
                classNames={{input: 'subtle-input'}}
                variant="unstyled"
                value={value ?? ''}
                onChange={event => onChange(event.currentTarget.value)}
                placeholder="—"
                style={inputStyle}
                styles={{
                    input: {
                        textAlign: 'center',
                        cursor: locked ? 'default' : undefined,
                    },
                }}
            />
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Return long text input
    // ------------------------------------------------------------------------------------------------------------------------

    if (type === TRACKING_FIELD_TYPE.TEXT_LONG) {
        return (
            <Textarea
                readOnly={locked}
                classNames={{input: 'subtle-input'}}
                variant="unstyled"
                value={value ?? ''}
                onChange={event => onChange(event.currentTarget.value)}
                placeholder="—"
                autosize
                maxRows={2}
                style={inputStyle}
                styles={{
                    input: {
                        textAlign: 'center',
                        cursor: locked ? 'default' : undefined,
                    },
                }}
            />
        );
    }

    return null;
}

export default ExerciseSetTargetInput;