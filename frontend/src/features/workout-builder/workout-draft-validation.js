import {WORKOUT_ITEM_TYPE} from './workout-builder-constants';
import {getExerciseId} from './workout-draft-mappers';
import {
    getStackOption,
    getStackRequirement,
    isStackComplete,
} from './workout-builder-utils';

export const WORKOUT_VALIDATION_SCOPE = {
    WORKOUT: 'WORKOUT',
    SECTION: 'SECTION',
    STACK: 'STACK',
    ITEM: 'ITEM',
};

export function validateWorkoutDraft(draft) {
    const issues = [];

    if (!draft) {
        issues.push({
            id: 'workout-draft-missing',
            scope: WORKOUT_VALIDATION_SCOPE.WORKOUT,
            message: 'Workout draft is missing.',
        });

        return issues;
    }

    if (!draft.name?.trim()) {
        issues.push({
            id: 'workout-name-required',
            scope: WORKOUT_VALIDATION_SCOPE.WORKOUT,
            field: 'name',
            message: 'Workout name is required.',
        });
    }

    const sections = draft.sections ?? [];

    if (sections.length === 0) {
        issues.push({
            id: 'workout-section-required',
            scope: WORKOUT_VALIDATION_SCOPE.WORKOUT,
            field: 'sections',
            message: 'Add at least one section to this workout.',
        });
    }

    sections.forEach((section, sectionIndex) => {
        validateSection(issues, section, sectionIndex);
    });

    return issues;
}

function validateSection(issues, section, sectionIndex) {
    const sectionKey = getDraftKey(section, `section-${sectionIndex}`);
    const items = section.items ?? [];

    if (items.length === 0) {
        issues.push({
            id: `section-items-required-${sectionKey}`,
            scope: WORKOUT_VALIDATION_SCOPE.SECTION,
            sectionKey,
            message: 'Add at least one item to this section.',
        });
    }

    items.forEach((item, itemIndex) => {
        validateItem(issues, item, sectionKey, itemIndex);
    });
}

function validateItem(issues, item, sectionKey, itemIndex) {
    const itemKey = getDraftKey(item, `item-${sectionKey}-${itemIndex}`);

    if (item.itemType === WORKOUT_ITEM_TYPE.EXERCISE) {
        validateExerciseItem(issues, item, sectionKey, itemKey);
        return;
    }

    if (!getStackOption(item.itemType)) {
        issues.push({
            id: `item-type-invalid-${itemKey}`,
            scope: WORKOUT_VALIDATION_SCOPE.ITEM,
            sectionKey,
            itemKey,
            message: 'This workout item has an invalid type.',
        });

        return;
    }

    validateStackItem(issues, item, sectionKey, itemKey);
}

function validateExerciseItem(issues, item, sectionKey, itemKey) {
    if (getExerciseId(item)) {
        return;
    }

    issues.push({
        id: `exercise-required-${itemKey}`,
        scope: WORKOUT_VALIDATION_SCOPE.ITEM,
        sectionKey,
        itemKey,
        message: 'Choose an exercise for this workout item.',
    });
}

function validateStackItem(issues, stack, sectionKey, stackKey) {
    const rounds = Number(stack.rounds);

    if (!Number.isInteger(rounds) || rounds < 1) {
        issues.push({
            id: `stack-rounds-invalid-${stackKey}`,
            scope: WORKOUT_VALIDATION_SCOPE.STACK,
            sectionKey,
            stackKey,
            message: 'Stack rounds must be at least 1.',
        });
    }

    if (!isStackComplete(stack)) {
        issues.push({
            id: `stack-requirement-${stackKey}`,
            scope: WORKOUT_VALIDATION_SCOPE.STACK,
            sectionKey,
            stackKey,
            message: getStackRequirement(stack),
        });
    }

    (stack.itemExercises ?? []).forEach((itemExercise, exerciseIndex) => {
        if (getExerciseId(itemExercise)) {
            return;
        }

        const exerciseKey = getDraftKey(
            itemExercise,
            `stack-exercise-${stackKey}-${exerciseIndex}`,
        );

        issues.push({
            id: `stack-exercise-required-${exerciseKey}`,
            scope: WORKOUT_VALIDATION_SCOPE.STACK,
            sectionKey,
            stackKey,
            exerciseKey,
            message: 'Choose an exercise for every stack entry.',
        });
    });
}

function getDraftKey(entity, fallback) {
    return entity?.draftId ?? entity?.id ?? fallback;
}