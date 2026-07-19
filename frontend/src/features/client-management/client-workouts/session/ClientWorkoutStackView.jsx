import {Fragment, useState} from 'react';
import {
    Accordion,
    Alert,
    Avatar,
    Box,
    Group,
    Stack,
    Text,
} from '@mantine/core';
import {IconPhoto} from '@tabler/icons-react';

import {resolveMediaUrl} from '../../../../utils/media-url-utils.js';

import ClientWorkoutProgressIcon from './ClientWorkoutProgressIcon.jsx';
import ClientWorkoutSessionSetMetadata from './ClientWorkoutSessionSetMetadata.jsx';
import ClientWorkoutSessionSetEditor from './ClientWorkoutSessionSetEditor.jsx';
import ClientWorkoutSessionRestTimer from './ClientWorkoutSessionRestTimer.jsx';

import {
    CLIENT_WORKOUT_PROGRESS_STATUS,
    getStackSessionRounds,
} from './client-workout-session-utils.js';

import {getSetRestSeconds} from './client-workout-set-result-utils.js';

function getStackStepKey(roundNumber, itemExerciseId) {
    return `round:${roundNumber}:exercise:${itemExerciseId}`;
}

function ClientWorkoutStackView({workoutId, item, resultIndex, isSmallScreen, onResultSaved}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const {rounds} = getStackSessionRounds(item, resultIndex);

    const steps = rounds.flatMap(round =>
        round.exercises
            .filter(exercise => exercise.set)
            .map(exercise => ({
                key: getStackStepKey(round.number, exercise.itemExercise.id),
                roundNumber: round.number,
                exercise,
            })),
    );

    const firstIncompleteStep = steps.find(
        step => step.exercise.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
    ) ?? null;

    const [expandedRound, setExpandedRound] = useState(
        firstIncompleteStep ? String(firstIncompleteStep.roundNumber) : null,
    );

    const [expandedExercise, setExpandedExercise] = useState(firstIncompleteStep?.key ?? null);

    const [activeRest, setActiveRest] = useState(null);

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function handleRoundChange(nextRound) {
        setExpandedRound(nextRound);

        if (!nextRound) {
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

        if (nextStep) {
            setExpandedRound(String(nextStep.roundNumber));
            setExpandedExercise(nextStep.key);
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render utils
    // ------------------------------------------------------------------------------------------------------------------------

    function renderActiveRest() {
        if (!activeRest) {
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

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Accordion
            value={expandedRound}
            onChange={handleRoundChange}
            variant="separated"
            radius="md"
        >
            {rounds.map(round => {
                const completedExercises = round.exercises.filter(
                    exercise => exercise.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
                ).length;

                return (
                    <Fragment key={round.number}>
                        <Accordion.Item
                            value={String(round.number)}
                            style={{
                                borderLeft: round.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
                                    ? '3px solid var(--mantine-color-green-outline)'
                                    : round.status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS
                                        ? '3px solid var(--mantine-color-yellow-outline)'
                                        : '3px solid gray',
                                boxShadow: expandedRound === String(round.number) ? "0px 3px 10px -1px rgba(0, 0, 0, 0.1), 0px 6px 20px -4px rgba(0, 0, 0, 0.05)" : undefined,
                            }}
                        >
                            <Accordion.Control icon={<ClientWorkoutProgressIcon status={round.status}/>}>
                                <Group justify="space-between" pr="sm" wrap="nowrap">
                                    <Stack gap={1}>
                                        <Text fw={700}>Round {round.number}</Text>

                                        <Text size="xs" c="dimmed">
                                            {completedExercises} of {round.exercises.length} exercises complete
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
                                        const stepIndex = steps.findIndex(step => step.key === stepKey);
                                        const nextStep = steps[stepIndex + 1];

                                        const completeLabel = !nextStep
                                            ? 'Complete Stack'
                                            : nextStep.roundNumber !== round.number
                                                ? 'Complete Round'
                                                : 'Complete & Next Exercise';

                                        return (
                                            <Fragment key={stepKey}>
                                                <Accordion.Item
                                                    value={stepKey}
                                                    style={{
                                                        borderRight: exercise.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
                                                            ? '3px solid var(--mantine-color-green-outline)'
                                                            : exercise.status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS
                                                                ? '3px solid var(--mantine-color-yellow-outline)'
                                                                : '3px solid gray',
                                                    }}
                                                >
                                                    <Accordion.Control
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

                                                    <Accordion.Panel>
                                                        <ClientWorkoutSessionSetEditor
                                                            workoutId={workoutId}
                                                            clientWorkoutItemExerciseId={exercise.itemExercise.id}
                                                            config={exercise.config}
                                                            set={exercise.set}
                                                            result={exercise.result}
                                                            completeLabel={completeLabel}
                                                            onResultSaved={onResultSaved}
                                                            onCompleted={() => handleExerciseCompleted(stepKey)}
                                                        />
                                                    </Accordion.Panel>
                                                </Accordion.Item>

                                                {activeRest?.sourceKey === stepKey && !activeRest.afterRound && expandedRound === String(round.number) && (
                                                    <Box mt="sm" mb="sm">
                                                        {renderActiveRest()}
                                                    </Box>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </Accordion>
                            </Accordion.Panel>
                        </Accordion.Item>

                        {activeRest?.roundNumber === round.number && (activeRest.afterRound || expandedRound !== String(round.number)) && (
                            <Box mt="md" mb="md">
                                {renderActiveRest()}
                            </Box>
                        )}
                    </Fragment>
                );
            })}
        </Accordion>
    );
}

export default ClientWorkoutStackView;