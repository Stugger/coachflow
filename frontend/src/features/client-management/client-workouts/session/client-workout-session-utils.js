import {
    parseWorkoutConfig,
} from '../../../workout-builder/draft/workout-draft-factory.js';
import {
    WORKOUT_ITEM_TYPE,
    WORKOUT_STACK_OPTIONS,
} from '../../../workout-builder/workout-builder-constants.js';
import {
    getExerciseDisplayName,
    sortWorkoutPreviewItems,
} from '../../../workout-builder/preview/workout-preview-utils.js';

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

export function findClientWorkoutSessionItem(workout, itemId, resultIndex) {
    const sessionProgress = buildClientWorkoutSessionProgress(workout, resultIndex);

    for (const section of sessionProgress.sections) {
        const item = section.items.find(item => String(item.id) === String(itemId));

        if (item) {
            return {section, item};
        }
    }

    return null;
}

export function findNextIncompleteClientWorkoutSessionItem(workout, itemId, resultIndex) {
    const sessionProgress = buildClientWorkoutSessionProgress(workout, resultIndex);

    const itemContexts = sessionProgress.sections.flatMap(section =>
        section.items.map(item => ({
            section,
            item,
        }))
    );

    const currentIndex = itemContexts.findIndex(context => String(context.item.id) === String(itemId));

    if (currentIndex < 0) {
        return null;
    }

    const candidates = [
        ...itemContexts.slice(currentIndex + 1),
        ...itemContexts.slice(0, currentIndex),
    ];

    return candidates.find(
        context => context.item.progress.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
    ) ?? null;
}

export function findNextClientWorkoutSessionItem(workout, itemId, resultIndex,) {
    const sessionProgress = buildClientWorkoutSessionProgress(workout, resultIndex,);

    const itemContexts = sessionProgress.sections.flatMap(section =>
        section.items.map(item => ({
            section,
            item,
        }))
    );

    const currentIndex = itemContexts.findIndex(context => String(context.item.id) === String(itemId));

    return currentIndex >= 0
        ? itemContexts[currentIndex + 1] ?? null
        : null;
}

export function getDirectExerciseSessionSets(item, resultIndex) {
    const config = parseWorkoutConfig(item.configJson);

    return {
        config,
        sets: sortWorkoutPreviewItems(config.sets ?? []).map((set, index) => {
            const result = resultIndex.get(getDirectExerciseResultKey(item.id, set.setKey)) ?? null;

            return {
                ...set,
                number: index + 1,
                result,
                status: getClientWorkoutResultStatus(result),
            };
        }),
    };
}

export function getStackSessionRounds(item, resultIndex) {
    const itemExercises = sortWorkoutPreviewItems(item.itemExercises ?? []).map(itemExercise => ({
        ...itemExercise,
        displayName: getExerciseDisplayName(itemExercise),
        config: parseWorkoutConfig(itemExercise.configJson),
    }));

    const configuredRoundCount = Number(item.rounds);

    const roundCount = Number.isFinite(configuredRoundCount) && configuredRoundCount > 0
        ? configuredRoundCount
        : Math.max(0, ...itemExercises.map(itemExercise => itemExercise.config.sets.length));

    const rounds = Array.from({length: roundCount}, (_, roundIndex) => {
        const exercises = itemExercises.map(itemExercise => {
            const set = sortWorkoutPreviewItems(itemExercise.config.sets ?? [])[roundIndex] ?? null;

            const result = set
                ? resultIndex.get(getStackExerciseResultKey(itemExercise.id, set.setKey)) ?? null
                : null;

            return {
                itemExercise,
                config: itemExercise.config,
                set,
                result,
                status: set
                    ? getClientWorkoutResultStatus(result)
                    : CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED,
            };
        });

        return {
            number: roundIndex + 1,
            exercises,
            status: getAggregateStatus(exercises.map(exercise => exercise.status)),
        };
    });

    return {itemExercises, rounds};
}

export function getDirectExerciseResultKey(itemId, setKey) {
    return `item:${itemId}:set:${setKey}`;
}

export function getStackExerciseResultKey(itemExerciseId, setKey) {
    return `item-exercise:${itemExerciseId}:set:${setKey}`;
}

export function getClientWorkoutResultStatus(result) {
    if (!result) {
        return CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED;
    }

    return result.completedAt
        ? CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
        : CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS;
}

function getClientWorkoutItemProgress(item, resultIndex) {
    if (item.itemType === WORKOUT_ITEM_TYPE.EXERCISE) {
        const {sets} = getDirectExerciseSessionSets(item, resultIndex);

        return createUnitProgress(
            sets.map(set => set.status),
            'set',
        );
    }

    const {rounds} = getStackSessionRounds(item, resultIndex);
    const progress = createUnitProgress(rounds.map(round => round.status), 'round');
    const exercises = rounds.flatMap(round => round.exercises).filter(exercise => exercise.set);

    return {
        ...progress,
        completedSetCount: exercises.filter(
            exercise => exercise.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
        ).length,
        startedSetCount: exercises.filter(
            exercise => exercise.status !== CLIENT_WORKOUT_PROGRESS_STATUS.NOT_STARTED,
        ).length,
        totalSetCount: exercises.length,
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