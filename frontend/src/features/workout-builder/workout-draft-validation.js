import {WORKOUT_ITEM_TYPE} from './workout-builder-constants';
import {getExerciseId} from './workout-draft-mappers';

export function validateWorkoutDraft(draft) {
    const errors = [];

    if (!draft) {
        errors.push('Workout draft is missing.');
        return errors;
    }

    if (!draft.name?.trim()) {
        errors.push('Workout name is required.');
    }

    (draft.sections ?? []).forEach((section, sectionIndex) => {
        validateSection(errors, section, sectionIndex);
    });

    return errors;
}

function validateSection(errors, section, sectionIndex) {
    const sectionLabel = section.name?.trim() || `Section ${sectionIndex + 1}`;

    if (!section.sectionType) {
        errors.push(`${sectionLabel} needs a section type.`);
    }

    (section.items ?? []).forEach((item, itemIndex) => {
        validateItem(errors, item, sectionLabel, itemIndex);
    });
}

function validateItem(errors, item, sectionLabel, itemIndex) {
    const itemLabel = `${sectionLabel}, item ${itemIndex + 1}`;

    if (!item.itemType) {
        errors.push(`${itemLabel} needs an item type.`);
        return;
    }

    if (item.itemType === WORKOUT_ITEM_TYPE.EXERCISE) {
        validateExerciseItem(errors, item, itemLabel);
        return;
    }

    if (item.itemType === WORKOUT_ITEM_TYPE.SUPERSET) {
        validateStackItem(errors, item, itemLabel, 2, 2);
        return;
    }

    if (item.itemType === WORKOUT_ITEM_TYPE.TRISET) {
        validateStackItem(errors, item, itemLabel, 3, 3);
        return;
    }

    if (item.itemType === WORKOUT_ITEM_TYPE.CIRCUIT) {
        validateStackItem(errors, item, itemLabel, 2, null);
        return;
    }

    errors.push(`${itemLabel} has an unknown item type.`);
}

function validateExerciseItem(errors, item, itemLabel) {
    if (!getExerciseId(item)) {
        errors.push(`${itemLabel} needs an exercise.`);
    }

    if (item.rounds !== null && item.rounds !== undefined && item.rounds !== '') {
        errors.push(`${itemLabel} should not have rounds. Rounds are only for stacks.`);
    }

    if ((item.itemExercises ?? []).length > 0) {
        errors.push(`${itemLabel} should not have stack exercises.`);
    }
}

function validateStackItem(errors, item, itemLabel, minExercises, exactExercises) {
    const rounds = Number(item.rounds);
    const childExercises = item.itemExercises ?? [];

    if (!Number.isFinite(rounds) || rounds <= 0) {
        errors.push(`${itemLabel} needs at least 1 round.`);
    }

    if (getExerciseId(item)) {
        errors.push(`${itemLabel} should not have a direct exercise. Add exercises inside the stack instead.`);
    }

    if (exactExercises !== null && childExercises.length !== exactExercises) {
        errors.push(`${itemLabel} needs exactly ${exactExercises} exercises.`);
    }

    if (exactExercises === null && childExercises.length < minExercises) {
        errors.push(`${itemLabel} needs at least ${minExercises} exercises.`);
    }

    childExercises.forEach((itemExercise, itemExerciseIndex) => {
        if (!getExerciseId(itemExercise)) {
            errors.push(`${itemLabel}, stack exercise ${itemExerciseIndex + 1} needs an exercise.`);
        }
    });
}