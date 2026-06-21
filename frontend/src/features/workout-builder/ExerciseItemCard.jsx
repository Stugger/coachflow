import {
    ActionIcon,
    Avatar,
    Group,
    Menu,
    Paper,
    Stack,
    Text,
    TextInput,
    Tooltip,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {
    IconPencilExclamation,
    IconArrowDown,
    IconArrowUp,
    IconDots,
    IconEye,
    IconLink,
    IconPhoto,
    IconTrash,
} from '@tabler/icons-react';

function ExerciseItemCard({item, itemIndex, itemCount, independent, onChange, onDelete, onMoveUp, onMoveDown}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isMobile = useMediaQuery('(max-width: 48em)');

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const exercise = item.exercise;

    const hasNameOverride =
        Boolean(item.name?.trim()) &&
        item.name.trim() !== exercise?.name?.trim();

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderExerciseThumbnail() {
        if (!exercise?.thumbnailUrl) {
            return (
                <Avatar
                    size={42}
                    radius="md"
                    variant="light"
                    style={{cursor: 'pointer'}}
                >
                    <IconPhoto size={24}/>
                </Avatar>
            );
        }

        return (
            <Avatar
                src={exercise.thumbnailUrl}
                alt={exercise.name}
                size={42}
                radius="md"
                style={{cursor: 'pointer'}}
            />
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            <Paper
                withBorder
                radius="sm"
                p={isMobile ? 'md' : 'lg'}
            >
                <Stack gap={isMobile ? 'sm' : 'md'}>
                    <Group justify="space-between" align="center" wrap="nowrap" gap="md">
                        {renderExerciseThumbnail()}

                        <TextInput
                            classNames={{input: 'subtleInput'}}
                            fw={600}
                            variant="filled"
                            placeholder="Name this exercise"
                            leftSection={
                                hasNameOverride && (
                                    <Tooltip label="Custom exercise name" events={{ hover: true, focus: false, touch: true }}>
                                        <IconPencilExclamation
                                            size={18}
                                            color="var(--mantine-color-blue-6)"
                                            style={{flexShrink: 0}}
                                        />
                                    </Tooltip>
                                )
                            }
                            value={item.name || exercise?.name || ''}
                            onChange={event => onChange({
                                name: event.currentTarget.value,
                            })}
                            required
                            style={{
                                flex: 1,
                                minWidth: 0,
                            }}
                            styles={{
                                input: {
                                    paddingLeft: hasNameOverride ? '2rem' : undefined,
                                }
                            }}
                        />

                        <Menu withinPortal position="bottom-end">
                            <Menu.Target>
                                <Tooltip label="Exercise options" position="top-end">
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        style={{flexShrink: 0}}
                                    >
                                        <IconDots size={18}/>
                                    </ActionIcon>
                                </Tooltip>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconEye size={14}/>}
                                    disabled
                                >
                                    View exercise
                                </Menu.Item>
                                <Menu.Divider/>
                                <Menu.Item
                                    leftSection={<IconArrowUp size={14}/>}
                                    disabled={itemIndex === 0}
                                    onClick={onMoveUp}
                                >
                                    Move up
                                </Menu.Item>

                                <Menu.Item
                                    leftSection={<IconArrowDown size={14}/>}
                                    disabled={itemIndex === itemCount - 1}
                                    onClick={onMoveDown}
                                >
                                    Move down
                                </Menu.Item>

                                <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={14}/>}
                                    onClick={onDelete}
                                >
                                    Delete
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>

                    <Text size="sm" c="dimmed">
                        Tracking fields and sets will go here.
                    </Text>
                </Stack>
            </Paper>

            {independent && itemIndex !== itemCount - 1 && (
                <Group gap={0} mb="sm" mt="sm" wrap="nowrap" justify="center">
                    <IconLink opacity={0.4} size={20}/>
                </Group>
            )}
        </>
    );
}

export default ExerciseItemCard;