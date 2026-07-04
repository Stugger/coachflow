import {
    Avatar,
    Badge,
    Box,
    Group,
    Paper,
    Stack,
    Text,
    useComputedColorScheme,
    getGradient,
    useMantineTheme,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {
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

// ------------------------------------------------------------------------------------------------------------------------
// Workout item
// ------------------------------------------------------------------------------------------------------------------------

function WorkoutItemPreview({item}) {
    const isExercise = item.itemType === WORKOUT_ITEM_TYPE.EXERCISE || item.exercise;

    return isExercise
        ? <ExercisePreview item={item}/>
        : <WorkoutStackPreview stack={item}/>;
}

// ------------------------------------------------------------------------------------------------------------------------
// Exercise
// ------------------------------------------------------------------------------------------------------------------------

function ExercisePreview({item, stacked = false}) {

    const isMobile = useMediaQuery('(max-width: 48em)');

    const exercise = item.exercise;
    const {eachSide, setGroups} = getExercisePreviewSummary(item.configJson, {stackControlled: stacked});

    const thumbnailSize = (stacked ? 38 : 48) / (isMobile ? 1.2 : 1.0);

    return (
        <Paper
            withBorder
            radius="sm"
            p={stacked ? 'sm' : (isMobile ? 'sm' : 'md')}
            bg="var(--color-surface)"
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
                    style={{flexShrink: 0}}
                >
                    <IconPhoto size={stacked ? 18 : 22}/>
                </Avatar>

                <Stack gap={stacked ? 4 : 6} style={{flex: 1, minWidth: 0}}>
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

                    <Stack gap={2}>
                        {setGroups.map((group, index) => (
                            <Box
                                key={`${group.signature}-${index}`}
                            >
                                <Text
                                    size={stacked ? 'xs' : 'sm'}
                                    c="dimmed"
                                >
                                    {group.label}
                                </Text>

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
                    </Stack>

                    {item.notes?.trim() && (
                        <Text
                            size="xs"
                            c="dimmed"
                            fs="italic"
                            style={{whiteSpace: 'pre-wrap'}}
                        >
                            {item.notes}
                        </Text>
                    )}
                </Stack>
            </Group>
        </Paper>
    );
}

// ------------------------------------------------------------------------------------------------------------------------
// Stack
// ------------------------------------------------------------------------------------------------------------------------

function WorkoutStackPreview({stack}) {

    const isMobile = useMediaQuery('(max-width: 48em)');
    const computedColorScheme = useComputedColorScheme('light');
    const theme = useMantineTheme();

    const option = getStackOption(stack.itemType);
    const StackIcon = option?.icon;

    const headerGradient = getGradient({deg: 90, from: `${option?.color ?? 'gray'}.6`, to: 'var(--color-background)'}, theme);

    const exercises = sortWorkoutPreviewItems(stack.itemExercises ?? []);
    const rounds = getStackRoundCount(stack);

    return (
        <Box
            ml='calc(var(--mantine-spacing-md) * -0.6)'
            pl='calc(var(--mantine-spacing-md) * 0.4)'
            style={{
                borderLeft: `3px solid var(--mantine-color-${option?.color ?? 'gray'}-6)`,
            }}
        >
            <Paper
                withBorder
                radius="md"
                style={{overflow: 'hidden'}}
                bg='var(--color-background)'
            >
                <Box
                    px="sm"
                    py={8}
                    style={{
                        background: headerGradient,
                        borderBottom: '1px solid var(--color-border)',
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

                <Stack gap="xs" p={isMobile ? "xs" : "sm"}>
                    {stack.notes?.trim() && (
                        <Text
                            size="xs"
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