import {
    Avatar,
    Badge,
    Box,
    Group,
    Paper,
    ScrollArea,
    Stack,
    Text,
    Tooltip,
    useComputedColorScheme,
    getGradient,
    useMantineTheme,
} from '@mantine/core';
import {
    IconAlertTriangle,
    IconPhoto,
} from '@tabler/icons-react';

import {resolveMediaUrl} from '../../../utils/media-url-utils';

import {
    WORKOUT_ITEM_TYPE,
} from '../workout-builder-constants';

import {
    getStackOption,
} from '../workout-builder-utils';

import {
    getExerciseDisplayName,
    getExercisePreviewSummary,
    getStackRoundCount,
    getWorkoutPreviewKey,
    sortWorkoutPreviewItems,
} from './workout-preview-utils';

import {
    useWorkoutBenchmarks,
} from '../workout-benchmark-context.js';

// ------------------------------------------------------------------------------------------------------------------------
// Workout item
// ------------------------------------------------------------------------------------------------------------------------

function WorkoutItemPreview({item, isSmallScreen, onViewExercise}) {
    const isExercise = item.itemType === WORKOUT_ITEM_TYPE.EXERCISE || item.exercise;

    return isExercise
        ? <ExercisePreview item={item} isSmallScreen={isSmallScreen} onViewExercise={onViewExercise} />
        : <WorkoutStackPreview stack={item} isSmallScreen={isSmallScreen} onViewExercise={onViewExercise}/>;
}

// ------------------------------------------------------------------------------------------------------------------------
// Exercise
// ------------------------------------------------------------------------------------------------------------------------

function ExercisePreview({item, stacked = false, isSmallScreen, onViewExercise}) {

    const exercise = item.exercise;

    const {
        enabled: benchmarkResolutionEnabled,
        benchmarks,
    } = useWorkoutBenchmarks();

    const {
        eachSide,
        setGroups,
        noTargetTrackingFields,
    } = getExercisePreviewSummary(item.configJson, {
        stackControlled: stacked,
        exerciseId: exercise?.id ?? item.exerciseId,
        benchmarks: benchmarkResolutionEnabled
            ? benchmarks
            : null,
    });

    const thumbnailSize = (stacked ? 38 : 48) / (isSmallScreen ? 1.2 : 1.0);

    return (
        <Paper
            withBorder
            radius="sm"
            p={stacked ? 'sm' : (isSmallScreen ? 'sm' : 'md')}
            bg="var(--color-workout-exercise-bg)"
            style={{
                borderColor: 'var(--color-border)'
            }}
        >
            <Group align="flex-start" wrap="nowrap" gap="sm">
                <Avatar
                    src={
                        exercise?.thumbnailUrl
                            ? resolveMediaUrl(exercise.thumbnailUrl)
                            : undefined
                    }
                    alt={exercise?.name}
                    size={thumbnailSize}
                    radius="sm"
                    variant="light"
                    style={{
                        flexShrink: 0,
                        cursor: exercise && onViewExercise ? 'pointer' : 'default',
                    }}
                    onClick={() => exercise && onViewExercise?.(exercise)}
                >
                    <IconPhoto size={stacked ? 18 : 22}/>
                </Avatar>

                <Stack
                    gap={6}
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    <Group gap="xs" wrap="wrap">
                        <Text
                            fw={700}
                            size={stacked ? 'sm' : undefined}
                            style={{minWidth: 0}}
                        >
                            {getExerciseDisplayName(item)}
                        </Text>

                        {eachSide && (
                            <Badge size="xs" color="gray" variant="light">
                                Each side
                            </Badge>
                        )}
                    </Group>

                    <ScrollArea
                        type="auto"
                        scrollbars="x"
                        scrollbarSize={6}
                        offsetScrollbars="present"
                    >
                        <Stack
                            gap={2}
                            style={{
                                width: 'max-content',
                                minWidth: '100%',
                            }}
                        >
                            {setGroups.map((group, index) => (
                                <Box key={`${group.signature}-${index}`}>
                                    <Group
                                        gap={4}
                                        wrap="nowrap"
                                        style={{
                                            width: 'max-content',
                                            minWidth: '100%',
                                        }}
                                    >
                                        <Text
                                            size={isSmallScreen || stacked ? 'xs' : 'sm'}
                                            c="dimmed"
                                            style={{
                                                whiteSpace: 'nowrap',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {group.lead}
                                        </Text>

                                        {group.targetParts.map((target, targetIndex) => (
                                            <Group
                                                key={`${target.text}-${targetIndex}`}
                                                gap={3}
                                                wrap="nowrap"
                                                style={{flexShrink: 0}}
                                            >
                                                <Text
                                                    size={isSmallScreen || stacked ? 'xs' : 'sm'}
                                                    c="dimmed"
                                                    style={{whiteSpace: 'nowrap'}}
                                                >
                                                    · {target.text}
                                                </Text>

                                                {target.warning && (
                                                    <Tooltip
                                                        label={target.warning}
                                                        withArrow
                                                        arrowSize={8}
                                                        multiline
                                                        events={{
                                                            hover: true,
                                                            focus: true,
                                                            touch: true,
                                                        }}
                                                    >
                                                        <Box
                                                            component="span"
                                                            aria-label={target.warning}
                                                            tabIndex={0}
                                                            style={{
                                                                display: 'inline-flex',
                                                                flexShrink: 0,
                                                                cursor: 'help',
                                                            }}
                                                        >
                                                            <IconAlertTriangle
                                                                size={13}
                                                                color="var(--mantine-color-yellow-6)"
                                                            />
                                                        </Box>
                                                    </Tooltip>
                                                )}
                                            </Group>
                                        ))}
                                    </Group>

                                    {group.noteParts.map((note, noteIndex) => (
                                        <Text
                                            key={`${note}-${noteIndex}`}
                                            size="xs"
                                            c="dimmed"
                                            fs="italic"
                                            mt={2}
                                        >
                                            {note}
                                        </Text>
                                    ))}
                                </Box>
                            ))}

                            {noTargetTrackingFields.length > 0 && (
                                <Text
                                    size={isSmallScreen ? '0.6rem' : 'xs'}
                                    c="dimmed"
                                    style={{whiteSpace: 'nowrap'}}
                                    pt={4}
                                >
                                    <strong>No default target:</strong>
                                    {' '}
                                    {noTargetTrackingFields
                                        .map(field => field.label)
                                        .join(' · ')}
                                </Text>
                            )}
                        </Stack>
                    </ScrollArea>

                    {item.notes?.trim() && (
                        <Box
                            bg="rgba(255, 209, 0, 0.075)"
                            style={{
                                borderRadius: 'var(--mantine-radius-md)',
                            }}
                        >
                            <Text
                                size="xs"
                                c="dimmed"
                                fs="italic"
                                p="0.4rem"
                                style={{
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {item.notes}
                            </Text>
                        </Box>
                    )}
                </Stack>
            </Group>
        </Paper>
    );
}

// ------------------------------------------------------------------------------------------------------------------------
// Stack
// ------------------------------------------------------------------------------------------------------------------------

function WorkoutStackPreview({stack, isSmallScreen, onViewExercise}) {

    const computedColorScheme = useComputedColorScheme('light');
    const theme = useMantineTheme();

    const option = getStackOption(stack.itemType);
    const StackIcon = option?.icon;

    const headerGradient = getGradient({deg: 90, from: `${option?.color ?? 'gray'}.6`, to: 'var(--color-workout-section-bg)'}, theme);

    const exercises = sortWorkoutPreviewItems(stack.itemExercises ?? []);
    const rounds = getStackRoundCount(stack);

    return (
        <Box
            ml={isSmallScreen ? 'calc(var(--mantine-spacing-md) * -0.65)' : 'calc(var(--mantine-spacing-md) * -0.5)'}
            pl={isSmallScreen ? 'calc(var(--mantine-spacing-md) * 0.45)' : 'calc(var(--mantine-spacing-md) * 0.5)'}
            style={{
                borderLeft: `3px solid var(--mantine-color-${option?.color ?? 'gray'}-4)`,
            }}
        >
            <Paper
                withBorder
                radius="md"
                bg="var(--color-workout-stack-bg)"
                style={{
                    borderColor: 'var(--color-border)'
                }}
            >
                <Box
                    px="sm"
                    py={8}
                    style={{
                        background: headerGradient,
                        borderBottom: '1px solid var(--color-border)',
                        borderTopLeftRadius: 'var(--mantine-radius-sm)',
                        borderTopRightRadius: 'var(--mantine-radius-md)',
                    }}
                >
                    <Group justify="space-between" wrap="nowrap">
                        <Group gap={6} wrap="nowrap" style={{minWidth: 0}}>
                            {StackIcon && (
                                <StackIcon
                                    size={17}
                                    color="var(--mantine-color-white)"
                                    style={{flexShrink: 0}}
                                />
                            )}

                            <Text fw={800} size="sm" c="white" truncate>
                                {option?.label.toUpperCase() ?? 'Exercise Stack'}
                            </Text>
                        </Group>

                        <Badge
                            size="xs"
                            color={computedColorScheme === 'light' ? "black" : "white"}
                            variant="outline"
                            style={{flexShrink: 0}}
                        >
                            {rounds} round{rounds === 1 ? '' : 's'}
                        </Badge>
                    </Group>
                </Box>

                <Stack gap="xs" p={isSmallScreen ? "xs" : "sm"}>
                    {stack.notes?.trim() && (
                        <Text
                            size="sm"
                            c="dimmed"
                            fs="italic"
                            style={{whiteSpace: 'pre-wrap'}}
                        >
                            {stack.notes}
                        </Text>
                    )}

                    {exercises.map((exercise, index) => (
                        <ExercisePreview
                            key={getWorkoutPreviewKey(exercise, `stack-exercise-${index}`,)}
                            item={exercise}
                            stacked
                            isSmallScreen={isSmallScreen}
                            onViewExercise={onViewExercise}
                        />
                    ))}

                    {exercises.length === 0 && (
                        <Text size="sm" c="dimmed">
                            No exercises in this stack.
                        </Text>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}

export default WorkoutItemPreview;