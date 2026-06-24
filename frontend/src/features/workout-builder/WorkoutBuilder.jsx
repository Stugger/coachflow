import {useState} from 'react';
import {
    useComputedColorScheme,
    Button,
    Group,
    Paper,
    Stack,
    Text,
} from '@mantine/core';
import {IconPlus} from '@tabler/icons-react';

import WorkoutSection from './WorkoutSection';

import {createWorkoutSection, createStackExercise, createStackItem, createExerciseItem, resizeExerciseSetCount} from './workout-draft-factory';
import {reindexPositions} from './workout-draft-mappers';
import {getSectionKey, getSectionDisplayName} from './workout-builder-utils';

function WorkoutBuilder({draft, exercises, onChange}) {

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

    // ------------------------------------------------------------------------------------------------------------------------
    // Draft helpers
    // ------------------------------------------------------------------------------------------------------------------------

    /* Section helpers */

    function updateSections(nextSections) {
        onChange({
            ...draft,
            sections: reindexPositions(nextSections),
        });
    }

    function updateSection(sectionIndex, updater) {
        const nextSections = sections.map((section, index) => {
            if (index !== sectionIndex) {
                return section;
            }

            return updater(section);
        });

        updateSections(nextSections);
    }

    function addSection() {
        const nextSection = createWorkoutSection(sections.length + 1);

        updateSections([
            ...sections,
            nextSection,
        ]);

        setExpandedSectionIds(current => {
            const next = new Set(current);
            next.add(getSectionKey(nextSection));
            return next;
        });
    }

    function deleteSection(sectionIndex) {
        const section = sections[sectionIndex];
        const confirmed = !section.items?.length || window.confirm(`Delete "${getSectionDisplayName(section)}"?`);

        if (!confirmed) {
            return;
        }

        updateSections(sections.filter((_, index) => index !== sectionIndex));
    }

    function moveSection(sectionIndex, direction) {
        const targetIndex = sectionIndex + direction;

        if (targetIndex < 0 || targetIndex >= sections.length) {
            return;
        }

        const nextSections = [...sections];
        const [section] = nextSections.splice(sectionIndex, 1);
        nextSections.splice(targetIndex, 0, section);

        updateSections(nextSections);
    }

    function toggleSection(section) {
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
    }

    function addExerciseFromPicker(exercise) {
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
    }

    /* Section item helpers */

    function addExerciseToSection(sectionIndex, exercise) {
        updateSection(sectionIndex, section => ({
            ...section,
            items: reindexPositions([
                ...(section.items ?? []),
                createExerciseItem(exercise, (section.items?.length ?? 0) + 1),
            ]),
        }));
    }

    function deleteItemFromSection(sectionIndex, itemIndex) {
        updateSection(sectionIndex, section => ({
            ...section,
            items: reindexPositions(
                (section.items ?? []).filter((_, index) => index !== itemIndex)
            ),
        }));
    }

    function moveItemInSection(sectionIndex, itemIndex, direction) {
        const section = sections[sectionIndex];
        const targetIndex = itemIndex + direction;

        if (targetIndex < 0 || targetIndex >= (section.items?.length ?? 0)) {
            return;
        }

        const nextItems = [...section.items];
        const [item] = nextItems.splice(itemIndex, 1);
        nextItems.splice(targetIndex, 0, item);

        updateSection(sectionIndex, section => ({
            ...section,
            items: reindexPositions(nextItems),
        }));
    }

    /* Stack helpers */

    function addStackToSection(sectionIndex, itemType) {
        updateSection(sectionIndex, section => ({
            ...section,
            items: reindexPositions([
                ...(section.items ?? []),
                createStackItem(itemType, (section.items?.length ?? 0) + 1),
            ]),
        }));
    }

    function updateStackItem(sectionIndex, stackItemIndex, updater) {
        updateSection(sectionIndex, section => ({
            ...section,
            items: section.items.map((item, itemIndex) => (
                itemIndex === stackItemIndex
                    ? updater(item)
                    : item
            )),
        }));
    }

    function updateExerciseInStack(sectionIndex, stackItemIndex, exerciseIndex, updates) {
        updateStackItem(sectionIndex, stackItemIndex, stack => ({
            ...stack,
            itemExercises: stack.itemExercises.map((itemExercise, index) => (
                index === exerciseIndex
                    ? {...itemExercise, ...updates}
                    : itemExercise
            )),
        }));
    }

    function addExerciseToStack(sectionIndex, itemIndex, exercise) {
        updateSection(sectionIndex, section => ({
            ...section,
            items: section.items.map((item, index) => {
                if (index !== itemIndex) {
                    return item;
                }

                return {
                    ...item,
                    itemExercises: reindexPositions([
                        ...(item.itemExercises ?? []),
                        createStackExercise(
                            exercise,
                            (item.itemExercises?.length ?? 0) + 1,
                            item.rounds ?? 1,
                        ),
                    ]),
                };
            }),
        }));
    }

    function deleteExerciseFromStack(sectionIndex, stackItemIndex, exerciseIndex) {
        updateStackItem(sectionIndex, stackItemIndex, stack => ({
            ...stack,
            itemExercises: reindexPositions(
                (stack.itemExercises ?? []).filter((_, index) => index !== exerciseIndex)
            ),
        }));
    }

    function moveExerciseInStack(sectionIndex, stackItemIndex, exerciseIndex, direction) {
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
    }

    function adjustStackRounds(sectionIndex, stackItemIndex, amount) {
        updateStackItem(sectionIndex, stackItemIndex, stack => {
            const currentRounds = stack.rounds ?? 1;
            const nextRounds = Math.max(1, currentRounds + amount);

            if (nextRounds === currentRounds) {
                return stack;
            }

            return {
                ...stack,
                rounds: nextRounds,
                itemExercises: stack.itemExercises.map(itemExercise => ({
                    ...itemExercise,
                    configJson: resizeExerciseSetCount(
                        itemExercise.configJson,
                        nextRounds,
                        {duplicateLastSet: amount > 0},
                    ),
                })),
            };
        });
    }

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
                        sectionActions={{
                            onToggle: () => toggleSection(section),
                            onMoveUp: () => moveSection(sectionIndex, -1),
                            onMoveDown: () => moveSection(sectionIndex, 1),
                            onDelete: () => deleteSection(sectionIndex),
                            onChange: updates => updateSection(sectionIndex, currentSection => ({
                                ...currentSection,
                                ...updates,
                            })),
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