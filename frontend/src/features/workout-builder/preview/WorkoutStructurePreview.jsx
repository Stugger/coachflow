import {useState} from 'react'
import {
    Badge,
    Box,
    Drawer,
    Group,
    Modal,
    Paper,
    Stack,
    Text,
    getGradient,
    useMantineTheme,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';

import WorkoutItemPreview from './WorkoutItemPreview';

import {
    getSectionDisplayName,
    getSectionTypeLabel,
} from '../workout-builder-utils';

import {
    getWorkoutPreviewKey,
    sortWorkoutPreviewItems,
} from './workout-preview-utils';

import ExerciseViewer from "../../exercises/components/ExerciseViewer.jsx";

// ------------------------------------------------------------------------------------------------------------------------
// Workout structure
// ------------------------------------------------------------------------------------------------------------------------

function WorkoutStructurePreview({workout}) {

    const isMobile = useMediaQuery('(max-width: 48em)');

    const sections = sortWorkoutPreviewItems(workout?.sections ?? []);

    const [exerciseOverlay, setExerciseOverlay] = useState(null);

    if (sections.length === 0) {
        return (
            <Paper withBorder radius="md" p="lg">
                <Stack gap={4} align="center">
                    <Text fw={700}>No sections added yet</Text>
                    <Text size="sm" c="dimmed" ta="center">
                        Edit this workout to add exercises and tracking targets.
                    </Text>
                </Stack>
            </Paper>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderExerciseOverlay() {
        if (!exerciseOverlay) {
            return null;
        }

        const content = (
            <ExerciseViewer
                exercise={exerciseOverlay.exercise}
                onClose={() => setExerciseOverlay(null)}
            />
        );

        if (isMobile) {
            return (
                <Drawer
                    opened
                    onClose={() => setExerciseOverlay(null)}
                    title="Exercise"
                    position="bottom"
                    size="100%"
                    zIndex={300}
                    styles={{
                        title: {fontSize: '1.2rem'},
                        body: {paddingBottom: '2rem'},
                    }}
                >
                    {content}
                </Drawer>
            );
        }

        return (
            <Modal
                opened
                onClose={() => setExerciseOverlay(null)}
                title="Exercise"
                centered
                size="48rem"
                zIndex={300}
                styles={{
                    title: {fontSize: '1.2rem'},
                }}
            >
                {content}
            </Modal>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            {renderExerciseOverlay()}
            <Stack gap="md">
                {sections.map((section, sectionIndex) => (
                    <WorkoutSectionPreview
                        key={getWorkoutPreviewKey(
                            section,
                            `section-${sectionIndex}`,
                        )}
                        section={section}
                        onViewExercise={(exercise) => {
                            setExerciseOverlay({
                                mode: 'VIEW',
                                exercise,
                            })
                        }}
                    />
                ))}
            </Stack>
        </>
    );
}

// ------------------------------------------------------------------------------------------------------------------------
// Workout section
// ------------------------------------------------------------------------------------------------------------------------

function WorkoutSectionPreview({section, onViewExercise}) {

    const isMobile = useMediaQuery('(max-width: 48em)');
    const theme = useMantineTheme();

    const headerGradient = getGradient({deg: 90, from: '#2a307a', to: '#23233f',}, theme);

    const items = sortWorkoutPreviewItems(section.items ?? []);

    return (
        <Paper
            withBorder
            radius="md"
            bg="var(--color-background)"
        >
            <Box
                px="md"
                py="sm"
                style={{
                    background: headerGradient,
                    color: 'white',
                    borderBottom: '1px solid var(--color-border)',
                    borderTopLeftRadius: 'var(--mantine-radius-md)',
                    borderTopRightRadius: 'var(--mantine-radius-md)',
                }}
            >
                <Group gap="xs" wrap="nowrap" style={{minWidth: 0}}>
                    <Text fw={700} truncate>
                        {getSectionDisplayName(section)}
                    </Text>

                    <Badge size="xs" variant="outline" color="white">
                        {getSectionTypeLabel(section.sectionType)}
                    </Badge>

                    <Badge
                        size="xs"
                        variant="dot"
                        color="white"
                        bg="transparent"
                        styles={{
                            root: { borderColor: 'white' },
                            label: { color: 'white' },
                        }}
                    >
                        {items.length} item{items.length === 1 ? '' : 's'}
                    </Badge>
                </Group>
            </Box>

            <Stack gap={(isMobile ? 'xs' : 'sm')} p={isMobile ? "xs" : "md"}>
                {section.notes?.trim() && (
                    <Text
                        size="sm"
                        c="dimmed"
                        fs="italic"
                        style={{whiteSpace: 'pre-wrap'}}
                    >
                        {section.notes}
                    </Text>
                )}

                {items.map((item, itemIndex) => (
                    <WorkoutItemPreview
                        key={getWorkoutPreviewKey(item, `item-${itemIndex}`)}
                        item={item}
                        onViewExercise={onViewExercise}
                    />
                ))}

                {items.length === 0 && (
                    <Text size="sm" c="dimmed">
                        No exercises in this section.
                    </Text>
                )}
            </Stack>
        </Paper>
    );
}

export default WorkoutStructurePreview;