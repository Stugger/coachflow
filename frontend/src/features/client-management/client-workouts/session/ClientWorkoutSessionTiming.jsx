import {useEffect, useState} from 'react';
import {
    Alert,
    Badge,
    Group,
    Text,
} from '@mantine/core';
import {
    IconClock
} from '@tabler/icons-react';

import {formatDisplayTime} from "../../../../utils/time-utils.js";

// ------------------------------------------------------------------------------------------------------------------------
// Live duration display
// ------------------------------------------------------------------------------------------------------------------------

export function ClientWorkoutLiveDurationBadge({startedAt, subtle}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [now, setNow] = useState(() => Date.now());

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        const interval = window.setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => window.clearInterval(interval);
    }, []);

    const duration = formatElapsedDuration(
        getElapsedSeconds(startedAt, now),
    );

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    if (subtle) {
        return (
            <Group gap={4}>
                <span className="client-session-live-dot" style={{marginRight: 2, opacity: 0.5}}/>
                <Text size="0.7rem" fw={600} c="darkgray">
                    {duration}
                </Text>
            </Group>
        );
    }

    return (
        <Badge
            color={"green"}
            variant={"light"}
            leftSection={<span className="client-session-live-dot" style={{marginRight: 2}}/>}
        >
            {duration}
        </Badge>
    );
}

// ------------------------------------------------------------------------------------------------------------------------
// Record duration display
// ------------------------------------------------------------------------------------------------------------------------

export function ClientWorkoutRecordTiming({startedAt, completedAt, isSmallScreen}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const completedDate = formatCompletedDate(completedAt);
    const completedTime = completedAt ? formatDisplayTime(completedAt) : null;
    const duration = formatElapsedDuration(getElapsedSeconds(startedAt, completedAt));

    if (!completedDate && !completedTime && !duration) {
        return null;
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Alert
            color="blue"
            variant="light"
            icon={<IconClock size={18}/>}
        >
            {completedDate && completedTime && duration ? (
                <>
                    This workout was completed on{' '}
                    <Text component="span" fw={700} size={isSmallScreen ? "sm" : undefined}>
                        {completedDate}
                    </Text>
                    {' '}at{' '}
                    <Text component="span" fw={700} size={isSmallScreen ? "sm" : undefined}>
                        {completedTime}
                    </Text>
                    {' '}and took{' '}
                    <Text component="span" fw={700} size={isSmallScreen ? "sm" : undefined}>
                        {duration}
                    </Text>.
                </>
            ) : completedDate ? (
                <>
                    This workout was completed on{' '}
                    <Text component="span" fw={700}>
                        {completedDate}
                    </Text>
                    {completedTime ? ' at ' : ''}
                    <Text component="span" fw={700}>
                        {completedTime ?? ''}
                    </Text>.
                </>
            ) : (
                <>
                    This workout took:{' '}
                    <Text component="span" fw={700}>
                        {duration}
                    </Text>
                </>
            )}
        </Alert>
    );
}

// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

function getElapsedSeconds(startedAt, endedAt) {
    const startTime = getTime(startedAt);
    const endTime = typeof endedAt === 'number' ? endedAt : getTime(endedAt);

    if (startTime === null || endTime === null || endTime < startTime) {
        return null;
    }

    return Math.floor((endTime - startTime) / 1000);
}

function getTime(value) {
    if (!value) {
        return null;
    }

    const time = new Date(value).getTime();

    return Number.isFinite(time) ? time : null;
}

function formatElapsedDuration(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
        return '—';
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(seconds).padStart(2, '0'),
    ].join(':');
}

function formatCompletedDate(completedAt) {
    if (!completedAt) {
        return null;
    }

    const date = new Date(completedAt);

    if (!Number.isFinite(date.getTime())) {
        return null;
    }

    return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}