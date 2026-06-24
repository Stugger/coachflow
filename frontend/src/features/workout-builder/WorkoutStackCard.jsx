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
    UnstyledButton,
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
    IconMinus,
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

function WorkoutStackCard({stack, itemIndex, itemCount,
                              onChange,
                              onAddExercise,
                              onDeleteStack, onMoveStackUp, onMoveStackDown,
                              onChangeStackExercise, onDeleteStackExercise, onMoveStackExerciseUp, onMoveStackExerciseDown,
                              onAdjustStackRounds}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isMobile = useMediaQuery('(max-width: 48em)');

    const computedColorScheme = useComputedColorScheme('light');

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [typeMenuOpened, setTypeMenuOpened] = useState(false);

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
                        <Group gap={0} justify="space-between" wrap="nowrap">
                            <Group gap={2} wrap="nowrap">
                                {option.icon && (
                                    <option.icon size={18} opacity={0.65}/>
                                )}

                                <Menu withinPortal
                                      position="bottom-end"
                                      opened={typeMenuOpened}
                                      onChange={setTypeMenuOpened}
                                >
                                    <Menu.Target>
                                        <UnstyledButton
                                            className="subtleInput"
                                            style={{
                                                background: 'transparent',
                                                minHeight: '1.5rem',
                                                paddingInline: '0.4rem',
                                            }}
                                        >
                                            <Group gap={3} wrap="nowrap">
                                                <Text size="sm" fw={800}>
                                                    {option?.label?.toUpperCase() ?? 'STACK'}
                                                </Text>
                                                {typeMenuOpened
                                                    ? <IconChevronUp size={18} stroke={2.5} color="white"/>
                                                    : <IconChevronDown size={18} stroke={2.5} color="white"/>
                                                }
                                            </Group>
                                        </UnstyledButton>
                                    </Menu.Target>

                                    <Menu.Dropdown>
                                        {stackTypeOptions.map(option => (
                                            <Menu.Item
                                                key={option.value}
                                                onClick={() => onChange({
                                                    itemType: option.value || stack.itemType,
                                                })}
                                                leftSection={option.icon ? <option.icon size={18} color={`var(--mantine-color-${option.color}-6)`}/> : ""}
                                                rightSection={option.value === stack.itemType ? <IconCheck size={18}/>: null}
                                                disabled={option.disabled}
                                            >
                                                {option.label}
                                            </Menu.Item>
                                        ))}
                                    </Menu.Dropdown>
                                </Menu>
                            </Group>

                            <Group gap="xs" wrap="nowrap">
                                <Group
                                    gap={0}
                                    wrap="nowrap"
                                    style={{
                                        height: '1.75rem',
                                        border: '1px solid rgba(0, 0, 0, 0.25)',
                                        borderRadius: 'var(--mantine-radius-md)',
                                        overflow: 'hidden',
                                        backgroundColor: computedColorScheme === 'light' ? 'var(--color-background)' : 'var(--color-surface)',
                                    }}
                                >
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        radius={0}
                                        disabled={(stack.rounds ?? 1) <= 1}
                                        onClick={() => onAdjustStackRounds(-1)}
                                        aria-label="Remove round"
                                        style={{
                                            width: '1.75rem',
                                            height: '100%',
                                            flexShrink: 0,
                                            opacity: (stack.rounds ?? 1) <= 1 ? 0.45 : 0.75,
                                        }}
                                    >
                                        <IconMinus size={16} />
                                    </ActionIcon>

                                    <Text
                                        size="xs"
                                        fw={700}
                                        pt={1}
                                        miw="4.75rem"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100%',
                                            whiteSpace: 'nowrap',
                                            color: `var(--mantine-color-${option?.color ?? 'gray'}-7)`,
                                            borderInline: '1px solid rgba(0, 0, 0, 0.25)',
                                        }}
                                    >
                                        {stack.rounds ?? 1} {(stack.rounds ?? 1) === 1 ? 'Round' : 'Rounds'}
                                    </Text>

                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        radius={0}
                                        onClick={() => onAdjustStackRounds(1)}
                                        aria-label="Add round"
                                        style={{
                                            width: '1.75rem',
                                            height: '100%',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <IconPlus size={16} />
                                    </ActionIcon>
                                </Group>

                                <Menu withinPortal position="bottom-end">
                                    <Menu.Target>
                                        <Tooltip label="Stack options">
                                            <ActionIcon
                                                variant="subtle"
                                                color={computedColorScheme === 'light' ? 'gray' : 'white'}
                                            >
                                                <IconDots
                                                    size={18}
                                                    color={computedColorScheme === 'light' ? 'black' : 'white'}
                                                />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Menu.Target>

                                    <Menu.Dropdown>
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
                        </Group>
                    </Box>

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
                        {exerciseCount === 0 && (
                            <Paper withBorder radius="sm" p="md">
                                <Stack gap="xs" align="center">
                                    <Text fw={700}>No exercises in this stack</Text>
                                    {!complete && (
                                        <Text size={isMobile ? "xs" : "sm"} c="red" fw={600} pb={4}>
                                            * {getStackRequirement(stack)}
                                        </Text>
                                    )}

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
                                <Group gap={2} justify={complete ? "flex-end" : "space-between"} wrap="nowrap">
                                    {!complete && (
                                        <Text size={isMobile ? "xs" : "sm"} c="red" fw={600}>
                                            * {getStackRequirement(stack)}
                                        </Text>
                                    )}
                                    <Tooltip
                                        label="Max exercises for this stack"
                                        disabled={canAddExerciseToStack(stack)}
                                        offset={0}
                                        withArrow
                                        arrowSize={10}
                                        arrowOffset={15}
                                        events={{ hover: true, focus: false, touch: true }}
                                    >
                                        <span>
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
                                        </span>
                                    </Tooltip>
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