import {useCallback, useState} from 'react';
import {
    useComputedColorScheme,
    Alert,
    Button,
    Group,
    Paper,
    Stack,
    Text,
} from '@mantine/core';
import {IconAlertCircle, IconPlus} from '@tabler/icons-react';

import WorkoutSection from './WorkoutSection';

import {createWorkoutSection, createStackExercise, createStackItem, createExerciseItem, resizeExerciseSetCount} from './workout-draft-factory';
import {reindexPositions} from './workout-draft-mappers';
import {getSectionKey, getSectionDisplayName} from './workout-builder-utils';
import {WORKOUT_VALIDATION_SCOPE} from './workout-draft-validation';

function WorkoutBuilder({draft, exercises, validationIssues = [], onChange}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const computedColorScheme = useComputedColorScheme('light');

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [expandedSectionIds, setExpandedSectionIds] = useState(() => new Set());
    const [exercisePickerTarget, setExercisePickerTarget] = useState(null);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const sections = draft.sections ?? [];

    const workoutBuilderIssues = validationIssues.filter(issue =>
        issue.scope === WORKOUT_VALIDATION_SCOPE.WORKOUT &&
        issue.field === 'sections'
    );

    // ------------------------------------------------------------------------------------------------------------------------
    // Draft helpers
    // ------------------------------------------------------------------------------------------------------------------------

    /* Section helpers */

    const updateSections = useCallback(updater => {
        onChange(currentDraft => {
            const currentSections = currentDraft.sections ?? [];

            const nextSections = typeof updater === 'function'
                ? updater(currentSections)
                : updater;

            return {
                ...currentDraft,
                sections: reindexPositions(nextSections),
            };
        });
    }, [onChange]);

    const updateSection = useCallback((sectionIndex, updater) => {
        updateSections(currentSections => (
            currentSections.map((section, index) => (
                index === sectionIndex
                    ? updater(section)
                    : section
            ))
        ));
    }, [updateSections]);

    const addSection = useCallback(() => {
        const nextSection = createWorkoutSection();

        updateSections(currentSections => [
            ...currentSections,
            nextSection,
        ]);

        setExpandedSectionIds(current => {
            const next = new Set(current);
            next.add(getSectionKey(nextSection));
            return next;
        });
    }, [updateSections]);

    const deleteSection = useCallback(sectionIndex => {
        const section = sections[sectionIndex];
        const confirmed = !section?.items?.length || window.confirm(`Delete "${getSectionDisplayName(section)}"?`);

        if (!confirmed) {
            return;
        }

        updateSections(currentSections => (
            currentSections.filter((_, index) => index !== sectionIndex)
        ));
    }, [sections, updateSections]);

    const moveSection = useCallback((sectionIndex, direction) => {
        updateSections(currentSections => {
            const targetIndex = sectionIndex + direction;

            if (targetIndex < 0 || targetIndex >= currentSections.length) {
                return currentSections;
            }

            const nextSections = [...currentSections];
            const [section] = nextSections.splice(sectionIndex, 1);
            nextSections.splice(targetIndex, 0, section);

            return nextSections;
        });
    }, [updateSections]);

    const toggleSection = useCallback(section => {
        const key = getSectionKey(section);

        setExpandedSectionIds(current => {
            const next = new Set(current);

            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }

            return next;
        });
    }, []);

    const getSectionValidationIssues = useCallback(section => {
        const sectionKey = getSectionKey(section);

        return validationIssues.filter(issue =>
            issue.sectionKey === sectionKey
        );
    }, [validationIssues]);

    const addExerciseToSection = useCallback((sectionIndex, exercise) => {
        updateSection(sectionIndex, section => ({
            ...section,
            items: reindexPositions([
                ...(section.items ?? []),
                createExerciseItem(exercise, (section.items?.length ?? 0) + 1),
            ]),
        }));
    }, [updateSection]);

    const addStackToSection = useCallback((sectionIndex, itemType) => {
        updateSection(sectionIndex, section => ({
            ...section,
            items: reindexPositions([
                ...(section.items ?? []),
                createStackItem(itemType, (section.items?.length ?? 0) + 1),
            ]),
        }));
    }, [updateSection]);

    const deleteItemFromSection = useCallback((sectionIndex, itemIndex) => {
        updateSection(sectionIndex, section => ({
            ...section,
            items: reindexPositions(
                (section.items ?? []).filter((_, index) => index !== itemIndex)
            ),
        }));
    }, [updateSection]);

    const moveItemInSection = useCallback((sectionIndex, itemIndex, direction) => {
        updateSection(sectionIndex, section => {
            const items = section.items ?? [];
            const targetIndex = itemIndex + direction;

            if (targetIndex < 0 || targetIndex >= items.length) {
                return section;
            }

            const nextItems = [...items];
            const [item] = nextItems.splice(itemIndex, 1);
            nextItems.splice(targetIndex, 0, item);

            return {
                ...section,
                items: reindexPositions(nextItems),
            };
        });
    }, [updateSection]);

    /* Stack helpers */

    const updateStackItem = useCallback((sectionIndex, stackItemIndex, updater) => {
        updateSection(sectionIndex, section => ({
            ...section,
            items: (section.items ?? []).map((item, itemIndex) => (
                itemIndex === stackItemIndex
                    ? updater(item)
                    : item
            )),
        }));
    }, [updateSection]);

    const updateExerciseInStack = useCallback((sectionIndex, stackItemIndex, exerciseIndex, updates) => {
        updateStackItem(sectionIndex, stackItemIndex, stack => ({
            ...stack,
            itemExercises: (stack.itemExercises ?? []).map((itemExercise, index) => (
                index === exerciseIndex
                    ? {...itemExercise, ...updates}
                    : itemExercise
            )),
        }));
    }, [updateStackItem]);

    const addExerciseToStack = useCallback((sectionIndex, itemIndex, exercise) => {
        updateStackItem(sectionIndex, itemIndex, stack => ({
            ...stack,
            itemExercises: reindexPositions([
                ...(stack.itemExercises ?? []),
                createStackExercise(
                    exercise,
                    (stack.itemExercises?.length ?? 0) + 1,
                    stack.rounds ?? 1,
                ),
            ]),
        }));
    }, [updateStackItem]);

    const deleteExerciseFromStack = useCallback((sectionIndex, stackItemIndex, exerciseIndex) => {
        updateStackItem(sectionIndex, stackItemIndex, stack => ({
            ...stack,
            itemExercises: reindexPositions(
                (stack.itemExercises ?? []).filter((_, index) => index !== exerciseIndex)
            ),
        }));
    }, [updateStackItem]);

    const moveExerciseInStack = useCallback((sectionIndex, stackItemIndex, exerciseIndex, direction) => {
        updateStackItem(sectionIndex, stackItemIndex, stack => {
            const itemExercises = [...(stack.itemExercises ?? [])];
            const targetIndex = exerciseIndex + direction;

            if (targetIndex < 0 || targetIndex >= itemExercises.length) {
                return stack;
            }

            const [exercise] = itemExercises.splice(exerciseIndex, 1);
            itemExercises.splice(targetIndex, 0, exercise);

            return {
                ...stack,
                itemExercises: reindexPositions(itemExercises),
            };
        });
    }, [updateStackItem]);

    const adjustStackRounds = useCallback((sectionIndex, stackItemIndex, amount) => {
        updateStackItem(sectionIndex, stackItemIndex, stack => {
            const currentRounds = stack.rounds ?? 1;
            const nextRounds = Math.max(1, currentRounds + amount);

            if (nextRounds === currentRounds) {
                return stack;
            }

            return {
                ...stack,
                rounds: nextRounds,
                itemExercises: (stack.itemExercises ?? []).map(itemExercise => ({
                    ...itemExercise,
                    configJson: resizeExerciseSetCount(
                        itemExercise.configJson,
                        nextRounds,
                        {duplicateLastSet: amount > 0},
                    ),
                })),
            };
        });
    }, [updateStackItem]);

    const addExerciseFromPicker = useCallback(exercise => {
        if (!exercisePickerTarget) {
            return;
        }

        if (exercisePickerTarget.type === 'section') {
            addExerciseToSection(exercisePickerTarget.sectionIndex, exercise);
        } else if (exercisePickerTarget.type === 'stack') {
            addExerciseToStack(
                exercisePickerTarget.sectionIndex,
                exercisePickerTarget.itemIndex,
                exercise,
            );
        }

        setExercisePickerTarget(null);
    }, [exercisePickerTarget, addExerciseToSection, addExerciseToStack]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="center">
                <Stack gap={2}>
                    <Text fw={800}>Workout Structure</Text>
                    <Text size="sm" c="dimmed">
                        Organize this workout into sections. Exercises and stacks will be added inside each section.
                    </Text>
                </Stack>
            </Group>

            {workoutBuilderIssues.length > 0 && (
                <Alert
                    color="red"
                    variant="light"
                    icon={<IconAlertCircle size={16}/>}
                >
                    <Stack gap={2}>
                        {workoutBuilderIssues.map(issue => (
                            <Text key={issue.id} size="sm">
                                {issue.message}
                            </Text>
                        ))}
                    </Stack>
                </Alert>
            )}

            {sections.length === 0 && (
                <Paper
                    withBorder
                    radius="md"
                    p="xl"
                    bg={computedColorScheme === 'light' ? 'var(--color-background)' : 'var(--color-surface)'}
                >
                    <Stack gap="sm" align="center">
                        <Text fw={700}>No sections yet</Text>
                        <Text size="sm" c="dimmed" ta="center">
                            Add a section to start building this workout.
                        </Text>
                        <Button leftSection={<IconPlus size={16}/>} onClick={addSection}>
                            Add Section
                        </Button>
                    </Stack>
                </Paper>
            )}

            <Stack gap="1.5rem">
                {sections.map((section, sectionIndex) => (
                    <WorkoutSection
                        key={getSectionKey(section)}
                        section={section}
                        sectionIndex={sectionIndex}
                        sectionCount={sections.length}
                        expanded={expandedSectionIds.has(getSectionKey(section))}
                        validationIssues={getSectionValidationIssues(section)}
                        sectionActions={{
                            onToggle: () => toggleSection(section),
                            onMoveUp: () => moveSection(sectionIndex, -1),
                            onMoveDown: () => moveSection(sectionIndex, 1),
                            onDelete: () => deleteSection(sectionIndex),
                            onChange: updatesOrUpdater => updateSection(sectionIndex, currentSection => {
                                const updates = typeof updatesOrUpdater === 'function'
                                    ? updatesOrUpdater(currentSection)
                                    : updatesOrUpdater;

                                return {
                                    ...currentSection,
                                    ...updates,
                                };
                            }),
                        }}
                        exerciseItemActions={{
                            onDeleteExerciseItem: itemIndex => deleteItemFromSection(sectionIndex, itemIndex),
                            onMoveExerciseItemUp: itemIndex => moveItemInSection(sectionIndex, itemIndex, -1),
                            onMoveExerciseItemDown: itemIndex => moveItemInSection(sectionIndex, itemIndex, 1),
                            onAddStack: itemType => addStackToSection(sectionIndex, itemType),
                        }}
                        stackActions={{
                            onOpenExercisePicker: itemIndex => setExercisePickerTarget({
                                type: 'stack',
                                sectionIndex,
                                itemIndex,
                            }),
                            onDeleteStack: itemIndex => deleteItemFromSection(sectionIndex, itemIndex),
                            onMoveStackUp: itemIndex => moveItemInSection(sectionIndex, itemIndex, -1),
                            onMoveStackDown: itemIndex => moveItemInSection(sectionIndex, itemIndex, 1),
                            onChangeStackExercise: (itemIndex, exerciseIndex, updates) => (
                                updateExerciseInStack(sectionIndex, itemIndex, exerciseIndex, updates)
                            ),
                            onDeleteStackExercise: (itemIndex, exerciseIndex) => (
                                deleteExerciseFromStack(sectionIndex, itemIndex, exerciseIndex)
                            ),
                            onMoveStackExerciseUp: (itemIndex, exerciseIndex) => (
                                moveExerciseInStack(sectionIndex, itemIndex, exerciseIndex, -1)
                            ),
                            onMoveStackExerciseDown: (itemIndex, exerciseIndex) => (
                                moveExerciseInStack(sectionIndex, itemIndex, exerciseIndex, 1)
                            ),
                            onAdjustStackRounds: (itemIndex, amount) => adjustStackRounds(sectionIndex, itemIndex, amount),
                        }}
                        exercisePicker={{
                            exercises,
                            opened: exercisePickerTarget?.sectionIndex === sectionIndex,
                            onOpen: () => setExercisePickerTarget({
                                type: 'section',
                                sectionIndex,
                            }),
                            onClose: () => setExercisePickerTarget(null),
                            onAdd: addExerciseFromPicker,
                        }}
                    />
                ))}
            </Stack>

            {sections.length > 0 && (
                <Button leftSection={<IconPlus size={16}/>} onClick={addSection}>
                    Add Section
                </Button>
            )}
        </Stack>
    );
}

export default WorkoutBuilder;