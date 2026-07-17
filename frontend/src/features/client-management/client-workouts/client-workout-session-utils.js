import {
    parseWorkoutConfig,
} from '../../workout-builder/draft/workout-draft-factory.js';
import {
    WORKOUT_ITEM_TYPE,
    WORKOUT_STACK_OPTIONS,
} from '../../workout-builder/workout-builder-constants.js';
import {
    getExerciseDisplayName,
    sortWorkoutPreviewItems,
} from '../../workout-builder/preview/workout-preview-utils.js';

export const CLIENT_WORKOUT_PROGRESS_STATUS = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
};

export function createClientWorkoutResultIndex(results = []) {
    const resultIndex = new Map();

    for (const result of results) {
        const resultKey = getClientWorkoutResultKey(result);

        if (!resultKey) {
            continue;
        }

        resultIndex.set(resultKey, {
            ...result,
            values: parseResultValues(result.valuesJson),
        });
    }

    return resultIndex;
}

export function buildClientWorkoutSessionProgress(workout, resultIndex) {
    const sections = sortWorkoutPreviewItems(
        workout?.sections ?? [],
    ).map(section => {
        const items = sortWorkoutPreviewItems(
            section.items ?? [],
        ).map(item => ({
            ...item,
            displayName: getClientWorkoutItemDisplayName(item),
            typeLabel: getClientWorkoutItemTypeLabel(item),
            progress: getClientWorkoutItemProgress(item, resultIndex),
        }));

        return {
            ...section,
            items,
            progress: createCollectionProgress(
                items.map(item => item.progress),
            ),
        };
    });

    return {
        sections,
        progress: createCollectionProgress(
            sections.flatMap(section =>
                section.items.map(item => item.progress)
            ),
        ),
    };
}

export function getClientWorkoutResultKey({clientWorkoutItemId, clientWorkoutItemExerciseId, setKey}) {
    if (!setKey) {
        return null;
    }

    if (clientWorkoutItemId) {
        return getDirectExerciseResultKey(
            clientWorkoutItemId,
            setKey,
        );
    }

    if (clientWorkoutItemExerciseId) {
        return getStackExerciseResultKey(
            clientWorkoutItemExerciseId,
            setKey,
        );
    }

    return null;
}

export function getDirectExerciseResultKey(itemId, setKey) {
    return `item:${itemId}:set:${setKey}`;
}

export function getStackExerciseResultKey(itemExerciseId, setKey) {
    return `item-exercise:${itemExerciseId}:set:${setKey}`;
}

function getClientWorkoutItemProgress(item, resultIndex) {
    if (item.itemType === WORKOUT_ITEM_TYPE.EXERCISE) {
        return getDirectExerciseProgress(item, resultIndex);
    }

    return getStackProgress(item, resultIndex);
}

function getDirectExerciseProgress(item, resultIndex) {
    const config = parseWorkoutConfig(item.configJson);
    const sets = sortWorkoutPreviewItems(config.sets ?? []);

    const setStatuses = sets.map(set =>
        getResultStatus(
            resultIndex.get(
                getDirectExerciseResultKey(
                    item.id,
                    set.setKey,
                ),
            ),
        )
    );

    return createUnitProgress(setStatuses, 'set');
}

function getStackProgress(item, resultIndex) {
    const itemExercises = sortWorkoutPreviewItems(
        item.itemExercises ?? [],
    );

    const exerciseSets = itemExercises.map(itemExercise => ({
        itemExercise,
        sets: sortWorkoutPreviewItems(
            parseWorkoutConfig(
                itemExercise.configJson,
            ).sets ?? [],
        ),
    }));

    const configuredRoundCount = Number(item.rounds);

    const roundCount =
        Number.isFinite(configuredRoundCount)
        && configuredRoundCount > 0
            ? configuredRoundCount
            : Math.max(0, ...exerciseSets.map(exercise => exercise.sets.length));

    const roundStatuses = [];

    let completedSetCount = 0;
    let startedSetCount = 0;
    let totalSetCount = 0;

    for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
        const childStatuses = exerciseSets.map(
            ({itemExercise, sets}) => {
                const set = sets[roundIndex];

                if (!set) {
                    return CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED;
                }

                const status = getResultStatus(resultIndex.get(
                    getStackExerciseResultKey(
                        itemExercise.id, set.setKey)
                    )
                );

                totalSetCount += 1;

                if (status !== CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED) {
                    startedSetCount += 1;
                }

                if (status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED) {
                    completedSetCount += 1;
                }

                return status;
            },
        );

        roundStatuses.push(
            getAggregateStatus(childStatuses),
        );
    }

    const progress = createUnitProgress(
        roundStatuses,
        'round',
    );

    return {
        ...progress,
        completedSetCount,
        startedSetCount,
        totalSetCount,
    };
}

function createUnitProgress(statuses, unitLabel) {
    const completedUnitCount = statuses.filter(status => status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED).length;

    const startedUnitCount = statuses.filter(status => status !== CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED).length;

    return {
        status: getAggregateStatus(statuses),
        completedUnitCount,
        startedUnitCount,
        totalUnitCount: statuses.length,
        unitLabel,

        completedSetCount: completedUnitCount,
        startedSetCount: startedUnitCount,
        totalSetCount: statuses.length,
    };
}

function createCollectionProgress(itemProgresses) {
    const statuses = itemProgresses.map(progress => progress.status);

    const completedItemCount = statuses.filter(status => status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED).length;

    const startedItemCount = statuses.filter(status => status !== CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED).length;

    return {
        status: getAggregateStatus(statuses),

        completedItemCount,
        startedItemCount,
        totalItemCount: statuses.length,

        completedSetCount: itemProgresses.reduce(
            (total, progress) => total + progress.completedSetCount, 0
        ),

        startedSetCount: itemProgresses.reduce(
            (total, progress) => total + progress.startedSetCount, 0
        ),

        totalSetCount: itemProgresses.reduce(
            (total, progress) => total + progress.totalSetCount, 0
        ),
    };
}

function getAggregateStatus(statuses) {
    if (!statuses.length) {
        return CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED;
    }

    if (statuses.every(status => status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED)) {
        return CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED;
    }

    if (statuses.some(status => status !== CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED)) {
        return CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS;
    }

    return CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED;
}

function getResultStatus(result) {
    if (!result) {
        return CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED;
    }

    return result.completedAt
        ? CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
        : CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS;
}

function getClientWorkoutItemDisplayName(item) {
    if (item.itemType === WORKOUT_ITEM_TYPE.EXERCISE) {
        return getExerciseDisplayName(item);
    }

    return item.name?.trim()
        || getClientWorkoutItemTypeLabel(item)
        || 'Workout stack';
}

function getClientWorkoutItemTypeLabel(item) {
    if (item.itemType === WORKOUT_ITEM_TYPE.EXERCISE) {
        return 'Exercise';
    }

    return WORKOUT_STACK_OPTIONS.find(
        option => option.value === item.itemType,
    )?.label ?? 'Stack';
}

function parseResultValues(valuesJson) {
    if (!valuesJson) {
        return {};
    }

    if (typeof valuesJson === 'object' && !Array.isArray(valuesJson)) {
        return valuesJson;
    }

    try {
        const values = JSON.parse(valuesJson);

        return values && typeof values === 'object' && !Array.isArray(values)
            ? values
            : {};
    } catch (error) {
        console.warn('Invalid client workout result JSON:', error);

        return {};
    }
}