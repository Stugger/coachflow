import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {useIsSmallScreen} from "../../../../hooks/useIsSmallScreen.js";
import {
    Alert,
    Box,
    Button,
    Group,
    Loader,
    Paper,
    Progress,
    Stack,
    Text,
    Tooltip,
} from '@mantine/core';
import {
    IconChevronDown,
    IconChevronUp,
    IconEdit,
    IconEye,
    IconPlayerPlay,
    IconTrash,
} from '@tabler/icons-react';

import InitialAssessmentSetupMenu
    from '../../initial-assessment/InitialAssessmentSetupMenu';

import WorkoutStructurePreview
    from '../../../workout-builder/preview/WorkoutStructurePreview';

import {
    getWorkoutStructureCounts,
} from '../../../workout-builder/preview/workout-preview-utils';

import {
    buildClientWorkoutSessionProgress,
    createClientWorkoutResultIndex,
} from '../../client-workouts/session/client-workout-session-utils.js';

function InitialAssessmentRecordCard({workout, results, benchmarks, loaded, error, deleting, onNewWorkout, onFromTemplate, onEdit, onDelete, onStart, onOpenSession}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const isSmallScreen = useIsSmallScreen();

    const previewContentRef = useRef(null);

    const [previewExpanded, setPreviewExpanded] = useState(false);
    const [previewOverflows, setPreviewOverflows] = useState(false);

    const collapsedPreviewHeight = isSmallScreen ? 420 : 512;

    const liveResultIndex = useMemo(() => {
        if (workout?.status !== 'IN_PROGRESS') {
            return null;
        }

        return createClientWorkoutResultIndex(results ?? []);
    }, [results, workout?.status]);

    const liveSessionProgress = useMemo(() => {
        if (!workout || !liveResultIndex) {
            return null;
        }

        return buildClientWorkoutSessionProgress(workout, liveResultIndex);
    }, [workout, liveResultIndex]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        setPreviewExpanded(false);
    }, [workout?.id]);

    useLayoutEffect(() => {
        if (!workout || !previewContentRef.current) {
            setPreviewOverflows(false);
            return undefined;
        }

        const content = previewContentRef.current;

        function measurePreview() {
            setPreviewOverflows(
                content.scrollHeight > collapsedPreviewHeight + 1,
            );
        }

        measurePreview();

        const observer = new ResizeObserver(measurePreview);

        observer.observe(content);

        return () => observer.disconnect();
    }, [workout, collapsedPreviewHeight]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Conditional return
    // ------------------------------------------------------------------------------------------------------------------------

    if (!loaded) {
        return (
            <Group gap="sm">
                <Loader size="sm"/>
                <Text size="sm" c="dimmed">
                    Loading initial assessment…
                </Text>
            </Group>
        );
    }

    if (error && !workout) {
        return (
            <Alert color="red">
                {error}
            </Alert>
        );
    }

    if (!workout) {
        return (
            <Stack gap="sm">
                <Text size="sm" c="dimmed">
                    Create an assessment workout plan before the client's
                    first assessment.
                </Text>

                <Group>
                    <InitialAssessmentSetupMenu
                        onNewWorkout={onNewWorkout}
                        onFromTemplate={onFromTemplate}
                    />
                </Group>
            </Stack>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    const counts = getWorkoutStructureCounts(workout);

    const isReady = workout.status === 'READY';
    const isInProgress = workout.status === 'IN_PROGRESS';
    const isCompleted = workout.status === 'COMPLETED';

    const liveProgress = isInProgress ? liveSessionProgress?.progress ?? null : null;
    const liveProgressPercent = liveProgress?.totalSetCount > 0 ? (liveProgress.completedSetCount / liveProgress.totalSetCount) * 100 : 0;
    const activeSetCount = liveProgress ? Math.max(0, liveProgress.startedSetCount - liveProgress.completedSetCount) : 0;

    const shouldClipPreview = previewOverflows && !previewExpanded;

    return (
        <Stack gap="md">
            {error && (
                <Alert color="red">
                    {error}
                </Alert>
            )}
            <Stack gap={4}>
                <Text fw={700}>
                    {workout.name}
                </Text>

                <Text size="sm" c="dimmed">
                    {counts.exerciseCount} exercise{counts.exerciseCount === 1 ? '' : 's'}
                    {' · '}
                    {counts.sectionCount} section{counts.sectionCount === 1 ? '' : 's'}
                </Text>

                {workout.description?.trim() && (
                    <Text
                        size="sm"
                        c="dimmed"
                        style={{whiteSpace: 'pre-wrap'}}
                    >
                        {workout.description}
                    </Text>
                )}

                {liveProgress && (
                    <Paper
                        withBorder
                        radius="md"
                        p="sm"
                        mt="0.5rem"
                        bg="var(--color-workout-exercise-bg)"
                        style={{
                            borderColor: 'var(--color-border)',
                        }}
                    >
                        <Stack gap={7}>
                            <Group justify="space-between" align="center" wrap="nowrap">
                                <Text size="sm" fw={700}>
                                    Workout progress
                                </Text>

                                <Text
                                    size="sm"
                                    fw={600}
                                    c="dimmed"
                                    style={{whiteSpace: 'nowrap'}}
                                >
                                    {liveProgress.completedSetCount}{' / '}{liveProgress.totalSetCount}{' sets'}
                                </Text>
                            </Group>

                            <Progress
                                value={liveProgressPercent}
                                color={liveProgress.totalSetCount > 0 && liveProgress.completedSetCount === liveProgress.totalSetCount ? 'green' : 'yellow'}
                                radius="xl"
                            />

                            <Text size="xs" c="dimmed">
                                {liveProgress.completedItemCount}{' of '}{liveProgress.totalItemCount}{' workout items complete'}
                                {activeSetCount > 0 && (
                                    <>
                                        {' · '}{activeSetCount}{' '}{activeSetCount === 1 ? 'set' : 'sets'}{' in progress'}
                                    </>
                                )}
                            </Text>
                        </Stack>
                    </Paper>
                )}
            </Stack>

            <Box pos="relative">
                <Box
                    style={{
                        maxHeight: shouldClipPreview ? `${collapsedPreviewHeight}px` : undefined,
                        overflow: shouldClipPreview ? 'hidden' : undefined,
                    }}
                >
                    <Box ref={previewContentRef}>
                        <WorkoutStructurePreview
                            workout={workout}
                            benchmarks={benchmarks}
                            liveResultIndex={isInProgress ? liveResultIndex : null}
                        />
                    </Box>
                </Box>

                {shouldClipPreview && (
                    <Box
                        aria-hidden
                        style={{
                            position: 'absolute',
                            right: 0,
                            bottom: 0,
                            left: 0,
                            height: '7rem',
                            pointerEvents: 'none',
                            background: `
                                linear-gradient(
                                    to bottom,
                                    transparent,
                                    var(--color-background) 78%
                                )
                            `,
                        }}
                    />
                )}
            </Box>

            {previewOverflows && (
                <Group justify="center">
                    <Button
                        variant="subtle"
                        size="sm"
                        rightSection={
                            previewExpanded
                                ? <IconChevronUp size={16}/>
                                : <IconChevronDown size={16}/>
                        }
                        onClick={() => {
                            setPreviewExpanded(current => !current);
                        }}
                    >
                        {previewExpanded ? 'Show less' : 'Show more'}
                    </Button>
                </Group>
            )}

            <Box
                pt="md"
                style={{
                    borderTop: '1px solid var(--color-border)',
                }}
            >
                <Group gap="sm" justify="flex-end">
                    {(isReady || isInProgress) && (
                        <>
                            <Tooltip
                                label="You must abandon this workout before you can delete it."
                                hidden={!isInProgress}
                                multiline
                                w={220}
                                offset={4}
                                withArrow
                                arrowSize={8}
                                events={{hover: true, focus: false, touch: true}}
                            >
                                <Button
                                    variant="light"
                                    color="red"
                                    leftSection={<IconTrash size={16}/>}
                                    disabled={isInProgress}
                                    loading={deleting}
                                    onClick={onDelete}
                                >
                                    Delete
                                </Button>
                            </Tooltip>
                            <Button
                                variant="default"
                                leftSection={<IconEdit size={16}/>}
                                onClick={() => onEdit(workout.id)}
                            >
                                Edit
                            </Button>

                            <Button
                                leftSection={<IconPlayerPlay size={16}/>}
                                onClick={isReady ? onStart : () => onOpenSession(workout)}
                                color="green"
                            >
                                {isReady ? 'Start' : 'Resume'}{isSmallScreen ? '' : isReady ? ' Assessment' : ' Workout'}
                            </Button>
                        </>
                    )}
                    {isCompleted && (
                        <Button
                            leftSection={<IconEye size={16}/>}
                            onClick={() => onOpenSession(workout)}
                        >
                            View Record
                        </Button>
                    )}
                </Group>
            </Box>
        </Stack>
    );
}

export default InitialAssessmentRecordCard;