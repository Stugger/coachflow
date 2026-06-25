import {
    ActionIcon,
    Avatar,
    Badge,
    Group,
    Menu,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Tooltip,
} from '@mantine/core';
import {
    IconVideo,
    IconCopy,
    IconDotsVertical,
    IconEye,
    IconPhoto,
    IconPencil,
    IconTrash,
} from '@tabler/icons-react';

import {
    EQUIPMENT_OPTIONS,
    EXERCISE_DIFFICULTY_OPTIONS,
    EXERCISE_TAG_OPTIONS,
    MUSCLE_OPTIONS,
} from '../../constants/exercises.js';

function ExerciseListRow({exercise, detailedView, metadata, isMobile, onView, onCopy, onEdit, onArchive}) {

    const isGlobal = exercise.visibility === 'GLOBAL';
    const isTrainerOwned = exercise.visibility === 'TRAINER';

    function findOptionLabel(options, value) {
        return options.find(option => option.value === value)?.label || value;
    }

    function formatOptionLabels(options, values, fallback = '—') {
        if (!values || values.length === 0) {
            return fallback;
        }

        return values
            .map(value => findOptionLabel(options, value))
            .join(', ');
    }

    function renderExerciseThumbnail() {
        if (!exercise.thumbnailUrl) {
            return (
                <Avatar size={56}
                        radius="md"
                        variant="light"
                        onClick={() => onView(exercise)}
                        style={{
                            cursor: 'pointer',
                        }}
                >
                    <IconPhoto size={24}/>
                </Avatar>
            );
        }

        return (
            <Avatar
                src={exercise.thumbnailUrl}
                alt={exercise.name}
                size={56}
                radius="sm"
                onClick={() => onView(exercise)}
                style={{
                    cursor: 'pointer',
                }}
            />
        );
    }

    function renderExerciseName() {
        return (
            <Text
                fw={700}
                lineClamp={1}
                role="button"
                tabIndex={0}
                onClick={() => onView(exercise)}
                onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onView(exercise);
                    }
                }}
                style={{
                    cursor: 'pointer',
                    width: 'fit-content',
                }}
            >
                {exercise.name}
            </Text>
        );
    }

    function renderDifficultyBadge() {
        if (!metadata.difficulty) {
            return null;
        }

        return (
            <Badge size="sm" color="violet" variant="light">
                {findOptionLabel(EXERCISE_DIFFICULTY_OPTIONS, metadata.difficulty)}
            </Badge>
        );
    }

    function renderTags() {
        if (metadata.tags.length === 0) {
            return null;
        }

        return (
            <Group gap={4}>
                {metadata.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} size="xs" color="teal" variant="light">
                        {findOptionLabel(EXERCISE_TAG_OPTIONS, tag)}
                    </Badge>
                ))}

                {metadata.tags.length > 3 && (
                    <Badge size="xs" color="gray" variant="light">
                        +{metadata.tags.length - 3}
                    </Badge>
                )}
            </Group>
        );
    }

    return (
        <Paper withBorder p="sm" radius="md">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Group align="flex-start" wrap="nowrap" style={{flex: 1, minWidth: 0}}>
                    {renderExerciseThumbnail()}

                    <Stack gap={detailedView ? 6 : 2} style={{flex: 1, minWidth: 0}}>
                        {isMobile ? (
                            <Stack gap={0}>
                                {renderExerciseName()}

                                <Group gap={6}>
                                    {exercise.demoVideoUrl && (<IconVideo size={16}/>)}

                                    <Badge size="sm" color={isGlobal ? 'blue' : 'green'} variant="light">
                                        {isGlobal ? 'Global' : 'Mine'}
                                    </Badge>

                                    {renderDifficultyBadge(metadata)}
                                </Group>
                            </Stack>
                        ) : (
                            <Group gap="xs" wrap="wrap">
                                {renderExerciseName()}

                                {exercise.demoVideoUrl && (<IconVideo size={16}/>)}

                                <Badge size="sm" color={isGlobal ? 'blue' : 'green'} variant="light">
                                    {isGlobal ? 'Global' : 'Mine'}
                                </Badge>

                                {renderDifficultyBadge(metadata)}
                            </Group>
                        )}

                        {exercise.details && (
                            <Text
                                size="sm"
                                c="dimmed"
                                lineClamp={detailedView ? 3 : 2}
                                style={{whiteSpace: 'pre-wrap'}}
                            >
                                {exercise.details}
                            </Text>
                        )}

                        {detailedView && (
                            <SimpleGrid cols={{base: 1, sm: 3}} spacing="xs">
                                <Stack gap={2}>
                                    <Text size="xs" c="dimmed" fw={700}>Primary</Text>
                                    <Text size="sm">
                                        {formatOptionLabels(MUSCLE_OPTIONS, metadata.primaryMuscles)}
                                    </Text>
                                </Stack>

                                <Stack gap={2}>
                                    <Text size="xs" c="dimmed" fw={700}>Equipment</Text>
                                    <Text size="sm">
                                        {formatOptionLabels(EQUIPMENT_OPTIONS, metadata.equipment)}
                                    </Text>
                                </Stack>

                                <Stack gap={2}>
                                    <Text size="xs" c="dimmed" fw={700}>Tags</Text>
                                    {renderTags() || (
                                        <Text size="sm">—</Text>
                                    )}
                                </Stack>
                            </SimpleGrid>
                        )}
                    </Stack>

                    <Menu shadow="md" position="bottom-end">
                        <Menu.Target>
                            <Tooltip label="Options" position="top-end">
                                <ActionIcon variant="subtle" color="gray" size="md" mr={isMobile ? -2 : 0} style={{alignSelf: 'center'}}>
                                    <IconDotsVertical size={18}/>
                                </ActionIcon>
                            </Tooltip>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconEye size={16}/>}
                                onClick={() => onView(exercise)}
                            >
                                View
                            </Menu.Item>

                            <Menu.Item
                                leftSection={<IconCopy size={16}/>}
                                onClick={() => onCopy(exercise)}
                            >
                                {isGlobal ? 'Copy to mine' : 'Copy'}
                            </Menu.Item>

                            {isTrainerOwned && (
                                <>
                                    <Menu.Item
                                        leftSection={<IconPencil size={16}/>}
                                        onClick={() => onEdit(exercise)}
                                    >
                                        Edit
                                    </Menu.Item>

                                    <Menu.Divider/>

                                    <Menu.Item
                                        color="red"
                                        leftSection={<IconTrash size={16}/>}
                                        onClick={() => onArchive(exercise)}
                                    >
                                        Archive
                                    </Menu.Item>
                                </>
                            )}
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>
        </Paper>
    );
}

export default ExerciseListRow;