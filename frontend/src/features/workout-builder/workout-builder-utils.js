import {WORKOUT_SECTION_TYPE_OPTIONS, WORKOUT_STACK_OPTIONS} from './workout-builder-constants';

export function getWorkoutItemKey(item) {
    return item.draftId || item.id;
}

/* Sections */

export function getSectionKey(section) {
    return section.draftId || section.id;
}

export function getSectionDisplayName(section) {
    return section.name?.trim() || `Section ${section.position}`;
}

export function getSectionTypeLabel(sectionType) {
    return WORKOUT_SECTION_TYPE_OPTIONS.find(option => option.value === sectionType)?.label || 'Regular';
}

/* Stacks */

export function getStackOption(itemType) {
    return WORKOUT_STACK_OPTIONS.find(option => option.value === itemType);
}

export function canAddExerciseToStack(stack) {
    const option = getStackOption(stack.itemType);
    const count = stack.itemExercises?.length ?? 0;

    return !option?.maxExercises || count < option.maxExercises;
}

export function getStackRequirement(stack) {
    return getStackOption(stack.itemType)?.requirement || 'Requires at least 2 exercises';
}

export function isStackComplete(stack) {
    const option = getStackOption(stack.itemType);
    const count = stack.itemExercises?.length ?? 0;

    if (!option) {
        return false;
    }

    if (option.maxExercises) {
        return count === option.maxExercises;
    }

    return count >= option.minExercises;
}