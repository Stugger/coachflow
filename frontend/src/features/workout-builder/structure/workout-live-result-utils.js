import {getStackExerciseResultKey} from '../../client-management/client-workouts/session/client-workout-session-utils.js';
import {parseWorkoutConfig} from '../draft/workout-draft-factory.js';
import {WORKOUT_ITEM_TYPE} from '../workout-builder-constants.js';

export function hasDirectExerciseResults(item, resultIndex) {
    if (item?.id == null || !resultIndex) {
        return false;
    }

    return hasMatchingResult(
        resultIndex,
        result => result.clientWorkoutItemId != null && String(result.clientWorkoutItemId) === String(item.id),
    );
}

export function hasStackExerciseResults(itemExercise, resultIndex) {
    if (itemExercise?.id == null || !resultIndex) {
        return false;
    }

    return hasMatchingResult(
        resultIndex,
        result => result.clientWorkoutItemExerciseId != null && String(result.clientWorkoutItemExerciseId) === String(itemExercise.id),
    );
}

export function hasWorkoutItemResults(item, resultIndex) {
    if (item?.itemType === WORKOUT_ITEM_TYPE.EXERCISE) {
        return hasDirectExerciseResults(item, resultIndex);
    }

    return (item?.itemExercises ?? [])
        .some(itemExercise => hasStackExerciseResults(itemExercise, resultIndex));
}

export function hasWorkoutSectionResults(section, resultIndex) {
    return (section?.items ?? []).some(
        item => hasWorkoutItemResults(item, resultIndex),
    );
}

export function hasRemovedStackRoundResults(stack, resultIndex) {
    if (!resultIndex) {
        return false;
    }

    const roundCount = Number(stack?.rounds ?? 1);

    if (!Number.isFinite(roundCount) || roundCount <= 1) {
        return false;
    }

    const removedRoundIndex = roundCount - 1;

    return (stack.itemExercises ?? []).some(itemExercise => {
        if (itemExercise.id == null) {
            return false;
        }

        const config = parseWorkoutConfig(itemExercise.configJson);

        const sets = [...(config.sets ?? [])].sort(
            (a, b) => a.position - b.position,
        );

        const removedSet = sets[removedRoundIndex];

        if (!removedSet?.setKey) {
            return false;
        }

        return resultIndex.has(getStackExerciseResultKey(itemExercise.id, removedSet.setKey));
    });
}

function hasMatchingResult(resultIndex, predicate) {
    for (const result of resultIndex.values()) {
        if (predicate(result)) {
            return true;
        }
    }

    return false;
}