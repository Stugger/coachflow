import {useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    Accordion,
    Avatar,
    Alert,
    Badge,
    Button,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconDumbbell,
    IconPhoto,
    IconTarget
} from '@tabler/icons-react';

import {ROUTES} from '../../../constants/routes.js';
import ExerciseVideoPreview from '../../exercises/components/ExerciseVideoPreview.jsx';
import * as ExerciseMetadataUtils from '../../exercises/exercise-metadata-utils.js';
import {EQUIPMENT_OPTIONS, MUSCLE_OPTIONS} from '../../exercises/exercise-metadata-options.js';
import {TRACKING_FIELD_DEFINITIONS, TRACKING_FIELD_KEY} from '../../exercises/exercise-tracking-fields.js';
import {getExerciseUnitLabel} from '../../exercises/exercise-units.js';
import {resolveMediaUrl} from '../../../utils/media-url-utils.js';
import {formatDurationSeconds} from '../../../utils/time-utils.js';
import {getExercisePreviewSummary} from '../../workout-builder/preview/workout-preview-utils.js';
import {WORKOUT_ITEM_TYPE, WORKOUT_SET_TYPE_OPTIONS} from '../../workout-builder/workout-builder-constants.js';

import ClientWorkoutProgressIcon from './ClientWorkoutProgressIcon.jsx';
import {
    CLIENT_WORKOUT_PROGRESS_STATUS,
    createClientWorkoutResultIndex,
    findClientWorkoutSessionItem,
    getDirectExerciseSessionSets,
    getStackSessionRounds,
} from './client-workout-session-utils.js';

function ClientWorkoutSessionItemView({workout, results, itemId}) {
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
        <Stack gap="md">
            <Button variant="subtle" w="fit-content" leftSection={<IconArrowLeft size={16}/>} onClick={returnToOverview}>
                Back to Overview
            </Button>

            <Paper withBorder radius="md" p={{base: 'md', sm: 'lg'}}>
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Stack gap={3} style={{minWidth: 0}}>
                        <Text size="sm" c="dimmed">
                            {section.name?.trim() || `Section ${section.position}`}
                        </Text>

                        <Title order={3}>{item.displayName}</Title>

                        <Text size="sm" c="dimmed">
                            {item.progress.completedUnitCount} of {item.progress.totalUnitCount} {getUnitLabel(item.progress)} complete
                        </Text>
                    </Stack>

                    <ClientWorkoutProgressIcon status={item.progress.status} size={30}/>
                </Group>
            </Paper>

            {item.itemType === WORKOUT_ITEM_TYPE.EXERCISE
                ? <DirectExerciseSessionView item={item} resultIndex={resultIndex}/>
                : <StackSessionView item={item} resultIndex={resultIndex}/>}
        </Stack>
    );
}

function DirectExerciseSessionView({item, resultIndex}) {
    const {config, sets} = getDirectExerciseSessionSets(item, resultIndex);

    const firstIncompleteSet = sets.find(
        set => set.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
    ) ?? sets[0] ?? null;

    const [expandedSetKey, setExpandedSetKey] = useState(firstIncompleteSet?.setKey ?? null);

    return (
        <Stack gap="md">
            <SessionExerciseInformation exercise={item.exercise}/>

            <Accordion value={expandedSetKey} onChange={setExpandedSetKey} variant="separated" radius="md">
                {sets.map(set => (
                    <Accordion.Item key={set.setKey} value={set.setKey}>
                        <Accordion.Control icon={<ClientWorkoutProgressIcon status={set.status}/>}>
                            <SessionUnitHeading
                                title={`Set ${set.number}`}
                                set={set}
                                config={config}
                                status={set.status}
                            />
                        </Accordion.Control>

                        <Accordion.Panel>
                            <SessionSetDetails config={config} set={set} result={set.result}/>
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>
        </Stack>
    );
}

function StackSessionView({item, resultIndex}) {
    const {rounds} = getStackSessionRounds(item, resultIndex);

    const firstIncompleteRound = rounds.find(
        round => round.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
    ) ?? rounds[0] ?? null;

    const [expandedRound, setExpandedRound] = useState(
        firstIncompleteRound ? String(firstIncompleteRound.number) : null,
    );

    return (
        <Accordion value={expandedRound} onChange={setExpandedRound} variant="separated" radius="md">
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
                            <Stack gap="sm">
                                {round.exercises.map(exercise => (
                                    <Paper key={exercise.itemExercise.id} withBorder radius="md" p="md">
                                        <Stack gap="sm">
                                            <Group gap="sm" wrap="nowrap">
                                                <ClientWorkoutProgressIcon status={exercise.status}/>

                                                <Stack gap={1} style={{minWidth: 0}}>
                                                    <Text fw={700} truncate>{exercise.itemExercise.displayName}</Text>
                                                    <Text size="xs" c="dimmed">Exercise {exercise.itemExercise.position}</Text>
                                                </Stack>
                                            </Group>

                                            {exercise.set
                                                ? (
                                                    <SessionSetDetails
                                                        config={exercise.config}
                                                        set={exercise.set}
                                                        result={exercise.result}
                                                    />
                                                )
                                                : (
                                                    <Alert color="yellow">
                                                        This exercise does not contain a set for Round {round.number}.
                                                    </Alert>
                                                )}
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        </Accordion.Panel>
                    </Accordion.Item>
                );
            })}
        </Accordion>
    );
}

function SessionUnitHeading({title, set, config, status}) {
    const summary = getSetSummary(config, set);

    return (
        <Group justify="space-between" pr="sm" wrap="nowrap">
            <Stack gap={1} style={{minWidth: 0}}>
                <Group gap="xs">
                    <Text fw={700}>{title}</Text>
                    <SetTypeBadge setType={set.setType}/>
                </Group>

                <Text size="xs" c="dimmed" truncate>{summary.targetText}</Text>
            </Stack>

            <Text size="sm" fw={600} c="dimmed" style={{flexShrink: 0}}>
                {getStatusLabel(status)}
            </Text>
        </Group>
    );
}

function SessionSetDetails({config, set, result}) {
    const summary = getSetSummary(config, set);
    const resultGroups = getResultGroups(config, result);

    return (
        <Stack gap="md">
            <SimpleGrid cols={{base: 1, sm: 2}}>
                <Paper withBorder radius="md" p="md">
                    <Stack gap={4}>
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">Target</Text>
                        <Text size="sm">{summary.targetText}</Text>
                    </Stack>
                </Paper>

                <Paper withBorder radius="md" p="md">
                    <Stack gap={4}>
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">Saved result</Text>

                        {resultGroups.length
                            ? resultGroups.map(group => (
                                <Text key={group.label || 'default'} size="sm">
                                    {group.label && <Text component="span" fw={700}>{group.label}: </Text>}
                                    {group.text}
                                </Text>
                            ))
                            : <Text size="sm" c="dimmed">No result entered.</Text>}
                    </Stack>
                </Paper>
            </SimpleGrid>

            {summary.instructions.length > 0 && (
                <Paper withBorder radius="md" p="md">
                    <Stack gap={4}>
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">Instructions</Text>
                        {summary.instructions.map(instruction => (
                            <Text key={instruction} size="sm">{instruction}</Text>
                        ))}
                    </Stack>
                </Paper>
            )}

            {result?.notes?.trim() && (
                <Paper withBorder radius="md" p="md">
                    <Stack gap={4}>
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">Trainer note</Text>
                        <Text size="sm" style={{whiteSpace: 'pre-wrap'}}>{result.notes}</Text>
                    </Stack>
                </Paper>
            )}
        </Stack>
    );
}

function SessionExerciseInformation({exercise}) {
    const metadata = ExerciseMetadataUtils.parseExerciseMetadataJson(exercise?.metadataJson);

    if (!exercise) {
        return null;
    }

    return (
        <Accordion variant="contained" radius="md">
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
                    <Text fw={600}>Exercise information</Text>
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

function getSetSummary(config, set) {
    const summary = getExercisePreviewSummary({...config, sets: [set]});
    const setGroup = summary.setGroups[0];
    const targetParts = setGroup?.targetParts?.map(part => part.text) ?? [];
    const noTargetParts = summary.noTargetTrackingFields.map(field => field.label);

    return {
        targetText: targetParts.length
            ? targetParts.join(' • ')
            : noTargetParts.length
                ? `Track ${noTargetParts.join(', ')}`
                : 'No tracked values',
        instructions: setGroup?.noteParts ?? [],
    };
}

function getResultGroups(config, result) {
    if (!result) {
        return [];
    }

    const buckets = config.eachSide
        ? [['Left', result.values.left], ['Right', result.values.right]]
        : [['', result.values.default]];

    return buckets
        .map(([label, values]) => ({
            label,
            text: formatResultValues(config.trackingFields, values),
        }))
        .filter(group => group.text);
}

function formatResultValues(trackingFields, values) {
    if (!values || typeof values !== 'object') {
        return '';
    }

    return trackingFields
        .filter(field =>
            field.key !== TRACKING_FIELD_KEY.NOTES
            && values[field.key] !== undefined
            && values[field.key] !== null
            && values[field.key] !== ''
        )
        .map(field => {
            const definition = TRACKING_FIELD_DEFINITIONS[field.key];
            const label = definition?.label ?? field.key;

            const value = field.key === TRACKING_FIELD_KEY.TIME || field.key === TRACKING_FIELD_KEY.REST
                ? formatDurationSeconds(values[field.key]) ?? values[field.key]
                : values[field.key];

            const unit = getExerciseUnitLabel(field.unit ?? definition?.unit);

            return `${label}: ${value}${unit ? ` ${unit}` : ''}`;
        })
        .join(' • ');
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