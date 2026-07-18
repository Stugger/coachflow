import {useEffect, useRef, useState} from 'react';
import {
    ActionIcon,
    Group,
} from '@mantine/core';
import {
    IconX,
    IconPlayerPause,
    IconPlayerPlay,
} from '@tabler/icons-react';

import DurationInput from '../../../../components/input/DurationInput.jsx';

function ClientWorkoutSessionStopwatch({value, width, height, buttonWidth, onChange}) {

    const [running, setRunning] = useState(false);
    const [displayValue, setDisplayValue] = useState(() => normalizeSeconds(value));

    const baseValueRef = useRef(normalizeSeconds(value) ?? 0);
    const startedAtRef = useRef(null);
    const lastReportedValueRef = useRef(normalizeSeconds(value));
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!running) {
            const nextValue = normalizeSeconds(value);

            setDisplayValue(nextValue);
            baseValueRef.current = nextValue ?? 0;
            lastReportedValueRef.current = nextValue;
        }
    }, [value, running]);

    useEffect(() => {
        if (!running) {
            return undefined;
        }

        function updateElapsedTime() {
            const nextValue = getElapsedSeconds(baseValueRef.current, startedAtRef.current);

            setDisplayValue(nextValue);

            if (nextValue !== lastReportedValueRef.current) {
                lastReportedValueRef.current = nextValue;
                onChangeRef.current(nextValue, {autosave: false});
            }
        }

        updateElapsedTime();

        const intervalId = window.setInterval(updateElapsedTime, 250);

        return () => window.clearInterval(intervalId);
    }, [running]);

    function toggleRunning(event) {
        if (running) {
            pause(event.timeStamp);
            return;
        }

        const nextBaseValue = normalizeSeconds(displayValue) ?? 0;

        baseValueRef.current = nextBaseValue;
        startedAtRef.current = event.timeStamp;
        lastReportedValueRef.current = nextBaseValue;

        setDisplayValue(nextBaseValue);
        setRunning(true);

        if (nextBaseValue === 0) {
            onChangeRef.current(0);
        }
    }

    function pause(pausedAt) {
        const nextValue = getElapsedSeconds(
            baseValueRef.current,
            startedAtRef.current,
            pausedAt,
        );

        setRunning(false);
        setDisplayValue(nextValue || null);

        baseValueRef.current = nextValue;
        startedAtRef.current = null;
        lastReportedValueRef.current = nextValue || null;

        onChangeRef.current(nextValue || null);
    }

    function clear() {
        setRunning(false);
        setDisplayValue(null);

        baseValueRef.current = 0;
        startedAtRef.current = null;
        lastReportedValueRef.current = null;

        onChangeRef.current(null);
    }

    function handleManualChange(nextValue) {
        const normalizedValue = normalizeSeconds(nextValue);

        setDisplayValue(normalizedValue);

        baseValueRef.current = normalizedValue ?? 0;
        lastReportedValueRef.current = normalizedValue;

        onChangeRef.current(normalizedValue);
    }

    return (
        <Group gap={0} wrap="nowrap" w="100%" style={{minWidth: 0}}>
            <ActionIcon
                type="button"
                variant={running ? 'filled' : 'default'}
                color={running ? 'green' : undefined}
                aria-label={running ? 'Pause stopwatch' : 'Start stopwatch'}
                size="2.25rem"
                style={{
                    height,
                    width: buttonWidth,
                    flexShrink: 0,
                    borderRight: 'none',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                }}
                onClick={toggleRunning}
            >
                {running
                    ? <IconPlayerPause size={20}/>
                    : <IconPlayerPlay size={20}/>}
            </ActionIcon>

            <DurationInput
                value={displayValue}
                locked={running}
                width={width}
                height={height}
                radius={0}
                marginInline={0}
                onChange={handleManualChange}
            />

            <ActionIcon
                type="button"
                variant="default"
                aria-label="Clear stopwatch"
                size="2.25rem"
                disabled={running || displayValue === null}
                style={{
                    height,
                    width: buttonWidth,
                    flexShrink: 0,
                    borderLeft: 'none',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                }}
                onClick={clear}
            >
                <IconX size={20}/>
            </ActionIcon>
        </Group>
    );
}

function normalizeSeconds(value) {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    const seconds = Number(value);

    if (!Number.isFinite(seconds) || seconds < 0) {
        return null;
    }

    return Math.floor(seconds);
}

function getElapsedSeconds(baseValue, startedAt, currentTime = getCurrentTime()) {
    if (!startedAt) {
        return baseValue;
    }

    return baseValue + Math.floor((currentTime - startedAt) / 1000);
}

function getCurrentTime() {
    return window.performance.now();
}

export default ClientWorkoutSessionStopwatch;