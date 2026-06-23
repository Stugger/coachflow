import {
    Group,
    NumberInput,
    Text,
    Textarea,
    TextInput,
} from '@mantine/core';

import TimeTargetInput from './TimeTargetInput';

import {TRACKING_FIELD_TYPE} from './workout-builder-constants';
import {TRACKING_FIELD_DEFINITIONS} from './workout-tracking-fields';

function ExerciseSetTargetInput({field, value, disabled, onChange}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const definition = TRACKING_FIELD_DEFINITIONS[field.key];

    const activeMode = definition.modes?.find(
        mode => mode.value === field.mode
    ) ?? definition.modes?.[0];

    const type = activeMode?.type ?? definition.type;

    const inputWidth =
        activeMode?.inputWidth
        ?? definition.inputWidth
        ?? '5rem';

    const inputStyle = {
        width: inputWidth,
        marginInline: 'auto',
    };

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
                disabled={disabled}
                classNames={{input: 'subtleInput'}}
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
                disabled={disabled}
                classNames={{input: 'subtleInput'}}
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
                    },
                }}
            />
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
                    disabled={disabled}
                    classNames={{input: 'subtleInput'}}
                    value={rangeValue.min ?? ''}
                    onChange={nextValue => updateRange('min', nextValue)}
                    placeholder="—"
                    allowDecimal={false}
                    hideControls
                    min={0}
                    style={{width: inputWidth}}
                    styles={{input: {textAlign: 'right'}}}
                />

                <Text size="sm" c="dimmed">
                    –
                </Text>

                <NumberInput
                    disabled={disabled}
                    classNames={{input: 'subtleInput'}}
                    value={rangeValue.max ?? ''}
                    onChange={nextValue => updateRange('max', nextValue)}
                    placeholder="—"
                    allowDecimal={false}
                    hideControls
                    min={0}
                    style={{width: inputWidth}}
                    styles={{input: {textAlign: 'left'}}}
                />
            </Group>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Return time input
    // ------------------------------------------------------------------------------------------------------------------------

    if (type === TRACKING_FIELD_TYPE.TIME) {
        return (
            <TimeTargetInput
                value={value}
                disabled={disabled}
                onChange={onChange}
                inputWidth={inputWidth}
            />
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Return text input
    // ------------------------------------------------------------------------------------------------------------------------

    if (type === TRACKING_FIELD_TYPE.TEXT) {
        return (
            <TextInput
                disabled={disabled}
                classNames={{input: 'subtleInput'}}
                value={value ?? ''}
                onChange={event => onChange(event.currentTarget.value)}
                placeholder="—"
                style={inputStyle}
                styles={{
                    input: {
                        textAlign: 'center',
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
                disabled={disabled}
                classNames={{input: 'subtleInput'}}
                value={value ?? ''}
                onChange={event => onChange(event.currentTarget.value)}
                placeholder="—"
                autosize
                maxRows={2}
                style={inputStyle}
                styles={{
                    input: {
                        textAlign: 'center',
                    },
                }}
            />
        );
    }

    return null;
}

export default ExerciseSetTargetInput;