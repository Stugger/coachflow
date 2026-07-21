import {Fragment, useEffect, useState} from 'react';
import {
    Accordion,
    Box,
    Group,
    Stack,
    Text,
} from '@mantine/core';

import ClientWorkoutExerciseInformation from './ClientWorkoutExerciseInformation.jsx';
import ClientWorkoutProgressIcon from './ClientWorkoutProgressIcon.jsx';
import ClientWorkoutSessionSetMetadata from './ClientWorkoutSessionSetMetadata.jsx';
import ClientWorkoutSessionSetEditor from './ClientWorkoutSessionSetEditor.jsx';
import ClientWorkoutSessionRestTimer from './ClientWorkoutSessionRestTimer.jsx';

import {
    CLIENT_WORKOUT_PROGRESS_STATUS,
    getDirectExerciseSessionSets,
} from './client-workout-session-utils.js';

import {
    getSetRestSeconds,
} from './client-workout-set-result-utils.js';

import {
    getSessionRestScrollId,
    getSessionSetScrollId,
    scheduleSessionScroll,
} from './client-workout-session-scroll.js';

function ClientWorkoutDirectExerciseView({workoutId, item, resultIndex, benchmarks, colorScheme, onResultSaved}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const {config, sets} = getDirectExerciseSessionSets(item, resultIndex);

    const firstIncompleteSet = sets.find(set => set.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED) ?? null;

    const hasProgress = sets.some(set => set.status !== CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED);

    const [expandedSetKey, setExpandedSetKey] = useState(firstIncompleteSet?.setKey ?? null);

    const [activeRest, setActiveRest] = useState(null);

    const [scrollTarget, setScrollTarget] = useState(() =>
        hasProgress && firstIncompleteSet
            ? {
                id: getSessionSetScrollId(firstIncompleteSet.setKey),
                block: 'start',
            }
            : null
    );

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (!scrollTarget) {
            return undefined;
        }

        return scheduleSessionScroll(
            scrollTarget.id,
            {
                block: scrollTarget.block,
                delay: scrollTarget.delay,
                onScrolled: () => {
                    setScrollTarget(current =>
                        current?.id === scrollTarget.id
                            ? null
                            : current
                    );
                },
            },
        );
    }, [scrollTarget]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function handleSetCompleted(setIndex) {
        const completedSet = sets[setIndex];
        const restSeconds = getSetRestSeconds(completedSet);

        const nextSet = [
            ...sets.slice(setIndex + 1),
            ...sets.slice(0, setIndex),
        ].find(
            set => set.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
        ) ?? null;

        setActiveRest(
            restSeconds
                ? {
                    sourceKey: completedSet.setKey,
                    durationSeconds: restSeconds,
                    startedAt: window.performance.now(),
                }
                : null
        );

        setExpandedSetKey(nextSet?.setKey ?? null);

        setScrollTarget(
            restSeconds
                ? {
                    id: getSessionRestScrollId(completedSet.setKey),
                    block: 'start',
                }
                : nextSet
                    ? {
                        id: getSessionSetScrollId(nextSet.setKey),
                        block: 'start',
                    }
                    : null
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Stack gap="md">
            <ClientWorkoutExerciseInformation exercise={item.exercise}/>

            <Accordion
                value={expandedSetKey}
                onChange={setExpandedSetKey}
                variant="separated"
                radius="md"
            >
                {sets.map((set, index) => (
                    <Fragment key={set.setKey}>
                        <Accordion.Item
                            id={getSessionSetScrollId(set.setKey)}
                            value={set.setKey}
                            style={{
                                scrollMarginTop: '1rem',
                                borderLeft: set.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
                                    ? '3px solid var(--mantine-color-green-outline)'
                                    : set.status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS
                                        ? '3px solid var(--mantine-color-yellow-outline)'
                                        : (colorScheme === 'light' ? '3px solid darkgray' : '3px solid gray'),
                                boxShadow: expandedSetKey === String(set.setKey) ? "0px 3px 10px -1px rgba(0, 0, 0, 0.1), 0px 6px 20px -4px rgba(0, 0, 0, 0.05)" : undefined,
                            }}
                        >
                            <Accordion.Control icon={<ClientWorkoutProgressIcon status={set.status}/>}>
                                <Group justify="space-between" pr="sm" wrap="nowrap">
                                    <Group gap={8} wrap="wrap">
                                        <Text fw={700}>Set {set.number}</Text>
                                        <ClientWorkoutSessionSetMetadata setType={set.setType} eachSide={config.eachSide}/>
                                    </Group>

                                    <Text size="sm" fw={600} c="dimmed">
                                        {set.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
                                            ? 'Complete'
                                            : set.status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS
                                                ? 'In progress'
                                                : 'Not started'
                                        }
                                    </Text>
                                </Group>
                            </Accordion.Control>

                            <Accordion.Panel>
                                <ClientWorkoutSessionSetEditor
                                    workoutId={workoutId}
                                    clientWorkoutItemId={item.id}
                                    exerciseId={item.exercise?.id}
                                    benchmarks={benchmarks}
                                    config={config}
                                    set={set}
                                    result={set.result}
                                    completeLabel={index === sets.length - 1 ? 'Complete Exercise' : 'Complete & Next Set'}
                                    colorScheme={colorScheme}
                                    onResultSaved={onResultSaved}
                                    onCompleted={() => handleSetCompleted(index)}
                                />
                            </Accordion.Panel>
                        </Accordion.Item>

                        {activeRest?.sourceKey === set.setKey && (
                            <Box
                                id={getSessionRestScrollId(set.setKey)}
                                mt="md"
                                mb="md"
                                style={{scrollMarginTop: '1rem'}}
                            >
                                <ClientWorkoutSessionRestTimer
                                    durationSeconds={activeRest.durationSeconds}
                                    startedAt={activeRest.startedAt}
                                    onFinished={() => setActiveRest(null)}
                                />
                            </Box>
                        )}
                    </Fragment>
                ))}
            </Accordion>
        </Stack>
    );
}

export default ClientWorkoutDirectExerciseView;