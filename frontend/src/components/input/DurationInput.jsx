import {useEffect, useId, useState} from 'react';
import {
    Box,
    Group,
    Input,
    Text,
    TextInput,
} from '@mantine/core';

// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

function getTimeParts(value) {
    if (value === null || value === undefined || value === '') {
        return {
            minutes: '',
            seconds: '',
        };
    }

    const totalSeconds = Number(value);

    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
        return {
            minutes: '',
            seconds: '',
        };
    }

    return {
        minutes: String(Math.floor(totalSeconds / 60)).padStart(2, '0'),
        seconds: String(totalSeconds % 60).padStart(2, '0'),
    };
}

function formatTimePart(value) {
    if (value === '' || value === null || value === undefined) {
        return '';
    }

    return String(value).padStart(2, '0');
}

function sanitizeTimePart(key, value) {
    const digits = String(value)
        .replace(/\D/g, '')
        .slice(0, 2);

    if (!digits) {
        return '';
    }

    const maxValue = key === 'minutes' ? 99 : 59;

    return String(Math.min(Number(digits), maxValue));
}

function getTotalSeconds(parts) {
    if (parts.minutes === '' && parts.seconds === '') {
        return null;
    }

    return (Number(parts.minutes || 0) * 60)
        + Number(parts.seconds || 0);
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

//TODO typing from left input should move caret into right input when maxed, backspacing from second input should bring caret to end of first input when empty, left/right arrows should move between inputs when no more characters left to move between

function DurationInput({value, locked, variant = 'default', width, height = undefined, marginInline = 'auto', radius = 'md', label, description, required = false, error, onChange}) {

    const generatedId = useId();

    const minutesInputId = `${generatedId}-minutes`;
    const descriptionId = description ? `${generatedId}-description` : undefined;
    const errorId = error ? `${generatedId}-error` : undefined;

    const describedBy = [descriptionId, errorId,].filter(Boolean).join(' ') || undefined;

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [parts, setParts] = useState(() => getTimeParts(value));

    const [isEditing, setIsEditing] = useState(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (!isEditing) {
            setParts(getTimeParts(value));
        }
    }, [value, isEditing]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function updatePart(key, nextValue) {
        const nextParts = {
            ...parts,
            [key]: sanitizeTimePart(key, nextValue),
        };

        setParts(nextParts);
        onChange(getTotalSeconds(nextParts));
    }

    function handleBlur() {
        if (parts.minutes === '' && parts.seconds === '') {
            onChange(null);
            setIsEditing(false);
            return;
        }

        if (Number(parts.minutes || 0) === 0 && Number(parts.seconds || 0) === 0) {
            setParts({
                minutes: '',
                seconds: '',
            });

            onChange(null);
            setIsEditing(false);
            return;
        }

        setParts({
            minutes: formatTimePart(parts.minutes || 0),
            seconds: formatTimePart(parts.seconds || 0),
        });

        setIsEditing(false);
    }

    function handleFocus(key) {
        if (locked) {
            return;
        }

        setIsEditing(true);

        if (Number(parts[key] || 0) === 0) {
            setParts({
                ...parts,
                [key]: '',
            });
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Input.Wrapper
            label={label}
            description={description}
            required={required}
            error={error}
            labelProps={{
                htmlFor: minutesInputId,
            }}
            descriptionProps={{
                id: descriptionId,
            }}
            errorProps={{
                id: errorId,
                style: {paddingTop: '0.3rem'},
            }}
        >
            <Box
                className={variant === 'subtle' ? 'subtle-input-container' : 'duration-input'}
                data-locked={locked || undefined}
                data-error={Boolean(error) || undefined}
                role="group"
                aria-label={label || 'Duration'}
                aria-describedby={describedBy}
                style={{
                    width,
                    height,
                    marginInline,
                    paddingInline: 0,
                    borderRadius: radius,
                }}
            >
                <Group
                    gap={0}
                    wrap="nowrap"
                    justify="center"
                    style={{ marginBlock: -1 }}
                >
                    <TextInput
                        id={minutesInputId}
                        readOnly={locked}
                        value={parts.minutes}
                        onFocus={() => handleFocus('minutes')}
                        onChange={event => updatePart('minutes', event.currentTarget.value)}
                        onBlur={handleBlur}
                        placeholder="––"
                        inputMode="numeric"
                        maxLength={2}
                        aria-label="Minutes"
                        aria-describedby={describedBy}
                        aria-invalid={Boolean(error) || undefined}
                        style={{width: 'calc(50% - 0.35rem)'}}
                        styles={{
                            input: {
                                height,
                                border: 0,
                                background: 'transparent',
                                color: error ? "var(--mantine-color-error)" : undefined,
                                textAlign: 'right',
                                paddingRight: '0.2rem',
                                cursor: locked ? 'default' : undefined,
                            },
                        }}
                    />

                    <Text
                        size="sm"
                        c={error ? "var(--mantine-color-error)" : "dimmed"}
                        fw={600}
                        styles={{ root: {cursor: 'default'} }}
                    >
                        :
                    </Text>

                    <TextInput
                        readOnly={locked}
                        value={parts.seconds}
                        onFocus={() => handleFocus('seconds')}
                        onChange={event => updatePart('seconds', event.currentTarget.value)}
                        onBlur={handleBlur}
                        placeholder="00"
                        inputMode="numeric"
                        maxLength={2}
                        aria-label="Seconds"
                        aria-describedby={describedBy}
                        aria-invalid={Boolean(error) || undefined}
                        style={{width: 'calc(50% - 0.35rem)'}}
                        styles={{
                            input: {
                                height,
                                border: 0,
                                background: 'transparent',
                                color: error ? "var(--mantine-color-error)" : undefined,
                                textAlign: 'left',
                                paddingLeft: '0.2rem',
                                cursor: locked ? 'default' : undefined,
                            },
                        }}
                    />
                </Group>
            </Box>
        </Input.Wrapper>
    );
}

export default DurationInput;