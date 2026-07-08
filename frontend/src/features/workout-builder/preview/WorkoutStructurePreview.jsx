import {
    Badge,
    Box,
    Group,
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

// ------------------------------------------------------------------------------------------------------------------------
// Workout structure
// ------------------------------------------------------------------------------------------------------------------------

function WorkoutStructurePreview({workout}) {
    const sections = sortWorkoutPreviewItems(workout?.sections ?? []);

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

    return (
        <Stack gap="md">
            {sections.map((section, sectionIndex) => (
                <WorkoutSectionPreview
                    key={getWorkoutPreviewKey(
                        section,
                        `section-${sectionIndex}`,
                    )}
                    section={section}
                />
            ))}
        </Stack>
    );
}

// ------------------------------------------------------------------------------------------------------------------------
// Workout section
// ------------------------------------------------------------------------------------------------------------------------

function WorkoutSectionPreview({section}) {

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