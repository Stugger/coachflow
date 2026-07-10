import {memo} from 'react';
import {useIsSmallScreen} from "../../../hooks/useIsSmallScreen.js";
import {
    useMantineTheme,
    getGradient,
    ActionIcon,
    Alert,
    Badge,
    Box,
    Button,
    Collapse,
    Group,
    Menu,
    Paper,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
    Tooltip,
    UnstyledButton,
} from '@mantine/core';
import {
    IconAlertCircle,
    IconArrowDown,
    IconArrowUp,
    IconBarbell,
    IconChevronDown,
    IconChevronUp,
    IconDots,
    IconEdit,
    IconGripVertical,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';

import ExerciseItemCard from './ExerciseItemCard';
import WorkoutStackCard from './WorkoutStackCard';
import ExercisePickerModal from '../../exercises/picker/ExercisePickerModal';

import {getSectionDisplayName, getSectionTypeLabel, getWorkoutItemKey} from '../workout-builder-utils';
import {WORKOUT_ITEM_TYPE, WORKOUT_SECTION_TYPE_OPTIONS, WORKOUT_STACK_OPTIONS} from '../workout-builder-constants';
import {WORKOUT_VALIDATION_SCOPE} from '../draft/workout-draft-validation';

function WorkoutSection({section, sectionIndex, sectionCount, expanded, isNew,
                            highlightedTopLevelItemKey = null, highlightedStackExerciseKey = null,
                            validationIssues = [],
                            sectionActions,
                            exerciseItemActions,
                            stackActions,
                            exercisePicker}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isSmallScreen = useIsSmallScreen();

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
        onViewExercise,
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
        onAdjustStackRounds,
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

    const sectionValidationIssues = validationIssues.filter(issue =>
        issue.scope === WORKOUT_VALIDATION_SCOPE.SECTION
    );

    const hasSectionValidationIssues = sectionValidationIssues.length > 0;

    // ------------------------------------------------------------------------------------------------------------------------
    // Utility
    // ------------------------------------------------------------------------------------------------------------------------

    function getStackValidationIssues(stack) {
        const stackKey = stack.draftId ?? stack.id;

        return validationIssues.filter(issue =>
            issue.stackKey === stackKey
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderAddItemButtons(rail) {
        return (
            <Box mt='0.5rem'>
                <Menu shadow="md" withinPortal offset={isSmallScreen ? 0 : undefined}>
                    <Menu.Target>
                        {rail ? (
                            <Button
                                variant='subtle'
                                radius='md'
                                fullWidth
                                style={{
                                    minHeight: '2.5rem',
                                    borderTopLeftRadius: 0,
                                    borderTopRightRadius: 0,
                                }}
                            >
                                <Group gap='0.5rem' justify='center'>
                                    <IconPlus size={16} />
                                    <Text size="sm" fw={600}>Add item</Text>
                                    <IconChevronDown size={14} stroke={3.0} />
                                </Group>
                            </Button>
                        ) : (
                            <Button
                                variant='light'
                                size={isSmallScreen ? 'xs' : 'sm'}
                                leftSection={<IconPlus size={16}/>}
                                rightSection={<IconChevronDown size={14} stroke={3.0} />}
                            >
                                Add first item
                            </Button>
                        )}
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
            </Box>
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
                className={isNew ? 'workout-structure-created' : undefined}
                radius="md"
                bg='var(--color-workout-section-bg)'
                style={{
                    outline: hasSectionValidationIssues
                        ? '2px solid var(--mantine-color-red-5)'
                        : undefined,
                    outlineOffset: '-1px',
                    borderColor: 'var(--color-border)',
                    borderBottom: '1px solid var(--color-border)'
                }}
            >
                <Box
                    style={{
                        borderBottom: '1px solid var(--color-border)',
                        background: headerGradient,
                        color: 'white',
                        borderTopLeftRadius: 'var(--mantine-radius-md)',
                        borderTopRightRadius: 'var(--mantine-radius-md)',
                    }}
                >
                    <Group justify="space-between" wrap="nowrap" pl='sm' pr="md" py="0.8rem">
                        <Group
                            gap={5}
                            wrap="nowrap"
                            style={{
                                minWidth: 0,
                                flex: 1,
                            }}
                        >
                            <IconGripVertical
                                size={18}
                                opacity={0.65}
                                style={{ flexShrink: 0 }}
                            />

                            <Tooltip offset={12} position='top-start'
                                label={expanded ? 'Collapse section settings' : 'Expand section settings'}
                            >
                                <UnstyledButton
                                    onClick={onToggle}
                                    aria-expanded={expanded}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        minWidth: 0,
                                        color: 'white',
                                        padding: '0 0.4rem 0 0',
                                    }}
                                >
                                    {expanded
                                        ? <IconChevronUp size={20} />
                                        : <IconChevronDown size={20} />
                                    }
                                    <Text
                                        size={isSmallScreen ? 'md' : 'lg'}
                                        fw={700}
                                        truncate
                                        style={{
                                            flex: 1,
                                            minWidth: 0,
                                            maxWidth: isSmallScreen ? '14rem' : undefined,
                                        }}
                                    >
                                        {sectionName}
                                    </Text>
                                </UnstyledButton>
                            </Tooltip>

                            <Group
                                gap="xs"
                                wrap="nowrap"
                                style={{
                                    flexShrink: 1,
                                    minWidth: '1rem'
                                }}
                            >
                                <Badge
                                    size={isSmallScreen ? 'xs' : 'sm'}
                                    variant="outline"
                                    color="white"
                                    style={{ flexShrink: 1, minWidth: '3rem' }}
                                >
                                    {sectionTypeLabel}
                                </Badge>

                                <Badge
                                    size={isSmallScreen ? 'xs' : 'sm'}
                                    variant="dot"
                                    color="white"
                                    bg="transparent"
                                    style={{ flexShrink: 1, minWidth: '2.4rem' }}
                                    styles={{
                                        root: { borderColor: 'white' },
                                        label: { color: 'white' },
                                    }}
                                >
                                    {itemCount} item{itemCount === 1 ? '' : 's'}
                                </Badge>
                            </Group>
                        </Group>

                        <Menu shadow="md" withinPortal position="bottom-end">
                            <Menu.Target>
                                <Tooltip label="Section options">
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
                                    maxLength={255}
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
                        classNames={{input: 'subtle-input'}}
                        variant="unstyled"
                        placeholder="Add instructions or notes for this section"
                        value={section.notes || ''}
                        onChange={event => onChange({notes: event.currentTarget.value})}
                        autosize
                    />
                </Box>

                {hasSectionValidationIssues && (
                    <Box px="md" pt="md">
                        <Alert
                            color="red"
                            variant="light"
                            icon={<IconAlertCircle size={16}/>}
                        >
                            <Stack gap={2}>
                                {sectionValidationIssues.map(issue => (
                                    <Text key={issue.id} size="sm">
                                        {issue.message}
                                    </Text>
                                ))}
                            </Stack>
                        </Alert>
                    </Box>
                )}

                <Box p="md">
                    {itemCount === 0 && (
                        <Paper
                            withBorder
                            radius="md"
                            p="lg"
                            style={{
                               borderColor: 'var(--color-border)'
                            }}
                        >
                            <Stack gap="sm" align="center">
                                <Text fw={700}>No items in this section</Text>
                                <Text size="sm" c="dimmed" ta="center">
                                    Add exercises or vertical stacks here next.
                                </Text>
                                {renderAddItemButtons(false)}
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
                                                    sectionIndex={sectionIndex}
                                                    itemIndex={itemIndex}
                                                    itemCount={section.items.length}
                                                    independent={true}
                                                    isNew={highlightedTopLevelItemKey === getWorkoutItemKey(item)}
                                                    onChange={updates => onChange(currentSection => ({
                                                        items: (currentSection.items ?? []).map((currentItem, index) => (
                                                            index === itemIndex
                                                                ? {...currentItem, ...updates}
                                                                : currentItem
                                                        )),
                                                    }))}
                                                    onDelete={() => onDeleteExerciseItem(itemIndex)}
                                                    onMoveUp={() => onMoveExerciseItemUp(itemIndex)}
                                                    onMoveDown={() => onMoveExerciseItemDown(itemIndex)}
                                                    onViewExercise={onViewExercise}
                                                />
                                            );
                                        }

                                        return (
                                            <WorkoutStackCard
                                                key={item.draftId || item.id}
                                                stack={item}
                                                sectionIndex={sectionIndex}
                                                itemIndex={itemIndex}
                                                itemCount={section.items.length}
                                                isNew={highlightedTopLevelItemKey === getWorkoutItemKey(item)}
                                                highlightedStackExerciseKey={highlightedStackExerciseKey}
                                                validationIssues={getStackValidationIssues(item)}
                                                onChange={updates => onChange(currentSection => ({
                                                    items: (currentSection.items ?? []).map((currentItem, index) => (
                                                        index === itemIndex
                                                            ? {...currentItem, ...updates}
                                                            : currentItem
                                                    )),
                                                }))}
                                                onAddExercise={() => onOpenExercisePickerForStack(itemIndex)}
                                                onViewExercise={onViewExercise}
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
                                                onAdjustStackRounds={amount => (
                                                    onAdjustStackRounds(itemIndex, amount)
                                                )}
                                            />
                                        );
                                    })}
                                </Stack>
                            </Box>
                        </Stack>
                    )}
                </Box>
                {itemCount > 0 && (
                    renderAddItemButtons(true)
                )}
            </Paper>
        </Box>
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

function areWorkoutSectionPropsEqual(previous, next) {
    return previous.section === next.section &&
        previous.sectionIndex === next.sectionIndex &&
        previous.sectionCount === next.sectionCount &&
        previous.expanded === next.expanded &&
        previous.isNew === next.isNew &&
        previous.highlightedTopLevelItemKey === next.highlightedTopLevelItemKey &&
        previous.highlightedStackExerciseKey === next.highlightedStackExerciseKey &&
        previous.exercisePicker.exercises === next.exercisePicker.exercises &&
        previous.exercisePicker.opened === next.exercisePicker.opened &&
        haveSameValidationIssues(previous.validationIssues, next.validationIssues);
}

export default memo(WorkoutSection, areWorkoutSectionPropsEqual);