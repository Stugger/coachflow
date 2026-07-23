import {memo, useEffect, useRef, useState} from 'react';
import {useIsSmallScreen} from "../../../hooks/useIsSmallScreen.js";
import {
    useComputedColorScheme,
    useMantineTheme,
    getGradient,
    ActionIcon,
    Alert,
    Box,
    Button,
    Group,
    Menu,
    Paper,
    Stack,
    Text,
    Textarea,
    Tooltip,
    UnstyledButton,
} from '@mantine/core';
import {
    IconAlertCircle,
    IconArrowDown,
    IconArrowUp,
    IconCheck,
    IconChevronDown,
    IconChevronUp,
    IconDots,
    IconLink,
    IconMinus,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';

import ExerciseItemCard from './ExerciseItemCard';

import {
    getStackOption,
    getStackRequirement,
    isStackComplete,
    canAddExerciseToStack,
    getWorkoutItemKey,
} from '../workout-builder-utils';
import {WORKOUT_STACK_OPTIONS} from '../workout-builder-constants';

function WorkoutStackCard({stack, sectionIndex, itemIndex, itemCount, liveResultIndex = null, isNew,
                              highlightedStackExerciseKey = null,
                              validationIssues = [],
                              onChange,
                              onAddExercise, onViewExercise,
                              onDeleteStack, onMoveStackUp, onMoveStackDown,
                              onChangeStackExercise, onDeleteStackExercise, onMoveStackExerciseUp, onMoveStackExerciseDown,
                              onAdjustStackRounds}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isSmallScreen = useIsSmallScreen();

    const computedColorScheme = useComputedColorScheme('light');

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [typeMenuOpened, setTypeMenuOpened] = useState(false);

    const [roundFeedback, setRoundFeedback] = useState(null);

    const roundFeedbackTimeoutRef = useRef(null);
    const roundFeedbackSequenceRef = useRef(0);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const option = getStackOption(stack.itemType);
    const exerciseCount = stack.itemExercises?.length ?? 0;
    const canAddExercise = canAddExerciseToStack(stack);
    const complete = isStackComplete(stack);

    const hasValidationIssues = validationIssues.length > 0;

    const headerGradient = getGradient({deg: 90, from: `${option?.color ?? 'gray'}.6`, to: 'var(--color-workout-section-bg)'}, useMantineTheme());
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
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        return () => {
            if (roundFeedbackTimeoutRef.current) {
                window.clearTimeout(roundFeedbackTimeoutRef.current);
            }
        };
    }, []);

    // ------------------------------------------------------------------------------------------------------------------------
    // Utility
    // ------------------------------------------------------------------------------------------------------------------------

    function showRoundFeedback(amount) {
        const currentRounds = stack.rounds ?? 1;
        const isEmptyStack = exerciseCount === 0;

        const message = isEmptyStack
            ? amount > 0
                ? `Round ${currentRounds + 1} added`
                : `Round ${currentRounds} removed`
            : amount > 0
                ? `Set ${currentRounds + 1} added to stack exercises`
                : `Set ${currentRounds} removed from stack exercises`;

        if (roundFeedbackTimeoutRef.current) {
            window.clearTimeout(roundFeedbackTimeoutRef.current);
        }

        setRoundFeedback({
            id: ++roundFeedbackSequenceRef.current,
            message,
            compact: isEmptyStack,
        });

        roundFeedbackTimeoutRef.current = window.setTimeout(() => {
            setRoundFeedback(null);
            roundFeedbackTimeoutRef.current = null;
        }, 1700);
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function handleAdjustStackRounds(amount) {
        const currentRounds = stack.rounds ?? 1;

        if (amount < 0 && currentRounds <= 1) {
            return;
        }

        onAdjustStackRounds(amount);
        showRoundFeedback(amount);
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            <Box
                style={{
                    borderLeft: `${isSmallScreen ? '3px' : '4px'} solid var(--mantine-color-${option?.color ?? 'gray'}-4)`,
                    marginLeft: isSmallScreen ? 0 : 'var(--mantine-spacing-sm)',
                    paddingLeft: isSmallScreen ? 'var(--mantine-spacing-xs)' : 'var(--mantine-spacing-sm)',
                }}
            >
                <Paper
                    className={isNew ? 'workout-structure-created' : undefined}
                    withBorder
                    radius="md"
                    mr={isSmallScreen ? 3 : 5}
                    shadow={shadow}
                    bg="var(--color-workout-stack-bg)"
                    style={{
                        border: '1px solid var(--color-border)',
                        outline: hasValidationIssues
                            ? '2px solid var(--mantine-color-red-5)'
                            : undefined,
                        outlineOffset: '-1px',
                    }}
                >
                    <Box
                        px="sm"
                        py={4}
                        pr="md"
                        bg={headerGradient}
                        c="white"
                        style={{
                            borderBottom: '1px solid var(--color-border)',
                            borderTopLeftRadius: 'var(--mantine-radius-sm)',
                            borderTopRightRadius: 'var(--mantine-radius-md)',
                        }}
                    >
                        <Group gap={0} justify="space-between" wrap="nowrap">
                            <Group gap={2} wrap="nowrap">
                                {option.icon && (
                                    <option.icon size={18} opacity={0.65}/>
                                )}

                                <Menu shadow="md" withinPortal
                                      position="bottom-end"
                                      opened={typeMenuOpened}
                                      onChange={setTypeMenuOpened}
                                >
                                    <Menu.Target>
                                        <UnstyledButton
                                            className="subtle-input"
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

                            <Box pos="relative" style={{flexShrink: 0}}>
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
                                            onClick={() => handleAdjustStackRounds(-1)}
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
                                            onClick={() => handleAdjustStackRounds(1)}
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

                                    <Menu shadow="md" withinPortal position="bottom-end" transitionProps={{ duration: 0 }}>
                                        <Menu.Target>
                                            <Tooltip label="Stack options">
                                                <ActionIcon
                                                    variant="subtle"
                                                    color={computedColorScheme === 'light' ? "gray" : "light"}
                                                >
                                                    <IconDots size={18}/>
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

                                {roundFeedback && (
                                    <Box
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 0.45rem)',
                                            right: roundFeedback.compact ? '2.5rem' : 0,
                                            zIndex: 10,
                                            pointerEvents: 'none',
                                            width: 'max-content',
                                            maxWidth: 'calc(100vw - 2rem)',
                                        }}
                                    >
                                        <Paper
                                            key={roundFeedback.id}
                                            className="workout-stack-round-feedback"
                                            role="status"
                                            withBorder
                                            radius="sm"
                                            px="sm"
                                            py={6}
                                            style={{
                                                width: 'max-content',
                                                maxWidth: '100%',
                                                backgroundColor: computedColorScheme === 'light'
                                                    ? 'var(--mantine-color-gray-0)'
                                                    : 'var(--color-surface)',
                                                color: 'var(--mantine-color-text)',
                                                boxShadow: 'var(--mantine-shadow-sm)',
                                            }}
                                        >
                                            <Text
                                                size="xs"
                                                fw={600}
                                                style={{
                                                    color: computedColorScheme === 'light' ? 'var(--mantine-color-gray-7)' : 'var(--mantine-color-gray-5)',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {roundFeedback.message}
                                            </Text>
                                        </Paper>
                                    </Box>
                                )}
                            </Box>
                        </Group>
                    </Box>

                    <Box style={{padding: 'var(--mantine-spacing-md)', paddingBottom: 0}}>
                        <Textarea
                            classNames={{input: 'subtle-input'}}
                            variant="unstyled"
                            placeholder="Add notes for this stack"
                            value={stack.notes || ''}
                            onChange={event => onChange({
                                notes: event.currentTarget.value,
                            })}
                            autosize
                        />
                    </Box>

                    {hasValidationIssues && (
                        <Box px="md" pt="md">
                            <Alert
                                color="red"
                                variant="light"
                                icon={<IconAlertCircle size={16}/>}
                            >
                                <Stack gap={2}>
                                    {validationIssues.map(issue => (
                                        <Text key={issue.id} size="sm">
                                            {issue.message}
                                        </Text>
                                    ))}
                                </Stack>
                            </Alert>
                        </Box>
                    )}

                    <Stack gap="sm" p="md">
                        {exerciseCount === 0 && (
                            <Paper
                                withBorder
                                radius="sm"
                                p="md"
                                style={{
                                    borderColor: 'var(--color-border)'
                                }}
                            >
                                <Stack gap="xs" align="center">
                                    <Text fw={700}>No exercises in this stack</Text>
                                    {!complete && !hasValidationIssues && (
                                        <Text size={isSmallScreen ? "xs" : "sm"} c="red" fw={600} pb={4}>
                                            * {getStackRequirement(stack)}
                                        </Text>
                                    )}

                                    <Button
                                        size="xs"
                                        variant="light"
                                        leftSection={<IconPlus size={14}/>}
                                        onClick={onAddExercise}
                                        disabled={!canAddExercise}
                                    >
                                        Add first exercise
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
                                                sectionIndex={sectionIndex}
                                                parentStackItemIndex={itemIndex}
                                                itemIndex={exerciseIndex}
                                                itemCount={stack.itemExercises.length}
                                                independent={false}
                                                liveResultIndex={liveResultIndex}
                                                isNew={highlightedStackExerciseKey === getWorkoutItemKey(itemExercise)}
                                                onChange={updates => onChangeStackExercise(exerciseIndex, updates)}
                                                onDelete={() => onDeleteStackExercise(exerciseIndex)}
                                                onMoveUp={() => onMoveStackExerciseUp(exerciseIndex)}
                                                onMoveDown={() => onMoveStackExerciseDown(exerciseIndex)}
                                                onViewExercise={onViewExercise}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                                {!complete && !hasValidationIssues && (
                                    <Text size={isSmallScreen ? "xs" : "sm"} c="red" pt={4} fw={600}>
                                        * {getStackRequirement(stack)}
                                    </Text>
                                )}
                            </>
                        )}
                    </Stack>
                    {exerciseCount > 0 && (
                        <Tooltip
                            label="Max exercises for this stack"
                            disabled={canAddExercise}
                            offset={isSmallScreen ? -10 : 0}
                            withArrow
                            arrowSize={10}
                            arrowOffset={15}
                            events={{ hover: true, focus: false, touch: true }}
                        >
                            <span>
                                <Button
                                    variant='light'
                                    fullWidth
                                    size='xs'
                                    radius='md'
                                    mt={!complete && !hasValidationIssues ? (isSmallScreen ? -3 : 0)
                                        : !canAddExercise ? (isSmallScreen ? '0.4rem' : '0.6rem')
                                        : isSmallScreen ? '1rem' : '1.4rem'}
                                    leftSection={<IconPlus size={14}/>}
                                    onClick={onAddExercise}
                                    disabled={!canAddExercise}
                                    color={option.color}
                                    bg={!canAddExercise ? 'transparent' : undefined}
                                    style={{
                                        minHeight: '2.25rem',
                                        borderTopLeftRadius: 0,
                                        borderTopRightRadius: 0,
                                    }}
                                >
                                    Add exercise to {option?.label?.toLowerCase() ?? 'stack'}
                                </Button>
                            </span>
                        </Tooltip>
                    )}
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

function haveSameValidationIssues(previousIssues = [], nextIssues = []) {
    if (previousIssues === nextIssues) {
        return true;
    }

    if (previousIssues.length !== nextIssues.length) {
        return false;
    }

    return previousIssues.every((issue, index) =>
        issue.id === nextIssues[index]?.id
    );
}

function areWorkoutStackCardPropsEqual(previous, next) {
    return previous.stack === next.stack &&
        previous.sectionIndex === next.sectionIndex &&
        previous.itemIndex === next.itemIndex &&
        previous.itemCount === next.itemCount &&
        previous.liveResultIndex === next.liveResultIndex &&
        previous.isNew === next.isNew &&
        previous.highlightedStackExerciseKey === next.highlightedStackExerciseKey &&
        haveSameValidationIssues(previous.validationIssues, next.validationIssues);
}

export default memo(WorkoutStackCard, areWorkoutStackCardPropsEqual);