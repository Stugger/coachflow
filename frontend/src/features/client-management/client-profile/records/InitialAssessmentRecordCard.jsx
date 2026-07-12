import {
    useEffect,
    useLayoutEffect,
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
    Stack,
    Text,
} from '@mantine/core';
import {
    IconChevronDown,
    IconChevronUp,
    IconEdit,
    IconTrash,
} from '@tabler/icons-react';

import InitialAssessmentSetupMenu
    from '../../initial-assessment/InitialAssessmentSetupMenu';

import WorkoutStructurePreview
    from '../../../workout-builder/preview/WorkoutStructurePreview';

import {
    getWorkoutStructureCounts,
} from '../../../workout-builder/preview/workout-preview-utils';

function InitialAssessmentRecordCard({workout, benchmarks, loaded, error, deleting, onNewWorkout, onFromTemplate, onEdit, onDelete}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const isSmallScreen = useIsSmallScreen();

    const previewContentRef = useRef(null);

    const [previewExpanded, setPreviewExpanded] = useState(false);
    const [previewOverflows, setPreviewOverflows] = useState(false);

    const collapsedPreviewHeight = isSmallScreen ? 420 : 512;

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

    if (error) {
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

    const shouldClipPreview = previewOverflows && !previewExpanded;

    return (
        <Stack gap="md">
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
            </Stack>

            <Box pos="relative">
                <Box
                    style={{
                        maxHeight: shouldClipPreview
                            ? `${collapsedPreviewHeight}px`
                            : undefined,
                        overflow: shouldClipPreview
                            ? 'hidden'
                            : undefined,
                    }}
                >
                    <Box ref={previewContentRef}>
                        <WorkoutStructurePreview
                            workout={workout}
                            benchmarks={benchmarks}
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
                <Group justify="flex-end">
                    <Button
                        leftSection={<IconEdit size={16}/>}
                        onClick={() => onEdit(workout.id)}
                    >
                        Edit
                    </Button>

                    <Button
                        variant="light"
                        color="red"
                        leftSection={<IconTrash size={16}/>}
                        loading={deleting}
                        onClick={onDelete}
                    >
                        Delete
                    </Button>
                </Group>
            </Box>
        </Stack>
    );
}

export default InitialAssessmentRecordCard;