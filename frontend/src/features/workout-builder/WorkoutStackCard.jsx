import {
    useComputedColorScheme,
    useMantineTheme,
    getGradient,
    ActionIcon,
    Badge,
    Box,
    Button,
    Collapse,
    Group,
    Menu,
    NumberInput,
    Paper,
    Select,
    Stack,
    Text,
    Textarea,
    Tooltip,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {
    IconArrowDown,
    IconArrowUp,
    IconCheck,
    IconChevronDown,
    IconChevronUp,
    IconDots,
    IconEdit,
    IconLink,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';
import {useState} from 'react';

import ExerciseItemCard from './ExerciseItemCard';

import {
    getStackOption,
    getStackRequirement,
    isStackComplete,
    canAddExerciseToStack,
} from './workout-builder-utils';
import {WORKOUT_STACK_OPTIONS} from './workout-builder-constants';

function WorkoutStackCard({stack, itemIndex, itemCount, onChange, onAddExercise, onDeleteStack, onMoveStackUp, onMoveStackDown, onChangeStackExercise, onDeleteStackExercise, onMoveStackExerciseUp, onMoveStackExerciseDown}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isMobile = useMediaQuery('(max-width: 48em)');

    const computedColorScheme = useComputedColorScheme('light');

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [expanded, setExpanded] = useState(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const option = getStackOption(stack.itemType);
    const exerciseCount = stack.itemExercises?.length ?? 0;
    const complete = isStackComplete(stack);

    const headerGradient = getGradient({deg: 90, from: `${option?.color ?? 'gray'}.6`, to: 'var(--color-background)'}, useMantineTheme());
    const shadow = computedColorScheme === 'light' ? "var(--mantine-shadow-lg)" : "0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)"

    const stackTypeOptions = WORKOUT_STACK_OPTIONS.map(option => ({
        value: option.value,
        label: option.label,
        color: option.color,
        icon: option.icon,
        disabled:
            (option.value === 'SUPERSET' && exerciseCount > 2) ||
            (option.value === 'TRISET' && exerciseCount > 3),
    }));

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            <Box
                style={{
                    borderLeft: `3px solid var(--mantine-color-${option?.color ?? 'gray'}-4)`,
                    marginLeft: isMobile ? 0 : 'var(--mantine-spacing-sm)',
                    paddingLeft: isMobile ? 'var(--mantine-spacing-xs)' : 'var(--mantine-spacing-sm)',
                }}
            >
                <Paper
                    withBorder
                    radius="sm"
                    shadow={shadow}
                    style={{
                        overflow: 'hidden',
                        backgroundColor: 'var(--color-background)',
                        border: 'none',
                        borderTop: '1px solid var(--color-border)',
                        borderBottom: '1px solid var(--color-border)',
                        borderLeft: '1px solid var(--color-border)'
                    }}
                >
                    <Box
                        px="sm"
                        py={4}
                        pr="md"
                        bg={headerGradient}
                        c="white"
                    >
                        <Group justify="space-between" wrap="nowrap">
                            <Group gap={6}>
                                {option.icon && (
                                    <option.icon size={18} opacity={0.65}/>
                                )}
                                <ActionIcon
                                    variant="subtle"
                                    color="black"
                                    onClick={() => setExpanded(current => !current)}
                                >
                                    {expanded
                                        ? <IconChevronUp size={16} color="white"/>
                                        : <IconChevronDown size={16} color="white"/>
                                    }
                                </ActionIcon>

                                <Group gap="sm" wrap="nowrap" style={{minWidth: 0}}>
                                    <Text size="sm" fw={800}>
                                        {option?.label?.toUpperCase() ?? 'STACK'}
                                    </Text>

                                    <Badge size="xs" variant="dot" color="white" bg="transparent" styles={{
                                        root: {
                                            borderColor: "white",
                                        },
                                        label: {
                                            color: "white"
                                        }
                                    }}>

                                        {stack.rounds ?? 3} round{stack.rounds === 1 ? '' : 's'}
                                    </Badge>
                                </Group>
                            </Group>

                            <Menu withinPortal position="bottom-end">
                                <Menu.Target>
                                    <Tooltip label="Stack options">
                                        <ActionIcon variant="subtle" color={computedColorScheme === 'light' ? 'gray' : "white"}>
                                            <IconDots size={18} color={computedColorScheme === 'light' ? 'black' : "white"}/>
                                        </ActionIcon>
                                    </Tooltip>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Item
                                        leftSection={<IconEdit size={14}/>}
                                        onClick={() => setExpanded(!expanded)}
                                    >
                                        Edit stack
                                    </Menu.Item>

                                    <Menu.Divider/>

                                    <Menu.Item
                                        leftSection={<IconArrowUp size={14}/>}
                                        disabled={itemIndex === 0}
                                        onClick={onMoveStackUp}
                                    >
                                        Move up
                                    </Menu.Item>

                                    <Menu.Item
                                        leftSection={<IconArrowDown size={14}/>}
                                        disabled={itemIndex === itemCount - 1}
                                        onClick={onMoveStackDown}
                                    >
                                        Move down
                                    </Menu.Item>

                                    <Menu.Divider/>

                                    <Menu.Item
                                        leftSection={<IconTrash size={14}/>}
                                        color="red"
                                        onClick={onDeleteStack}
                                    >
                                        Delete stack
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Group>
                    </Box>

                    <Collapse expanded={expanded}>
                        <Box style={{padding: 'var(--mantine-spacing-md)', paddingBottom: 0}}>
                            <Stack gap="sm">
                                <Group grow>
                                    <Select
                                        label="Stack type"
                                        data={stackTypeOptions}
                                        value={stack.itemType}
                                        onChange={value => onChange({
                                            itemType: value || stack.itemType,
                                        })}
                                        allowDeselect={false}
                                        renderOption={({option, checked}) => {
                                            const Icon = option.icon;
                                            return (
                                                <Group gap="xs" flex={1}>
                                                    {Icon && (
                                                        <Icon
                                                            size={18}
                                                            color={`var(--mantine-color-${option.color}-6)`}
                                                        />
                                                    )}
                                                    <Text size="sm">
                                                        {option.label}
                                                    </Text>
                                                    {checked && (
                                                        <IconCheck size={20} color="gray" style={{ marginInlineStart: 'auto' }}/>
                                                    )}
                                                </Group>
                                            );
                                        }}
                                    />

                                    <NumberInput
                                        label="Rounds"
                                        min={1}
                                        value={stack.rounds ?? 3}
                                        onChange={value => onChange({
                                            rounds: typeof value === 'number' ? value : null,
                                        })}
                                    />
                                </Group>
                            </Stack>
                        </Box>
                    </Collapse>

                    <Box style={{padding: 'var(--mantine-spacing-md)', paddingBottom: 0}}>
                        <Textarea
                            classNames={{input: 'subtleInput'}}
                            variant="unstyled"
                            placeholder="Add notes for this stack"
                            value={stack.notes || ''}
                            onChange={event => onChange({
                                notes: event.currentTarget.value,
                            })}
                            autosize
                        />
                    </Box>

                    <Stack gap="sm" p="md">
                        {!complete && (
                            <Text size="sm" c={`red`} fw={600}>
                                * {getStackRequirement(stack)}
                            </Text>
                        )}

                        {exerciseCount === 0 && (
                            <Paper withBorder radius="sm" p="md">
                                <Stack gap="xs" align="center">
                                    <Text fw={700}>No exercises in this stack</Text>
                                    <Text size="sm" c="dimmed" ta="center">
                                        {getStackRequirement(stack)}
                                    </Text>

                                    <Button
                                        size="xs"
                                        variant="light"
                                        leftSection={<IconPlus size={14}/>}
                                        onClick={onAddExercise}
                                        disabled={!canAddExerciseToStack(stack)}
                                    >
                                        Add Exercise
                                    </Button>
                                </Stack>
                            </Paper>
                        )}
                        {exerciseCount > 0 && (
                            <>
                                <Box mx="calc(var(--mantine-spacing-md) * -1)">
                                    <Stack gap={0}>
                                        {(stack.itemExercises ?? []).map((itemExercise, exerciseIndex) => (
                                            <ExerciseItemCard
                                                key={itemExercise.draftId || itemExercise.id}
                                                item={itemExercise}
                                                itemIndex={exerciseIndex}
                                                itemCount={stack.itemExercises.length}
                                                independent={false}
                                                onChange={updates => onChangeStackExercise(exerciseIndex, updates)}
                                                onDelete={() => onDeleteStackExercise(exerciseIndex)}
                                                onMoveUp={() => onMoveStackExerciseUp(exerciseIndex)}
                                                onMoveDown={() => onMoveStackExerciseDown(exerciseIndex)}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                                <Group justify="flex-end">
                                    <Button
                                        size="xs"
                                        mt={4}
                                        variant="light"
                                        leftSection={<IconPlus size={14}/>}
                                        onClick={onAddExercise}
                                        disabled={!canAddExerciseToStack(stack)}
                                    >
                                        Add Exercise
                                    </Button>
                                </Group>
                            </>
                        )}
                    </Stack>
                </Paper>
            </Box>
            {itemIndex !== itemCount - 1 && (
                <Group gap={0} mb="sm" mt="sm" wrap="nowrap" justify="center">
                    <IconLink opacity={0.4} size={24}/>
                </Group>
            )}
        </>
    );
}

export default WorkoutStackCard;