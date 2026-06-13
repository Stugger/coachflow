import {
    Badge,
    Button,
    Divider,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import {
    IconDumbbell,
    IconFlag,
    IconFocus,
    IconPhoto,
    IconTag,
    IconTarget,
    IconCopy,
    IconEdit,
    IconTrash,
} from '@tabler/icons-react';

import ExerciseVideoPreview from './ExerciseVideoPreview.jsx';

import {
    EQUIPMENT_OPTIONS,
    EXERCISE_DIFFICULTY_OPTIONS,
    EXERCISE_TAG_OPTIONS,
    MUSCLE_OPTIONS,
} from '../../constants/exercises.js';

const emptyMetadata = {
    equipment: [],
    primaryMuscles: [],
    secondaryMuscles: [],
    difficulty: '',
    tags: [],
};

function ExerciseViewer({exercise, showLibraryActions = false, onClose, onCopy, onEdit, onArchive}) {

    const metadata = parseMetadataJson(exercise?.metadataJson);
    const isGlobal = exercise?.visibility === 'GLOBAL';
    const isTrainerOwned = exercise?.visibility === 'TRAINER';

    function parseMetadataJson(metadataJson) {
        if (!metadataJson) {
            return emptyMetadata;
        }

        try {
            const parsedMetadata = JSON.parse(metadataJson);

            return {
                equipment: Array.isArray(parsedMetadata.equipment) ? parsedMetadata.equipment : [],
                primaryMuscles: Array.isArray(parsedMetadata.primaryMuscles) ? parsedMetadata.primaryMuscles : [],
                secondaryMuscles: Array.isArray(parsedMetadata.secondaryMuscles) ? parsedMetadata.secondaryMuscles : [],
                difficulty: parsedMetadata.difficulty || '',
                tags: Array.isArray(parsedMetadata.tags) ? parsedMetadata.tags : [],
            };
        } catch (error) {
            console.error('Error parsing exercise metadata:', error);
            return emptyMetadata;
        }
    }

    function findOptionLabel(options, value) {
        return options.find(option => option.value === value)?.label || value;
    }

    function renderOptionBadges(options, values, color = 'gray') {
        if (!values || values.length === 0) {
            return <Text size="sm" c="dimmed">—</Text>;
        }

        return (
            <Group gap={6}>
                {values.map(value => (
                    <Badge key={value} color={color} variant="light">
                        {findOptionLabel(options, value)}
                    </Badge>
                ))}
            </Group>
        );
    }

    function renderMetadataRow(icon, label, content) {
        return (
            <Stack gap={4}>
                <Group gap={6}>
                    {icon}
                    <Text size="sm" fw={700}>
                        {label}
                    </Text>
                </Group>

                {content}
            </Stack>
        );
    }

    function renderVisibilityBadge() {
        if (!exercise?.visibility) {
            return null;
        }

        return (
            <Badge color={isGlobal ? 'blue' : 'green'} variant="light" w="fit-content">
                {isGlobal ? 'Global' : 'Mine'}
            </Badge>
        );
    }

    function renderActions() {
        if (!showLibraryActions) {
            return (
                <Group justify="flex-end">
                    <Button type="button" variant="light" onClick={onClose}>
                        Close
                    </Button>
                </Group>
            );
        }

        return (
            <Group justify="flex-end">

                    <Button type="button" variant="light" leftSection={<IconCopy size={16}/>} onClick={onCopy}>
                        {isGlobal ? 'Copy to mine' : 'Copy'}
                    </Button>

                {isTrainerOwned && (
                    <>
                        <Button type="button" variant="light" leftSection={<IconEdit size={16}/>} onClick={onEdit}>
                            Edit
                        </Button>

                        <Button type="button" color="red" variant="light" leftSection={<IconTrash size={16}/>} onClick={onArchive}>
                            Archive
                        </Button>
                    </>
                )}

                <Button type="button" variant="subtle" onClick={onClose}>
                    Close
                </Button>
            </Group>
        );
    }

    if (!exercise) {
        return null;
    }

    return (
        <Stack gap="md">
            <Group align="flex-start" wrap="nowrap">
                <Paper
                    withBorder
                    radius="md"
                    p="xs"
                    style={{
                        width: '7rem',
                        height: '7rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                    }}
                >
                    {exercise.thumbnailUrl ? (
                        <img
                            src={exercise.thumbnailUrl}
                            alt={exercise.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '0.4rem',
                            }}
                        />
                    ) : (
                        <Stack gap={4} align="center">
                            <IconPhoto size={28}/>
                            <Text size="xs" c="dimmed" ta="center">
                                No thumbnail
                            </Text>
                        </Stack>
                    )}
                </Paper>

                <Stack gap={6} style={{flex: 1, minWidth: 0}}>
                    <Title order={3}>
                        {exercise.name || 'Untitled exercise'}
                    </Title>

                    <Group gap="xs">
                        {renderVisibilityBadge()}

                        {metadata.difficulty && (
                            <Badge color="violet" variant="light" w="fit-content">
                                {findOptionLabel(EXERCISE_DIFFICULTY_OPTIONS, metadata.difficulty)}
                            </Badge>
                        )}
                    </Group>
                </Stack>
            </Group>

            {exercise.demoVideoUrl && (
                <>
                    <Divider label="Demo Video" labelPosition="left"/>

                    <ExerciseVideoPreview
                        url={exercise.demoVideoUrl}
                        title={`${exercise.name} demo video`}
                    />
                </>
            )}

            <Divider label="Details / Instructions" labelPosition="left"/>

            <Paper withBorder radius="md" p="md">
                {exercise.details ? (
                    <Text size="sm" style={{whiteSpace: 'pre-wrap'}}>
                        {exercise.details}
                    </Text>
                ) : (
                    <Text size="sm" c="dimmed">
                        No details provided.
                    </Text>
                )}
            </Paper>

            <Divider label="Metadata" labelPosition="left"/>

            <SimpleGrid cols={{base: 1, sm: 2}}>
                <Paper withBorder radius="md" p="md">
                    {renderMetadataRow(
                        <IconTarget size={16}/>,
                        'Primary Muscles',
                        renderOptionBadges(MUSCLE_OPTIONS, metadata.primaryMuscles, 'red')
                    )}
                </Paper>

                <Paper withBorder radius="md" p="md">
                    {renderMetadataRow(
                        <IconFocus size={16}/>,
                        'Secondary Muscles',
                        renderOptionBadges(MUSCLE_OPTIONS, metadata.secondaryMuscles, 'orange')
                    )}
                </Paper>

                <Paper withBorder radius="md" p="md">
                    {renderMetadataRow(
                        <IconDumbbell size={16}/>,
                        'Equipment',
                        renderOptionBadges(EQUIPMENT_OPTIONS, metadata.equipment, 'gray')
                    )}
                </Paper>

                <Paper withBorder radius="md" p="md">
                    {renderMetadataRow(
                        <IconFlag size={16}/>,
                        'Difficulty',
                        metadata.difficulty ? (
                            <Badge color="violet" variant="light">
                                {findOptionLabel(EXERCISE_DIFFICULTY_OPTIONS, metadata.difficulty)}
                            </Badge>
                        ) : (
                            <Text size="sm" c="dimmed">—</Text>
                        )
                    )}
                </Paper>

                <Paper withBorder radius="md" p="md">
                    {renderMetadataRow(
                        <IconTag size={16}/>,
                        'Tags',
                        renderOptionBadges(EXERCISE_TAG_OPTIONS, metadata.tags, 'teal')
                    )}
                </Paper>
            </SimpleGrid>

            {renderActions()}
        </Stack>
    );
}

export default ExerciseViewer;