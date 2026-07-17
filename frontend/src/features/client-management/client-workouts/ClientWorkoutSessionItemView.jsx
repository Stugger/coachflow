import {useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    Accordion,
    ActionIcon,
    Avatar,
    Alert,
    Badge,
    Button,
    Group,
    Menu,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconDotsVertical,
    IconDumbbell,
    IconLogout2,
    IconPhoto,
    IconTarget
} from '@tabler/icons-react';

import {ROUTES} from '../../../constants/routes.js';
import ExerciseVideoPreview from '../../exercises/components/ExerciseVideoPreview.jsx';
import * as ExerciseMetadataUtils from '../../exercises/exercise-metadata-utils.js';
import {EQUIPMENT_OPTIONS, MUSCLE_OPTIONS} from '../../exercises/exercise-metadata-options.js';
import {resolveMediaUrl} from '../../../utils/media-url-utils.js';
import {WORKOUT_ITEM_TYPE, WORKOUT_SET_TYPE_OPTIONS} from '../../workout-builder/workout-builder-constants.js';

import ClientWorkoutProgressIcon from './ClientWorkoutProgressIcon.jsx';
import ClientWorkoutSessionSetEditor from './ClientWorkoutSessionSetEditor.jsx';

import {
    CLIENT_WORKOUT_PROGRESS_STATUS,
    createClientWorkoutResultIndex,
    findClientWorkoutSessionItem,
    getDirectExerciseSessionSets,
    getStackSessionRounds,
} from './client-workout-session-utils.js';

function ClientWorkoutSessionItemView({workout, results, itemId, onExitWorkout, onResultSaved}) {

    const navigate = useNavigate();
    const location = useLocation();

    const resultIndex = useMemo(() => createClientWorkoutResultIndex(results), [results]);

    const itemContext = useMemo(
        () => findClientWorkoutSessionItem(workout, itemId, resultIndex),
        [workout, itemId, resultIndex],
    );

    function returnToOverview() {
        navigate(`${ROUTES.clientWorkoutSession(workout.id)}${location.search}`, {
            state: location.state,
        });
    }

    if (!itemContext) {
        return (
            <Stack gap="md">
                <Button variant="subtle" w="fit-content" leftSection={<IconArrowLeft size={16}/>} onClick={returnToOverview}>
                    Back to Overview
                </Button>

                <Alert color="red">Workout item not found.</Alert>
            </Stack>
        );
    }

    const {section, item} = itemContext;

    return (
        <Stack gap="sm">
            <Group justify="space-between" wrap="nowrap">
                <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={16}/>}
                    pl={{base: 'xs', sm: 0}}
                    pr='xs'
                    onClick={returnToOverview}
                >
                    Overview
                </Button>

                <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" aria-label="Workout options">
                            <IconDotsVertical size={18}/>
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item color="red" leftSection={<IconLogout2 size={16}/>} onClick={onExitWorkout}>
                            Exit workout
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
            <Paper radius={0} pb="xs" style={{borderBottom: "1px solid var(--color-border)"}}>
                <Stack gap={2} px={{base: 'xs', sm: 0}}>
                    <Text size="sm" c="dimmed">
                        {section.name?.trim() || `Section ${section.position}`}
                    </Text>

                    <Group justify="space-between" align="center" wrap="nowrap">
                        <Title order={2}>{item.displayName}</Title>
                        <ClientWorkoutProgressIcon status={item.progress.status} size={30}/>
                    </Group>

                    <Text size="sm" c="dimmed">
                        {item.progress.completedUnitCount} of {item.progress.totalUnitCount} {getUnitLabel(item.progress)} complete
                    </Text>
                </Stack>
            </Paper>
            {item.itemType === WORKOUT_ITEM_TYPE.EXERCISE
                ? (
                    <DirectExerciseSessionView
                        key={item.id}
                        workoutId={workout.id}
                        item={item}
                        resultIndex={resultIndex}
                        onResultSaved={onResultSaved}
                    />
                ) : (
                    <StackSessionView
                        key={item.id}
                        workoutId={workout.id}
                        item={item}
                        resultIndex={resultIndex}
                        onResultSaved={onResultSaved}
                    />
                )}
        </Stack>
    );
}

function DirectExerciseSessionView({workoutId, item, resultIndex, onResultSaved}) {
    const {config, sets} = getDirectExerciseSessionSets(item, resultIndex);

    const firstIncompleteSet = sets.find(
        set => set.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
    ) ?? sets[0] ?? null;

    const [expandedSetKey, setExpandedSetKey] = useState(firstIncompleteSet?.setKey ?? null);

    function handleSetCompleted(setIndex) {
        const nextSet = sets
            .slice(setIndex + 1)
            .find(set => set.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED);

        if (nextSet) {
            setExpandedSetKey(nextSet.setKey);
        }
    }

    return (
        <Stack gap="md">
            <SessionExerciseInformation exercise={item.exercise}/>

            <Accordion
                value={expandedSetKey}
                onChange={setExpandedSetKey}
                variant="separated"
                radius="md"
            >
                {sets.map((set, index) => (
                    <Accordion.Item key={set.setKey} value={set.setKey}>
                        <Accordion.Control icon={<ClientWorkoutProgressIcon status={set.status}/>}>
                            <Group justify="space-between" pr="sm" wrap="nowrap">
                                <Group gap="xs">
                                    <Text fw={700}>Set {set.number}</Text>
                                    <SetTypeBadge setType={set.setType}/>
                                </Group>

                                <Text size="sm" fw={600} c="dimmed">
                                    {getStatusLabel(set.status)}
                                </Text>
                            </Group>
                        </Accordion.Control>

                        <Accordion.Panel>
                            <ClientWorkoutSessionSetEditor
                                workoutId={workoutId}
                                clientWorkoutItemId={item.id}
                                config={config}
                                set={set}
                                result={set.result}
                                completeLabel={index === sets.length - 1 ? 'Complete Exercise' : 'Complete & Next Set'}
                                onResultSaved={onResultSaved}
                                onCompleted={() => handleSetCompleted(index)}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>
        </Stack>
    );
}

function StackSessionView({workoutId, item, resultIndex, onResultSaved}) {
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

function getStackStepKey(roundNumber, itemExerciseId) {
    return `round:${roundNumber}:exercise:${itemExerciseId}`;
}

function SessionExerciseInformation({exercise}) {
    const metadata = ExerciseMetadataUtils.parseExerciseMetadataJson(exercise?.metadataJson);

    if (!exercise) {
        return null;
    }

    return (
        <Accordion
            variant="contained"
            radius="md"
            mt='calc(var(--mantine-spacing-xs) * -1.3)'
            styles={{
                item: {
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                },
            }}
        >
            <Accordion.Item value="exercise-information">
                <Accordion.Control icon={exercise.thumbnailUrl && (
                    <Avatar
                        src={resolveMediaUrl(exercise.thumbnailUrl)}
                        alt={exercise.name}
                        size={40}
                        radius="sm"
                        mt="xs"
                        mb="xs"
                    >
                        <IconPhoto size={20}/>
                    </Avatar>)}
                >
                    <Text fw={600} mt="xs" mb="xs">Exercise information</Text>
                </Accordion.Control>

                <Accordion.Panel>
                    <Stack gap="md">
                        <Text size="sm" c={exercise.details ? undefined : 'dimmed'} style={{whiteSpace: 'pre-wrap'}}>
                            {exercise.details || 'No exercise instructions provided.'}
                        </Text>

                        {exercise.demoVideoUrl && (
                            <ExerciseVideoPreview
                                url={exercise.demoVideoUrl}
                                title={`${exercise.name} demo video`}
                            />
                        )}

                        <SimpleGrid cols={{base: 1, sm: 2}}>
                            <MetadataBadges
                                icon={<IconTarget size={16}/>}
                                label="Primary muscles"
                                values={metadata.primaryMuscles}
                                options={MUSCLE_OPTIONS}
                            />

                            <MetadataBadges
                                icon={<IconDumbbell size={16}/>}
                                label="Equipment"
                                values={metadata.equipment}
                                options={EQUIPMENT_OPTIONS}
                            />
                        </SimpleGrid>
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
}

function MetadataBadges({icon, label, values, options}) {
    return (
        <Paper withBorder radius="md" p="md">
            <Stack gap="xs">
                <Group gap={6}>
                    {icon}
                    <Text size="sm" fw={700}>{label}</Text>
                </Group>

                {values.length
                    ? (
                        <Group gap={6}>
                            {values.map(value => (
                                <Badge key={value} variant="light">
                                    {options.find(option => option.value === value)?.label ?? value}
                                </Badge>
                            ))}
                        </Group>
                    )
                    : <Text size="sm" c="dimmed">—</Text>}
            </Stack>
        </Paper>
    );
}

function SetTypeBadge({setType}) {
    const option = WORKOUT_SET_TYPE_OPTIONS.find(option => option.value === setType);

    return (
        <Badge size="xs" variant="light" color={option?.color ?? 'gray'}>
            {option?.label ?? setType}
        </Badge>
    );
}

function getStatusLabel(status) {
    if (status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED) {
        return 'Complete';
    }

    if (status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS) {
        return 'In progress';
    }

    return 'Not started';
}

function getUnitLabel(progress) {
    return progress.totalUnitCount === 1 ? progress.unitLabel : `${progress.unitLabel}s`;
}

export default ClientWorkoutSessionItemView;