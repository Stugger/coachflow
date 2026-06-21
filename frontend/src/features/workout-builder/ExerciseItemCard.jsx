import {useState} from 'react';
import {
    useComputedColorScheme,
    ActionIcon,
    Avatar,
    Collapse,
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
    IconEdit,
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

    const computedColorScheme = useComputedColorScheme('light');

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [customizingFields, setCustomizingFields] = useState(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const shadow = computedColorScheme === 'light' ? "var(--mantine-shadow-lg)" : "0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)"

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
                radius="sm"
                p={isMobile ? 'md' : 'lg'}
                shadow={shadow}
                style={{
                    border: '1px solid var(--color-border)'
                }}
            >
                <Stack gap={isMobile ? 'sm' : 'md'}>
                    <Group justify="space-between" align="center" wrap="nowrap" gap="md">
                        {renderExerciseThumbnail()}

                        <TextInput
                            fw={600}
                            variant={computedColorScheme === 'light' ? "filled" : "default"}
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

                                <Menu.Item
                                    leftSection={<IconEdit size={14}/>}
                                    onClick={() => setCustomizingFields(true)}
                                >
                                    Customize fields
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
                                    Delete exercise
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>

                    <Collapse expanded={customizingFields}>
                        <ExerciseTrackingConfig
                            item={item}
                            onClose={() => setCustomizingFields(false)}
                            onSave={updates => {
                                onChange(updates);
                                setCustomizingFields(false);
                            }}
                        />
                    </Collapse>
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

function ExerciseTrackingConfig({item, onClose, onSave}) {
    return (
        <Paper
            radius="sm"
            p="sm"
            bg="var(--color-background)"
            shadow="none"
        >
            <Text size="sm" c="dimmed">
                Tracking field configuration goes here!
            </Text>
        </Paper>
    );
}

export default ExerciseItemCard;