import {useCallback, useEffect, useRef, useState} from 'react';
import {
    useComputedColorScheme,
    Alert,
    Button,
    Group,
    Modal,
    Paper,
    Stack,
    Text,
} from '@mantine/core';
import {IconAlertCircle, IconPlus} from '@tabler/icons-react';

import WorkoutSection from './WorkoutSection';

import {createWorkoutSection, createStackExercise, createStackItem, createExerciseItem, createDraftId, resizeExerciseSetCount} from './draft/workout-draft-factory';
import {reindexPositions} from './draft/workout-draft-mappers';
import {getSectionKey, getSectionDisplayName, getWorkoutItemKey} from './workout-builder-utils';
import {WORKOUT_VALIDATION_SCOPE} from './draft/workout-draft-validation';

function WorkoutBuilder({draft, exercises, validationIssues = [], onChange, onViewExercise}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const computedColorScheme = useComputedColorScheme('light');

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [expandedSectionIds, setExpandedSectionIds] = useState(() => new Set());
    const [exercisePickerTarget, setExercisePickerTarget] = useState(null);

    const [sectionPendingDelete, setSectionPendingDelete] = useState(null);

    const sectionListEndRef = useRef(null);
    const pendingNewSectionScrollRef = useRef(false);

    const [creationHighlight, setCreationHighlight] = useState(null);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const sections = draft.sections ?? [];

    const workoutBuilderIssues = validationIssues.filter(issue =>
        issue.scope === WORKOUT_VALIDATION_SCOPE.WORKOUT &&
        issue.field === 'sections'
    );

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (!pendingNewSectionScrollRef.current) {
            return;
        }

        pendingNewSectionScrollRef.current = false;

        const frameId = requestAnimationFrame(() => {
            sectionListEndRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            });
        });

        return () => cancelAnimationFrame(frameId);
    }, [sections.length]);

    useEffect(() => {
        if (!creationHighlight) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setCreationHighlight(null);
        }, 900);

        return () => window.clearTimeout(timeoutId);
    }, [creationHighlight]);

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

        setCreationHighlight({
            type: 'section',
            key: getSectionKey(nextSection),
        });

        pendingNewSectionScrollRef.current = true;

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

    const deleteSectionByKey = useCallback(sectionKey => {
        updateSections(currentSections =>
            currentSections.filter(section =>
                getSectionKey(section) !== sectionKey
            )
        );

        setExpandedSectionIds(current => {
            const next = new Set(current);
            next.delete(sectionKey);
            return next;
        });
    }, [updateSections]);

    const requestDeleteSection = useCallback(sectionIndex => {
        const section = sections[sectionIndex];

        if (!section) {
            return;
        }

        if (!section.items?.length) {
            deleteSectionByKey(getSectionKey(section));
            return;
        }

        setSectionPendingDelete({
            key: getSectionKey(section),
            name: getSectionDisplayName(section),
            itemCount: section.items.length,
        });
    }, [sections, deleteSectionByKey]);

    const confirmDeleteSection = useCallback(() => {
        if (!sectionPendingDelete) {
            return;
        }

        deleteSectionByKey(sectionPendingDelete.key);
        setSectionPendingDelete(null);
    }, [sectionPendingDelete, deleteSectionByKey]);

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
        const nextItem = createExerciseItem(exercise, 1); //position irrelevant since reindexPositions overwrites

        setCreationHighlight({
            type: 'item',
            key: getWorkoutItemKey(nextItem),
        });

        updateSection(sectionIndex, section => ({
            ...section,
            items: reindexPositions([
                ...(section.items ?? []),
                nextItem,
            ]),
        }));
    }, [updateSection]);

    const addStackToSection = useCallback((sectionIndex, itemType) => {
        const nextStack = createStackItem(itemType, 1); //position irrelevant since reindexPositions overwrites

        setCreationHighlight({
            type: 'item',
            key: getWorkoutItemKey(nextStack),
        });

        updateSection(sectionIndex, section => ({
            ...section,
            items: reindexPositions([
                ...(section.items ?? []),
                nextStack,
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

    const addExerciseToStack = useCallback((sectionIndex, stackItemIndex, exercise) => {
        const draftId = createDraftId('item-exercise');

        setCreationHighlight({
            type: 'stack-exercise',
            key: draftId,
        });

        updateStackItem(sectionIndex, stackItemIndex, stack => ({
            ...stack,
            itemExercises: reindexPositions([
                ...(stack.itemExercises ?? []),
                createStackExercise(
                    exercise,
                    (stack.itemExercises?.length ?? 0) + 1,
                    stack.rounds ?? 1,
                    draftId,
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

            <Modal
                opened={Boolean(sectionPendingDelete)}
                onClose={() => setSectionPendingDelete(null)}
                title={`Delete "${sectionPendingDelete?.name}"?`}
                centered
                zIndex='var(--mantine-z-index-popover)'
            >
                <Stack gap="lg">
                    <Text c="dimmed" size="sm">
                        This will remove the section and its {sectionPendingDelete?.itemCount} item
                        {sectionPendingDelete?.itemCount === 1 ? '' : 's'} from this workout.
                    </Text>

                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            onClick={() => setSectionPendingDelete(null)}
                        >
                            Keep section
                        </Button>

                        <Button
                            color="red"
                            onClick={confirmDeleteSection}
                        >
                            Delete section
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Stack gap="1.5rem">
                {sections.map((section, sectionIndex) => (
                    <WorkoutSection
                        key={getSectionKey(section)}
                        section={section}
                        sectionIndex={sectionIndex}
                        sectionCount={sections.length}
                        expanded={expandedSectionIds.has(getSectionKey(section))}
                        isNew={
                            creationHighlight?.type === 'section' &&
                            creationHighlight.key === getSectionKey(section)
                        }
                        highlightedTopLevelItemKey={
                            creationHighlight?.type === 'item'
                                ? creationHighlight.key
                                : null
                        }
                        highlightedStackExerciseKey={
                            creationHighlight?.type === 'stack-exercise'
                                ? creationHighlight.key
                                : null
                        }
                        validationIssues={getSectionValidationIssues(section)}
                        sectionActions={{
                            onToggle: () => toggleSection(section),
                            onMoveUp: () => moveSection(sectionIndex, -1),
                            onMoveDown: () => moveSection(sectionIndex, 1),
                            onDelete: () => requestDeleteSection(sectionIndex),
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
                            onViewExercise,
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

            <div
                ref={sectionListEndRef}
                aria-hidden="true"
                style={{height: 1}}
            />
        </Stack>
    );
}

export default WorkoutBuilder;