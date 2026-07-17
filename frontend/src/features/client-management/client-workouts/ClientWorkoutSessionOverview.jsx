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

const OPEN_SECTIONS_PARAM = 'openSections';

function ClientWorkoutSessionOverview({workout, results, onOpenItem}) {

    const [searchParams, setSearchParams] = useSearchParams();

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
                withBorder
                radius="md"
                p={{base: 'md', sm: 'lg'}}
            >
                <Stack gap="sm">
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
                    radius="md"
                >
                    {sessionProgress.sections.map(section => (
                        <Accordion.Item
                            key={section.id}
                            value={String(section.id)}
                        >
                            <Accordion.Control icon={
                                <ClientWorkoutProgressIcon
                                    status={section.progress.status}
                                />}
                            >
                                <Group
                                    justify="space-between"
                                    pr="sm"
                                    wrap="nowrap"
                                >
                                    <Stack
                                        gap={1}
                                        style={{minWidth: 0}}
                                    >
                                        <Text fw={700} truncate>
                                            {section.name?.trim() || `Section ${section.position}`}
                                        </Text>

                                        <Text size="xs" c="dimmed">
                                            {section.progress.completedItemCount}{' of '}{section.progress.totalItemCount}{' items complete'}
                                        </Text>
                                    </Stack>

                                    <Text
                                        size="sm"
                                        fw={600}
                                        c="dimmed"
                                        style={{flexShrink: 0}}
                                    >
                                        {section.progress.completedSetCount}{' / '}{section.progress.totalSetCount}{' sets'}
                                    </Text>
                                </Group>
                            </Accordion.Control>

                            <Accordion.Panel>
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
                                        )
                                        : (
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

    return (
        <Paper
            component="button"
            type="button"
            withBorder
            radius="md"
            p="sm"
            onClick={onOpen}
            style={{width: '100%', textAlign: 'left', cursor: 'pointer'}}
        >
            <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{minWidth: 0}}>
                    <ClientWorkoutProgressIcon
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