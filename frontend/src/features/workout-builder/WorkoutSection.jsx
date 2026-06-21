import {
    useMantineTheme,
    getGradient,
    ActionIcon,
    Badge,
    Box,
    Button,
    Collapse,
    Divider,
    Group,
    Menu,
    Paper,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
    Tooltip,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {
    IconArrowDown,
    IconArrowUp,
    IconBarbell,
    IconChevronDown,
    IconChevronUp,
    IconDots,
    IconEdit,
    IconGripVertical,
    IconLink,
    IconPlus,
    IconStackPush,
    IconTrash,
    IconSeparatorHorizontal,
} from '@tabler/icons-react';

import ExerciseItemCard from './ExerciseItemCard';
import WorkoutStackCard from './WorkoutStackCard';
import ExercisePickerModal from './ExercisePickerModal';

import {WORKOUT_ITEM_TYPE, WORKOUT_SECTION_TYPE_OPTIONS, WORKOUT_STACK_OPTIONS} from './workout-builder-constants';
import {getSectionDisplayName, getSectionTypeLabel} from './workout-builder-utils';

function WorkoutSection({section, sectionIndex, sectionCount, expanded, sectionActions, exerciseItemActions, stackActions, exercisePicker}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isMobile = useMediaQuery('(max-width: 48em)');

    // ------------------------------------------------------------------------------------------------------------------------
    // Event actions
    // ------------------------------------------------------------------------------------------------------------------------

    const {
        onToggle,
        onMoveUp,
        onMoveDown,
        onDelete,
        onChange,
    } = sectionActions;

    const {
        onDeleteExerciseItem,
        onMoveExerciseItemUp,
        onMoveExerciseItemDown,
        onAddStack,
    } = exerciseItemActions;

    const {
        onOpenExercisePicker: onOpenExercisePickerForStack,
        onDeleteStack,
        onMoveStackUp,
        onMoveStackDown,
        onChangeStackExercise,
        onDeleteStackExercise,
        onMoveStackExerciseUp,
        onMoveStackExerciseDown,
    } = stackActions;

    const {
        exercises,
        opened: exercisePickerOpened,
        onOpen: onOpenExercisePicker,
        onClose: onCloseExercisePicker,
        onAdd: onAddExercise,
    } = exercisePicker;

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------


    const headerGradient = getGradient({deg: 90, from: '#2a307a', to: '#23233f'}, useMantineTheme());

    const itemCount = section.items?.length ?? 0;
    const sectionName = getSectionDisplayName(section);
    const sectionTypeLabel = getSectionTypeLabel(section.sectionType);

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderAddItemButtons() {
        return (
            <Group justify="flex-end">
                <Menu withinPortal position="bottom-end">
                    <Menu.Target>
                        <Button
                            size={isMobile ? 'xs' : 'sm'}
                            variant="light"
                            leftSection={<IconPlus size={16}/>}
                        >
                            Add Item
                        </Button>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item
                            key={'exercise'}
                            onClick={onOpenExercisePicker}
                            leftSection={<IconBarbell size={18}/>}
                        >
                            Exercise
                        </Menu.Item>
                        <Menu.Divider />
                        {WORKOUT_STACK_OPTIONS.map(option => (
                            <Menu.Item
                                key={option.value}
                                onClick={() => onAddStack(option.value)}
                                leftSection={option.icon ? <option.icon size={18} color={`var(--mantine-color-${option.color}-6)`}/> : ""}
                            >
                                {option.label}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
            </Group>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Box>
            <ExercisePickerModal
                opened={exercisePickerOpened}
                exercises={exercises}
                onClose={onCloseExercisePicker}
                onAdd={onAddExercise}
            />

            <Paper
                withBorder
                radius="md"
                bg="var(--color-background)"
                style={{overflow: 'hidden'}}
            >
                <Box
                    style={{
                        borderBottom: '1px solid var(--color-border)',
                        background: headerGradient,
                        color: 'white',
                    }}
                >
                    <Group justify="space-between" wrap="nowrap" px="md" py="sm">
                        <Group gap={6} wrap="nowrap" style={{minWidth: 0}}>
                            <IconGripVertical size={18} opacity={0.65}/>

                            <Tooltip label={expanded ? 'Collapse section settings' : 'Expand section settings'}>
                                <ActionIcon variant="subtle" color="black" onClick={onToggle}>
                                    {expanded
                                        ? <IconChevronUp size={18} color="white"/>
                                        : <IconChevronDown size={18} color="white"/>
                                    }
                                </ActionIcon>
                            </Tooltip>

                            <Group gap="xs" wrap="nowrap" style={{minWidth: 0}}>
                                <Text fw={700} truncate>
                                    {sectionName}
                                </Text>

                                <Badge size="xs" variant="outline" color="white">
                                    {sectionTypeLabel}
                                </Badge>

                                <Badge size="xs" variant="dot" color="white" bg="transparent" styles={{
                                    root: {
                                        borderColor: "white",
                                    },
                                    label: {
                                        color: "white"
                                    }
                                }}>
                                    {itemCount} item{itemCount === 1 ? '' : 's'}
                                </Badge>
                            </Group>
                        </Group>

                        <Menu withinPortal position="bottom-end">
                            <Menu.Target>
                                <Tooltip label="Section options" position="top-end">
                                    <ActionIcon variant="subtle" color="black">
                                        <IconDots size={18} color="white"/>
                                    </ActionIcon>
                                </Tooltip>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconEdit size={14}/>}
                                    onClick={onToggle}
                                >
                                    Edit section
                                </Menu.Item>
                                <Menu.Divider/>
                                <Menu.Item
                                    disabled={sectionIndex === 0}
                                    leftSection={<IconArrowUp size={14}/>}
                                    onClick={onMoveUp}
                                >
                                    Move up
                                </Menu.Item>
                                <Menu.Item
                                    disabled={sectionIndex === sectionCount - 1}
                                    leftSection={<IconArrowDown size={14}/>}
                                    onClick={onMoveDown}
                                >
                                    Move down
                                </Menu.Item>
                                <Menu.Divider/>
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={14}/>}
                                    onClick={onDelete}
                                >
                                    Delete section
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Box>

                <Collapse expanded={expanded}>
                    <Box style={{padding: 'var(--mantine-spacing-md)', paddingBottom: 0}}>
                        <Stack gap="md">
                            <Group grow align="flex-start">
                                <TextInput
                                    label="Section name"
                                    placeholder="Warm Up"
                                    value={section.name || ''}
                                    onChange={event => onChange({name: event.currentTarget.value})}
                                />

                                <Select
                                    label="Section type"
                                    data={WORKOUT_SECTION_TYPE_OPTIONS}
                                    value={section.sectionType || 'REGULAR'}
                                    onChange={value => onChange({sectionType: value || 'REGULAR'})}
                                    allowDeselect={false}
                                />
                            </Group>
                        </Stack>
                    </Box>
                </Collapse>

                <Box style={{padding: 'var(--mantine-spacing-md)', paddingBottom: 0}}>
                    <Textarea
                        classNames={{input: 'subtleInput'}}
                        variant="unstyled"
                        placeholder="Add instructions or notes for this section"
                        value={section.notes || ''}
                        onChange={event => onChange({notes: event.currentTarget.value})}
                        autosize
                    />
                </Box>

                <Box p="md">
                    {itemCount === 0 && (
                        <Paper withBorder radius="md" p="lg">
                            <Stack gap="sm" align="center">
                                <Text fw={700}>No exercises in this section</Text>
                                <Text size="sm" c="dimmed" ta="center">
                                    Add exercises or vertical stacks here next.
                                </Text>
                                {renderAddItemButtons()}
                            </Stack>
                        </Paper>
                    )}

                    {itemCount > 0 && (
                        <Stack>
                            <Box mx="calc(var(--mantine-spacing-md) * -1)">
                                <Stack gap={0}>
                                    {(section.items ?? []).map((item, itemIndex) => {
                                        if (item.itemType === WORKOUT_ITEM_TYPE.EXERCISE) {
                                            return (
                                                <ExerciseItemCard
                                                    key={item.draftId || item.id}
                                                    item={item}
                                                    itemIndex={itemIndex}
                                                    itemCount={section.items.length}
                                                    independent={true}
                                                    onChange={updates => onChange({
                                                        items: section.items.map((currentItem, index) => (
                                                            index === itemIndex
                                                                ? {...currentItem, ...updates}
                                                                : currentItem
                                                        )),
                                                    })}
                                                    onDelete={() => onDeleteExerciseItem(itemIndex)}
                                                    onMoveUp={() => onMoveExerciseItemUp(itemIndex)}
                                                    onMoveDown={() => onMoveExerciseItemDown(itemIndex)}
                                                />
                                            );
                                        }

                                        return (
                                            <WorkoutStackCard
                                                key={item.draftId || item.id}
                                                stack={item}
                                                itemIndex={itemIndex}
                                                itemCount={section.items.length}
                                                onChange={updates => onChange({
                                                    items: section.items.map((currentItem, index) => (
                                                        index === itemIndex
                                                            ? {...currentItem, ...updates}
                                                            : currentItem
                                                    )),
                                                })}
                                                onAddExercise={() => onOpenExercisePickerForStack(itemIndex)}
                                                onDeleteStack={() => onDeleteStack(itemIndex)}
                                                onMoveStackUp={() => onMoveStackUp(itemIndex)}
                                                onMoveStackDown={() => onMoveStackDown(itemIndex)}
                                                onChangeStackExercise={(exerciseIndex, updates) => (
                                                    onChangeStackExercise(itemIndex, exerciseIndex, updates)
                                                )}
                                                onDeleteStackExercise={exerciseIndex => (
                                                    onDeleteStackExercise(itemIndex, exerciseIndex)
                                                )}
                                                onMoveStackExerciseUp={exerciseIndex => (
                                                    onMoveStackExerciseUp(itemIndex, exerciseIndex)
                                                )}
                                                onMoveStackExerciseDown={exerciseIndex => (
                                                    onMoveStackExerciseDown(itemIndex, exerciseIndex)
                                                )}
                                            />
                                        );
                                    })}
                                </Stack>
                            </Box>

                            {renderAddItemButtons()}
                        </Stack>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

export default WorkoutSection;