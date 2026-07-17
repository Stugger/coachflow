import {useMemo} from 'react';
import {useSearchParams} from 'react-router-dom';
import {
    Accordion,
    Badge,
    Group,
    Paper,
    Progress,
    Stack,
    Text,
    getGradient,
    useMantineTheme,
} from '@mantine/core';
import {
    IconChevronRight,
} from '@tabler/icons-react';

import {
    CLIENT_WORKOUT_PROGRESS_STATUS,
    buildClientWorkoutSessionProgress,
    createClientWorkoutResultIndex,
} from './client-workout-session-utils.js';
import {
    WORKOUT_ITEM_TYPE,
} from '../../workout-builder/workout-builder-constants.js';

import ClientWorkoutProgressIcon from './ClientWorkoutProgressIcon.jsx';
import {getSectionTypeLabel} from "../../workout-builder/workout-builder-utils.js";

const OPEN_SECTIONS_PARAM = 'openSections';

function ClientWorkoutSessionOverview({workout, results, onOpenItem}) {

    const [searchParams, setSearchParams] = useSearchParams();

    const theme = useMantineTheme();

    const headerGradient = getGradient({deg: 90, from: '#2a307a', to: '#23233f',}, theme);

    const resultIndex = useMemo(
        () => createClientWorkoutResultIndex(results),
        [results],
    );

    const sessionProgress = useMemo(
        () => buildClientWorkoutSessionProgress(
            workout,
            resultIndex,
        ),
        [workout, resultIndex],
    );

    const sectionIds = sessionProgress.sections.map(section => String(section.id));

    const hasExpandedSectionState = searchParams.has(OPEN_SECTIONS_PARAM);

    const expandedSections = hasExpandedSectionState
        ? parseExpandedSections(searchParams, sectionIds)
        : getDefaultExpandedSections(sessionProgress.sections);

    const progress = sessionProgress.progress;

    const progressPercent = progress.totalItemCount ? (progress.completedItemCount / progress.totalItemCount) * 100 : 0;

    function handleExpandedSectionsChange(nextExpandedSections) {
        const nextSearchParams =
            new URLSearchParams(searchParams);

        /*
         * Retaining an empty value is intentional. It distinguishes the
         * trainer closing every section from no saved accordion state yet.
         */
        nextSearchParams.set(
            OPEN_SECTIONS_PARAM,
            nextExpandedSections.join(','),
        );

        setSearchParams(nextSearchParams, {
            replace: true,
        });
    }

    return (
        <Stack gap="md">
            <Paper
                radius={0}
                style={{ borderBottom: '1px solid var(--color-border)'}}
                pb="md"
            >
                <Stack gap="sm" px={{base: 'xs', sm: 0}}>
                    <Group
                        justify="space-between"
                        align="flex-end"
                    >
                        <Stack gap={1}>
                            <Text fw={700}>
                                Workout progress
                            </Text>

                            <Text size="sm" c="dimmed">
                                {progress.completedItemCount}{' '}of{' '}{progress.totalItemCount}{' '}workout items complete
                            </Text>
                        </Stack>

                        <Text
                            size="sm"
                            fw={600}
                            c="dimmed"
                        >
                            {progress.completedSetCount}{' / '}{progress.totalSetCount}{' sets'}
                        </Text>
                    </Group>

                    <Progress
                        value={progressPercent}
                        color={
                            progress.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
                                ? 'green'
                                : progress.status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS
                                    ? 'yellow'
                                    : 'gray'
                        }
                        radius="xl"
                    />
                </Stack>
            </Paper>

            {sessionProgress.sections.length ? (
                <Accordion
                    multiple
                    value={expandedSections}
                    onChange={handleExpandedSectionsChange}
                    variant="separated"
                    styles={{
                        item: {
                            backgroundColor: 'var(--color-workout-section-bg)',
                            borderRadius: 'var(--mantine-radius-md)',
                            overflow: 'hidden',
                        },
                        control: {
                            height: '3.6rem',
                            background: headerGradient,
                        },
                        chevron: {
                            color: 'white',
                        },
                    }}
                >
                    {sessionProgress.sections.map(section => (
                        <Accordion.Item
                            key={section.id}
                            value={String(section.id)}
                        >
                            <Accordion.Control
                                icon={
                                    <ClientWorkoutProgressIcon
                                        status={section.progress.status}
                                    />
                                }
                            >
                                <Group justify="space-between" pr="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                                    <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
                                        <Text fw={700} c="white" truncate>
                                            {section.name?.trim() || `Section ${section.position}`}
                                        </Text>

                                        <Text size="xs" c="lightgray">
                                            {section.progress.completedItemCount}{' of '}
                                            {section.progress.totalItemCount}{' items complete'}
                                        </Text>
                                    </Stack>

                                    <Group
                                        justify="flex-end"
                                        align="center"
                                        gap="xs"
                                        wrap="wrap"
                                        style={{
                                            rowGap: 4,
                                            columnGap: '0.5rem',
                                            flexShrink: 0,
                                            maxWidth: '45%',
                                        }}
                                    >
                                        <Badge size="xs" variant="outline" color="white">
                                            {getSectionTypeLabel(section.sectionType)}
                                        </Badge>

                                        <Text size="sm" fw={600} c="lightgray" style={{ whiteSpace: 'nowrap' }}>
                                            {section.progress.completedSetCount}{' / '}
                                            {section.progress.totalSetCount}{' sets'}
                                        </Text>
                                    </Group>
                                </Group>
                            </Accordion.Control>

                            <Accordion.Panel pt="xs">
                                <Stack gap="sm">
                                    {section.items.length
                                        ? section.items.map(
                                            item => (
                                                <WorkoutSessionItemRow
                                                    key={item.id}
                                                    item={item}
                                                    onOpen={() => onOpenItem(item.id)}
                                                />
                                            ),
                                        ) : (
                                            <Text size="sm" c="dimmed">
                                                This section has no workout items.
                                            </Text>
                                        )}
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            ) : (
                <Paper
                    withBorder
                    radius="md"
                    p="lg"
                >
                    <Text c="dimmed">
                        This workout does not contain any sections yet.
                    </Text>
                </Paper>
            )}
        </Stack>
    );
}

function WorkoutSessionItemRow({item, onOpen}) {
    const progress = item.progress;
    const isStack = item.itemType !== WORKOUT_ITEM_TYPE.EXERCISE;
    const unitLabel = progress.totalUnitCount === 1 ? progress.unitLabel : `${progress.unitLabel}s`;

    const stackExerciseNames = isStack
        ? (item.itemExercises ?? []).map(itemExercise =>
            itemExercise.name?.trim()
            || itemExercise.exercise?.name
            || `Exercise ${itemExercise.position}`
        )
        : [];

    return (
        <Paper
            component="button"
            type="button"
            className="interactive-card subtle"
            withBorder
            radius="md"
            p="sm"
            onClick={onOpen}
            style={{
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                backgroundColor: 'var(--color-workout-exercise-bg)',
                color: progress.status === CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED ? 'var(--mantine-color-dimmed)' : 'inherit',
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
            }}
        >
            <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Group gap="sm" wrap="nowrap" align="flex-start" style={{minWidth: 0}}>
                    <ClientWorkoutProgressIcon
                        size={20}
                        status={progress.status}
                    />

                    <Stack gap={2} style={{minWidth: 0}}>
                        <Group gap="xs" wrap="nowrap">
                            <Text fw={600} truncate>{item.displayName}</Text>

                            {isStack && (
                                <Badge size="xs" variant="light">
                                    {item.typeLabel}
                                </Badge>
                            )}
                        </Group>

                        <Text size="xs" c="dimmed">
                            {progress.completedUnitCount} of {progress.totalUnitCount} {unitLabel} complete
                        </Text>

                        {stackExerciseNames.length > 0 && (
                            <Stack gap={0} mt={2}>
                                {stackExerciseNames.map((exerciseName, index) => (
                                    <Text key={`${exerciseName}-${index}`} size="xs" c="dimmed">
                                        • {exerciseName}
                                    </Text>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Group>

                <Group gap="xs" wrap="nowrap" style={{flexShrink: 0}}>
                    <Text size="sm" fw={600} c="dimmed">
                        {progress.completedUnitCount} / {progress.totalUnitCount}
                    </Text>

                    <IconChevronRight size={16} color="var(--mantine-color-dimmed)"/>
                </Group>
            </Group>
        </Paper>
    );
}

function parseExpandedSections(searchParams, validSectionIds) {
    const validSectionIdSet = new Set(validSectionIds);

    return (searchParams.get(OPEN_SECTIONS_PARAM) ?? '')
        .split(',')
        .filter(sectionId =>
            validSectionIdSet.has(sectionId)
        );
}

function getDefaultExpandedSections(sections) {
    const nextSection = sections.find(section => section.progress.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED);

    return nextSection ? [String(nextSection.id)] : [];
}

export default ClientWorkoutSessionOverview;