import {useEffect, useRef, useState} from 'react';
import {
    Button,
    Group,
    Paper,
    Text,
    ThemeIcon,
} from '@mantine/core';
import {IconClock} from '@tabler/icons-react';

function ClientWorkoutSessionRestTimer({durationSeconds, startedAt, onFinished}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const duration = normalizeDuration(durationSeconds);

    const [remainingSeconds, setRemainingSeconds] = useState(duration);

    const finishedRef = useRef(false);
    const onFinishedRef = useRef(onFinished);
    const rowRef = useRef(null);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        onFinishedRef.current = onFinished;
    }, [onFinished]);

    useEffect(() => {
        finishedRef.current = false;

        const countdownStartedAt = startedAt ?? window.performance.now();
        const deadline = countdownStartedAt + duration * 1000;

        function getRemainingSeconds() {
            return Math.max(0, Math.ceil((deadline - window.performance.now()) / 1000));
        }

        setRemainingSeconds(getRemainingSeconds());

        const focusFrame = window.requestAnimationFrame(() => {
            rowRef.current?.focus({preventScroll: true});
            rowRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        });

        function updateCountdown() {
            const remaining = getRemainingSeconds();

            setRemainingSeconds(remaining);

            if (remaining === 0) {
                finish();
            }
        }

        updateCountdown();

        const intervalId = window.setInterval(updateCountdown, 250);

        return () => {
            window.cancelAnimationFrame(focusFrame);
            window.clearInterval(intervalId);
        };
    }, [duration, startedAt]);

    function finish() {
        if (finishedRef.current) {
            return;
        }

        finishedRef.current = true;
        onFinishedRef.current?.();
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Paper
            ref={rowRef}
            className="workout-rest-timer"
            tabIndex={-1}
            role="timer"
            aria-label={`Rest timer, ${formatCountdown(remainingSeconds)} remaining`}
            withBorder
            radius="md"
            px="md"
            py="sm"
            style={{
                borderLeft: '3px solid var(--mantine-color-blue-6)',
                borderTopColor: 'var(--color-border)',
                borderRightColor: 'var(--color-border)',
                borderBottomColor: 'var(--color-border)',
            }}
        >
            <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                    <ThemeIcon
                        color="blue"
                        size={24}
                        radius="xl"
                    >
                        <IconClock size={18}/>
                    </ThemeIcon>

                    <Group gap="xs" wrap="nowrap">
                        <Text fw={700}>Rest</Text>

                        <Text c="dimmed">
                            —
                        </Text>

                        <Text
                            fw={700}
                            c="blue"
                            style={{
                                minWidth: '3.25rem',
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            {formatCountdown(remainingSeconds)}
                        </Text>
                    </Group>
                </Group>

                <Button
                    type="button"
                    variant="subtle"
                    size="compact-sm"
                    aria-label="Skip rest"
                    onClick={finish}
                >
                    Skip
                </Button>
            </Group>
        </Paper>
    );
}

// ------------------------------------------------------------------------------------------------------------------------
// Utils
// ------------------------------------------------------------------------------------------------------------------------

function normalizeDuration(value) {
    const seconds = Number(value);

    return Number.isFinite(seconds) && seconds > 0
        ? Math.floor(seconds)
        : 0;
}

function formatCountdown(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default ClientWorkoutSessionRestTimer;