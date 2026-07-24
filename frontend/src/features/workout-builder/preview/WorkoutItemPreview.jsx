import {
    Avatar,
    Badge,
    Box,
    Group,
    Paper,
    ScrollArea,
    Stack,
    Table,
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
    WORKOUT_SET_TYPE,
    WORKOUT_SET_TYPE_OPTIONS,
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

import ClientWorkoutProgressIcon from '../../client-management/client-workouts/session/shared/ClientWorkoutProgressIcon.jsx';

import {
    CLIENT_WORKOUT_PROGRESS_STATUS,
    getClientWorkoutResultStatus,
    getDirectExerciseResultKey,
    getStackExerciseResultKey,
} from '../../client-management/client-workouts/session/client-workout-session-utils.js';

// ------------------------------------------------------------------------------------------------------------------------
// Workout item
// ------------------------------------------------------------------------------------------------------------------------

function WorkoutItemPreview({item, isSmallScreen, liveResultIndex = null, onViewExercise}) {

    const computedColorScheme = useComputedColorScheme('light');

    const isExercise = item.itemType === WORKOUT_ITEM_TYPE.EXERCISE || item.exercise;

    return isExercise
        ? (
            <ExercisePreview
                item={item}
                isSmallScreen={isSmallScreen}
                colorScheme={computedColorScheme}
                liveResultIndex={liveResultIndex}
                onViewExercise={onViewExercise}
            />
        ) : (
            <WorkoutStackPreview
                stack={item}
                isSmallScreen={isSmallScreen}
                colorScheme={computedColorScheme}
                liveResultIndex={liveResultIndex}
                onViewExercise={onViewExercise}
            />
        );
}

// ------------------------------------------------------------------------------------------------------------------------
// Exercise
// ------------------------------------------------------------------------------------------------------------------------

function ExercisePreview({item, stacked = false, isSmallScreen, colorScheme, liveResultIndex = null, onViewExercise}) {

    const exercise = item.exercise;

    const {
        enabled: benchmarkResolutionEnabled,
        benchmarks,
    } = useWorkoutBenchmarks();

    const {
        eachSide,
        setCount,
        setUnit,
        setSummaries,
        noTargetTrackingFields,
    } = getExercisePreviewSummary(item.configJson, {
            stackControlled: stacked,
            exerciseId: exercise?.id ?? item.exerciseId,
            benchmarks: benchmarkResolutionEnabled ? benchmarks : null,
        },
    );

    const thumbnailSize = (stacked ? 40 : 48) / (isSmallScreen ? 1.2 : 1);
    const summaryTextSize = isSmallScreen ? 'xs' : 'sm';
    const showLiveProgress = Boolean(liveResultIndex);
    const leadColumnWidth = showLiveProgress ? isSmallScreen ? '3rem' : '3.4rem' : isSmallScreen ? '2rem' : '2.4rem';

    const scrollAreaKey = [
        showLiveProgress ? 'live' : 'ready',
        stacked ? 'stacked' : 'direct',
        isSmallScreen ? 'small' : 'large',
        ...setSummaries.map(setSummary => [
            setSummary.key,
            setSummary.lead,
            ...setSummary.targetParts.map(target => target.text),
            ...setSummary.noteParts,
        ].join(':')),
    ].join('|');

    return (
        <Paper
            withBorder
            radius="sm"
            p={isSmallScreen ? 'sm' : 'md'}
            bg="var(--color-workout-exercise-bg)"
        >
            <Stack gap="sm">
                <Group
                    align="center"
                    wrap="nowrap"
                    gap="sm"
                >
                    <Avatar
                        src={exercise?.thumbnailUrl ? resolveMediaUrl(exercise.thumbnailUrl) : undefined}
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
                        gap={2}
                        style={{
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <Text fw={700} size={stacked ? 'sm' : undefined} truncate>
                            {getExerciseDisplayName(item)}
                        </Text>

                        <Group gap={6}>
                            <Text fw={600} size="sm" c="dimmed">
                                {`${setCount} ${setUnit}${setCount === 1 ? '' : 's'}`}
                            </Text>
                            {eachSide && (
                                <Badge size="xs" color="gray" variant="light">
                                    Each side
                                </Badge>
                            )}
                        </Group>
                    </Stack>
                </Group>

                {setSummaries.length > 0 && (
                    <ScrollArea
                        key={scrollAreaKey}
                        type="auto"
                        scrollbars="x"
                        scrollbarSize={6}
                        offsetScrollbars="present"
                    >
                        <Box
                            style={{
                                width: 'max-content',
                                minWidth: '100%',
                                border: colorScheme === 'light' ? '1px solid #e9e9e9' : '1px solid var(--color-border)',
                                borderRadius: 'var(--mantine-radius-sm)',
                                overflow: 'hidden',
                            }}
                        >
                            <Table
                                verticalSpacing="0.3rem"
                                horizontalSpacing={isSmallScreen ? "xs" : "sm"}
                                style={{
                                    width: '100%',
                                    minWidth: 'max-content',
                                    borderCollapse: 'separate',
                                    borderSpacing: 0,
                                }}
                            >
                                <Table.Tbody>
                                    {setSummaries.map(
                                        (setSummary, index) => {
                                            const isLastRow = index === setSummaries.length - 1;
                                            const rowBorder = isLastRow ? undefined : colorScheme === 'light' ? '1px solid #e9e9e9' : '1px solid var(--color-border)';
                                            const setTypeOption = WORKOUT_SET_TYPE_OPTIONS.find(
                                                option => option.value === setSummary.setType,
                                            );

                                            const setTypeColor = setSummary.setType === WORKOUT_SET_TYPE.STANDARD ? null : setTypeOption?.color ?? 'gray';
                                            const setTypeTextColor = setTypeColor ? `var(--mantine-color-${setTypeColor}-${colorScheme === 'light' ? 7 : 4})` : 'var(--mantine-color-dimmed)';

                                            const resultKey = showLiveProgress && item.id != null && setSummary.key != null
                                                ? stacked ? getStackExerciseResultKey(item.id, setSummary.key) : getDirectExerciseResultKey(item.id, setSummary.key) : null;

                                            const liveProgressStatus = showLiveProgress
                                                ? resultKey ? getClientWorkoutResultStatus(liveResultIndex.get(resultKey) ?? null) : CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED
                                                : null;

                                            const liveRowBackground = getLiveRowBackground(liveProgressStatus, colorScheme);

                                            return (
                                                <Table.Tr
                                                    key={setSummary.key}
                                                >
                                                    <Table.Td
                                                        style={{
                                                            width: leadColumnWidth,
                                                            minWidth: leadColumnWidth,
                                                            maxWidth: leadColumnWidth,
                                                            textAlign: 'center',
                                                            backgroundColor: showLiveProgress ? liveRowBackground : colorScheme === 'light' ? 'var(--color-background)' : '#242424',
                                                            borderRight: colorScheme === 'light' ? '1px solid #e9e9e9' : '1px solid var(--color-border)',
                                                            borderBottom: rowBorder,
                                                        }}
                                                    >
                                                        <Tooltip
                                                            label={setSummary.label}
                                                            withArrow
                                                            arrowSize={8}
                                                            events={{hover: true, focus: false, touch: true}}
                                                        >
                                                            <Group gap={4} justify="flex-start" wrap="nowrap">
                                                                {showLiveProgress && (
                                                                    <ClientWorkoutProgressIcon
                                                                        status={liveProgressStatus}
                                                                        size={15}
                                                                    />
                                                                )}

                                                                <Text size={summaryTextSize} fw={700} c={setTypeTextColor}>
                                                                    {setSummary.lead}
                                                                </Text>
                                                            </Group>
                                                        </Tooltip>
                                                    </Table.Td>

                                                    <Table.Td
                                                        style={{
                                                            borderBottom: rowBorder,
                                                            backgroundColor: showLiveProgress ? liveRowBackground : undefined,
                                                        }}
                                                    >
                                                        {setSummary.targetParts.length > 0 ? (
                                                            <Group gap={4} wrap="nowrap">
                                                                {setSummary.targetParts.map((target, targetIndex) => (
                                                                    <Group
                                                                        key={`${target.text}-${targetIndex}`}
                                                                        gap={3}
                                                                        wrap="nowrap"
                                                                        style={{flexShrink: 0}}
                                                                    >
                                                                        <Text
                                                                            size={summaryTextSize}
                                                                            c="dimmed"
                                                                            style={{whiteSpace: 'nowrap'}}
                                                                        >
                                                                            {targetIndex > 0 ? '· ' : ''}{target.text}
                                                                        </Text>

                                                                        {target.warning && (
                                                                            <Tooltip
                                                                                label={target.warning}
                                                                                withArrow
                                                                                arrowSize={8}
                                                                                multiline
                                                                                events={{hover: true, focus: false, touch: true}}
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
                                                        ) : (
                                                            <Text size={summaryTextSize} c="dimmed" fs="italic">
                                                                No targets configured
                                                            </Text>
                                                        )}

                                                        {setSummary.noteParts.map((note, noteIndex) => (
                                                            <Text
                                                                key={`${note}-${noteIndex}`}
                                                                size={isSmallScreen ? '0.65rem' : 'xs'}
                                                                c="dimmed"
                                                                fs="italic"
                                                                mt={3}
                                                                style={{whiteSpace: 'pre-wrap'}}
                                                            >
                                                                {note}
                                                            </Text>
                                                        ))}
                                                    </Table.Td>
                                                </Table.Tr>
                                            );
                                        },
                                    )}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    </ScrollArea>
                )}

                {noTargetTrackingFields.length > 0 && (
                    <Text size={isSmallScreen ? '0.65rem' : 'xs'} c="dimmed">
                        <strong>No default target:</strong>
                        {' '}
                        {noTargetTrackingFields.map(field => field.label).join(' · ')}
                    </Text>
                )}

                {item.notes?.trim() && (
                    <Box
                        bg={showLiveProgress ? colorScheme === 'light' ? "rgba(0, 0, 0, 0.035)" : "rgba(255, 255, 255, 0.045)" : "rgba(255, 209, 0, 0.075)"}
                        style={{borderRadius: 'var(--mantine-radius-md)'}}
                    >
                        <Text
                            size="xs"
                            c="dimmed"
                            fs="italic"
                            p="0.4rem"
                            style={{whiteSpace: 'pre-wrap'}}
                        >
                            {item.notes}
                        </Text>
                    </Box>
                )}
            </Stack>
        </Paper>
    );
}

function getLiveRowBackground(status, colorScheme) {
    const tintStrength = colorScheme === 'light' ? '5%' : '4%';

    switch (status) {
        case CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED:
            return `color-mix(in srgb, var(--mantine-color-green-6) ${tintStrength}, transparent)`;

        case CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS:
            return `color-mix(in srgb, var(--mantine-color-yellow-6) ${tintStrength}, transparent)`;

        default:
            return colorScheme === 'light' ? '#fdfeff' : '#262626';
    }
}

// ------------------------------------------------------------------------------------------------------------------------
// Stack
// ------------------------------------------------------------------------------------------------------------------------

function WorkoutStackPreview({stack, isSmallScreen, colorScheme, liveResultIndex = null, onViewExercise}) {

    const option = getStackOption(stack.itemType);
    const StackIcon = option?.icon;

    const headerGradient = getGradient({deg: 90, from: `${option?.color ?? 'gray'}.6`, to: 'var(--color-workout-section-bg)'}, useMantineTheme());

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
                            color={colorScheme === 'light' ? "black" : "white"}
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
                            colorScheme={colorScheme}
                            liveResultIndex={liveResultIndex}
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