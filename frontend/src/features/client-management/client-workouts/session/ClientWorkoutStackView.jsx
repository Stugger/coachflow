import {useState} from 'react';
import {
    Accordion,
    Alert,
    Avatar,
    Group,
    Stack,
    Text,
} from '@mantine/core';
import {IconPhoto} from '@tabler/icons-react';

import {resolveMediaUrl} from '../../../../utils/media-url-utils.js';

import ClientWorkoutProgressIcon from './ClientWorkoutProgressIcon.jsx';
import ClientWorkoutSessionSetEditor from './ClientWorkoutSessionSetEditor.jsx';
import {
    CLIENT_WORKOUT_PROGRESS_STATUS,
    getStackSessionRounds,
} from './client-workout-session-utils.js';

function getStackStepKey(roundNumber, itemExerciseId) {
    return `round:${roundNumber}:exercise:${itemExerciseId}`;
}

function ClientWorkoutStackView({workoutId, item, resultIndex, onResultSaved}) {

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
    ) ?? steps[0] ?? null;

    const [expandedRound, setExpandedRound] = useState(
        firstIncompleteStep ? String(firstIncompleteStep.roundNumber) : null,
    );

    const [expandedExercise, setExpandedExercise] = useState(firstIncompleteStep?.key ?? null);

    function handleRoundChange(nextRound) {
        setExpandedRound(nextRound);

        if (!nextRound) {
            return;
        }

        const roundSteps = steps.filter(step => String(step.roundNumber) === nextRound);

        const nextStep = roundSteps.find(
            step => step.exercise.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
        ) ?? roundSteps[0] ?? null;

        setExpandedExercise(nextStep?.key ?? null);
    }

    function handleExerciseCompleted(completedStepKey) {
        const completedStepIndex = steps.findIndex(step => step.key === completedStepKey);

        const nextStep = steps
                .slice(completedStepIndex + 1)
                .find(step => step.exercise.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED)
            ?? steps.find(
                step =>
                    step.key !== completedStepKey
                    && step.exercise.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
            );

        if (!nextStep) {
            return;
        }

        setExpandedRound(String(nextStep.roundNumber));
        setExpandedExercise(nextStep.key);
    }

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
                    <Accordion.Item key={round.number} value={String(round.number)}>
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
                                variant="contained"
                                radius="md"
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
                                        <Accordion.Item key={exercise.itemExercise.id} value={stepKey}>
                                            <Accordion.Control
                                                icon={
                                                    <Avatar
                                                        src={resolveMediaUrl(exercise.itemExercise.exercise?.thumbnailUrl)}
                                                        alt={exercise.itemExercise.displayName}
                                                        size={40}
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

                                                        <Text size="xs" c="dimmed">
                                                            Exercise {exercise.itemExercise.position}
                                                        </Text>
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
                                    );
                                })}
                            </Accordion>
                        </Accordion.Panel>
                    </Accordion.Item>
                );
            })}
        </Accordion>
    );
}

export default ClientWorkoutStackView;