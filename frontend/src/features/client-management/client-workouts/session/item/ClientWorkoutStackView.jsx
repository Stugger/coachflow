import {Fragment, useEffect, useState} from 'react';
import {
    Accordion,
    Alert,
    Avatar,
    Box,
    Group,
    Stack,
    Text,
} from '@mantine/core';
import {
    IconPhoto,
} from '@tabler/icons-react';

import {resolveMediaUrl} from '../../../../../utils/media-url-utils.js';

import ClientWorkoutStackExerciseInformation from './ClientWorkoutStackExerciseInformation.jsx';
import ClientWorkoutProgressIcon from '../shared/ClientWorkoutProgressIcon.jsx';
import ClientWorkoutSessionSetMetadata from '../result/ClientWorkoutSessionSetMetadata.jsx';
import ClientWorkoutSessionSetEditor from '../result/ClientWorkoutSessionSetEditor.jsx';
import ClientWorkoutSessionRestTimer from './ClientWorkoutSessionRestTimer.jsx';

import {
    CLIENT_WORKOUT_PROGRESS_STATUS,
    getStackSessionRounds,
} from '../client-workout-session-utils.js';

import {
    getSetRestSeconds
} from '../result/client-workout-set-result-utils.js';

import {
    getSessionRestScrollId,
    getSessionRoundScrollId,
    getSessionStepScrollId,
    scheduleSessionScroll,
} from '../client-workout-session-scroll.js';

function getStackStepKey(roundNumber, itemExerciseId) {
    return `round:${roundNumber}:exercise:${itemExerciseId}`;
}

function ClientWorkoutStackView({workoutId, item, resultIndex, benchmarks, recordMode, colorScheme, isSmallScreen, onResultSaved}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const {itemExercises, rounds} = getStackSessionRounds(item, resultIndex);

    const steps = rounds.flatMap(round =>
        round.exercises
            .filter(exercise => exercise.set)
            .map(exercise => ({
                key: getStackStepKey(round.number, exercise.itemExercise.id),
                roundNumber: round.number,
                exercise,
            })),
    );

    const firstIncompleteStep = steps.find(step => step.exercise.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED) ?? null;

    const hasProgress = steps.some(step => step.exercise.status !== CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED);

    const [expandedRound, setExpandedRound] = useState(
        recordMode ? null : firstIncompleteStep ? String(firstIncompleteStep.roundNumber) : null
    );

    const [expandedExercise, setExpandedExercise] = useState(recordMode ? null : firstIncompleteStep?.key ?? null);

    const [activeRest, setActiveRest] = useState(null);

    const [scrollTarget, setScrollTarget] = useState(() =>
        !recordMode && hasProgress && firstIncompleteStep
            ? {
                id: getSessionRoundScrollId(firstIncompleteStep.roundNumber),
                block: 'start',
                delay: 350,
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

    function handleRoundChange(nextRound) {
        setExpandedRound(nextRound);

        if (!nextRound) {
            return;
        }

        if (recordMode) {
            setExpandedExercise(null);
            return;
        }

        const roundSteps = steps.filter(step => String(step.roundNumber) === nextRound);

        const nextStep = roundSteps.find(
            step => step.exercise.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
        ) ?? null;

        setExpandedExercise(nextStep?.key ?? null);
    }

    function handleExerciseCompleted(completedStepKey) {
        const completedStepIndex = steps.findIndex(step => step.key === completedStepKey);
        const completedStep = steps[completedStepIndex];

        if (!completedStep) {
            return;
        }

        const roundSteps = steps.filter(
            step => step.roundNumber === completedStep.roundNumber
        );

        const afterRound = roundSteps.at(-1)?.key === completedStep.key;
        const restSeconds = getSetRestSeconds(completedStep.exercise.set);

        setActiveRest(
            restSeconds
                ? {
                    sourceKey: completedStep.key,
                    roundNumber: completedStep.roundNumber,
                    durationSeconds: restSeconds,
                    startedAt: window.performance.now(),
                    afterRound,
                }
                : null
        );

        const nextStep = steps
                .slice(completedStepIndex + 1)
                .find(step => step.exercise.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED)
            ?? steps.find(
                step =>
                    step.key !== completedStepKey
                    && step.exercise.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
            );

        const changesRound = Boolean(nextStep && nextStep.roundNumber !== completedStep.roundNumber);

        if (nextStep) {
            setExpandedRound(String(nextStep.roundNumber));
            setExpandedExercise(nextStep.key);
        } else {
            setExpandedExercise(null);
            setExpandedRound(null);
        }

        setScrollTarget(
            restSeconds
                ? {
                    id: getSessionRestScrollId(completedStep.key),
                    block: 'start',
                    delay: changesRound ? 450 : undefined,
                }
                : changesRound
                    ? {
                        id: getSessionRoundScrollId(nextStep.roundNumber),
                        block: 'start',
                        delay: 450,
                    }
                    : nextStep
                        ? {
                            id: getSessionStepScrollId(nextStep.key),
                            block: 'start',
                        }
                        : null
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render utils
    // ------------------------------------------------------------------------------------------------------------------------

    function renderActiveRest() {
        if (recordMode || !activeRest) {
            return null;
        }

        return (
            <ClientWorkoutSessionRestTimer
                key={activeRest.sourceKey}
                durationSeconds={activeRest.durationSeconds}
                startedAt={activeRest.startedAt}
                onFinished={() => setActiveRest(null)}
            />
        );
    }

    function renderRoundItem(round) {
        const completedExercises = round.exercises.filter(
            exercise => exercise.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
        ).length;

        return (
            <Accordion.Item
                id={getSessionRoundScrollId(round.number)}
                value={String(round.number)}
                style={{
                    scrollMarginTop: '1rem',
                    borderLeft: round.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
                        ? '3px solid var(--mantine-color-green-outline)'
                        : round.status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS
                            ? '3px solid var(--mantine-color-yellow-outline)'
                            : (colorScheme === 'light' ? '3px solid darkgray' : '3px solid gray'),
                    boxShadow: expandedRound === String(round.number)
                        ? "0px 3px 10px -1px rgba(0, 0, 0, 0.1), 0px 6px 20px -4px rgba(0, 0, 0, 0.05)"
                        : undefined,
                }}
            >
                <Accordion.Control
                    icon={<ClientWorkoutProgressIcon status={round.status}/>}
                    pl={isSmallScreen ? 14 : undefined}
                >
                    <Group justify="space-between" pr="sm" wrap="nowrap">
                        <Stack gap={1}>
                            <Text fw={700}>Round {round.number}</Text>

                            <Text size="xs" c="dimmed">
                                {completedExercises} of {round.exercises.length} exercises {recordMode ? 'completed' : 'complete'}
                            </Text>
                        </Stack>

                        <Text size="sm" fw={600} c="dimmed" style={{flexShrink: 0}}>
                            {completedExercises} / {round.exercises.length}
                        </Text>
                    </Group>
                </Accordion.Control>

                <Accordion.Panel>
                    <Accordion
                        value={expandedExercise}
                        onChange={setExpandedExercise}
                        variant="separated"
                        mx={isSmallScreen ? -4 : 0}
                    >
                        {round.exercises.map(exercise => {
                            if (!exercise.set) {
                                return (
                                    <Alert key={exercise.itemExercise.id} color="yellow" mb="sm">
                                        {exercise.itemExercise.displayName} does not contain a set for Round {round.number}.
                                    </Alert>
                                );
                            }

                            const stepKey = getStackStepKey(round.number, exercise.itemExercise.id);

                            return (
                                <Fragment key={stepKey}>
                                    {renderRoundExerciseItem(round, exercise, stepKey)}

                                    {!recordMode && activeRest?.sourceKey === stepKey && !activeRest.afterRound && expandedRound === String(round.number) && (
                                        <Box
                                            id={getSessionRestScrollId(stepKey)}
                                            mt="sm"
                                            mb="sm"
                                            style={{scrollMarginTop: '1rem'}}
                                        >
                                            {renderActiveRest()}
                                        </Box>
                                    )}
                                </Fragment>
                            );
                        })}
                    </Accordion>
                </Accordion.Panel>
            </Accordion.Item>
        );
    }

    function renderRoundExerciseItem(round, exercise, stepKey) {
        const stepIndex = steps.findIndex(step => step.key === stepKey);
        const nextStep = steps[stepIndex + 1];

        const completeLabel = !nextStep
            ? 'Complete Stack'
            : nextStep.roundNumber !== round.number
                ? 'Complete Round'
                : 'Complete & Next Exercise';

        return (
            <Accordion.Item
                id={getSessionStepScrollId(stepKey)}
                value={stepKey}
                style={{
                    scrollMarginTop: '1rem',
                    borderRight: exercise.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
                        ? '3px solid var(--mantine-color-green-outline)'
                        : exercise.status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS
                            ? '3px solid var(--mantine-color-yellow-outline)'
                            : (colorScheme === 'light' ? '3px solid darkgray' : '3px solid gray'),
                }}
            >
                <Accordion.Control
                    px={isSmallScreen ? 13 : undefined}
                    icon={
                        <Avatar
                            src={resolveMediaUrl(exercise.itemExercise.exercise?.thumbnailUrl)}
                            alt={exercise.itemExercise.displayName}
                            size={isSmallScreen ? 38 : 42}
                            radius="sm"
                        >
                            <IconPhoto size={20}/>
                        </Avatar>
                    }
                >
                    <Group justify="space-between" pr="sm" wrap="nowrap">
                        <Stack gap={1} style={{minWidth: 0}}>
                            <Text fw={700} truncate>
                                {exercise.itemExercise.displayName}
                            </Text>

                            <Group gap={6} wrap="wrap">
                                <Text size="xs" c="dimmed">
                                    {isSmallScreen ? '#' : 'Exercise '}{exercise.itemExercise.position}
                                </Text>

                                <ClientWorkoutSessionSetMetadata
                                    setType={exercise.set.setType}
                                    eachSide={exercise.config.eachSide}
                                />
                            </Group>
                        </Stack>

                        <ClientWorkoutProgressIcon status={exercise.status}/>
                    </Group>
                </Accordion.Control>

                <Accordion.Panel mx={isSmallScreen ? -3 : 0}>
                    <ClientWorkoutSessionSetEditor
                        workoutId={workoutId}
                        clientWorkoutItemExerciseId={exercise.itemExercise.id}
                        exerciseId={exercise.itemExercise.exercise?.id}
                        benchmarks={benchmarks}
                        config={exercise.config}
                        set={exercise.set}
                        result={exercise.result}
                        completeLabel={completeLabel}
                        recordMode={recordMode}
                        colorScheme={colorScheme}
                        onResultSaved={onResultSaved}
                        onCompleted={() => handleExerciseCompleted(stepKey)}
                    />
                </Accordion.Panel>
            </Accordion.Item>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Stack gap="md">
            <ClientWorkoutStackExerciseInformation
                itemExercises={itemExercises}
            />

            <Accordion
                value={expandedRound}
                onChange={handleRoundChange}
                variant="separated"
                radius="md"
            >
                {rounds.map(round => (
                    <Fragment key={round.number}>
                        {renderRoundItem(round)}

                        {!recordMode && activeRest?.roundNumber === round.number && (activeRest.afterRound || expandedRound !== String(round.number)) && (
                            <Box
                                id={getSessionRestScrollId(activeRest.sourceKey)}
                                mt="md"
                                mb="md"
                                style={{scrollMarginTop: '1rem'}}
                            >
                                {renderActiveRest()}
                            </Box>
                        )}
                    </Fragment>
                ))}
            </Accordion>
        </Stack>
    );
}

export default ClientWorkoutStackView;