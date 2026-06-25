import {WORKOUT_ITEM_TYPE, WORKOUT_SECTION_TYPE, WORKOUT_SET_TYPE} from './workout-builder-constants';
import * as ExerciseMetadataUtils from '../../utils/exercise-metadata-utils';
import {createTrackingField, TRACKING_FIELD_DEFINITIONS,} from './workout-tracking-fields';

export function createDraftId(prefix) {
    if (crypto.randomUUID) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyWorkoutDraft(trainerId) {
    return {
        id: null,
        trainerId,
        name: '',
        description: '',
        coverImageUrl: '',
        sections: [],
    };
}

export function createWorkoutSection(position = 1) {
    return {
        id: null,
        draftId: createDraftId('section'),
        position,
        name: '',
        sectionType: WORKOUT_SECTION_TYPE.REGULAR,
        notes: '',
        items: [],
    };
}

export function createExerciseItem(exercise, position = 1) {
    return {
        id: null,
        draftId: createDraftId('item'),
        position,
        itemType: WORKOUT_ITEM_TYPE.EXERCISE,
        exercise,
        exerciseId: exercise.id,
        name: '',
        rounds: null,
        notes: '',
        configJson: stringifyWorkoutConfig(
            createWorkoutConfigFromExercise(exercise),
        ),
        itemExercises: [],
    };
}

export function createStackItem(itemType, position = 1) {
    return {
        id: null,
        draftId: createDraftId('stack-item'),
        position,
        itemType,
        exercise: null,
        exerciseId: null,
        name: '',
        rounds: 1,
        notes: '',
        configJson: null,
        itemExercises: [],
    };
}

export function createStackExercise(exercise, position = 1, rounds = 1) {
    const configJson = stringifyWorkoutConfig(
        createWorkoutConfigFromExercise(exercise),
    );

    return {
        id: null,
        draftId: createDraftId('item-exercise'),
        exercise,
        exerciseId: exercise.id,
        position,
        name: '',
        notes: '',
        configJson: resizeExerciseSetCount(configJson, rounds),
    };
}

export function createWorkoutConfigFromExercise(exercise) {
    const metadata = ExerciseMetadataUtils.parseExerciseMetadataJson(
        exercise?.metadataJson,
    );

    const trackingFields = [...new Set(metadata.defaultTrackingFields ?? [])]
        .filter(key => TRACKING_FIELD_DEFINITIONS[key])
        .map((key, index) => createTrackingField(key, index + 1));

    return {
        ...createEmptyWorkoutConfig(),
        trackingFields,
    };
}

export function createEmptyWorkoutConfig() {
    return {
        eachSide: false,
        trackingFields: [],
        sets: [
            createWorkoutSet(),
        ],
    };
}

export function createWorkoutSet(position = 1) {
    return {
        draftId: createDraftId('set'),
        position,
        setType: WORKOUT_SET_TYPE.STANDARD,
        targets: {},
    };
}

export function resizeExerciseSetCount(configJson, count, {duplicateLastSet = false} = {}) {
    const config = parseWorkoutConfig(configJson);

    const nextSets = [...config.sets];

    while (nextSets.length < count) {
        const previousSet = nextSets.at(-1);

        nextSets.push(
            duplicateLastSet && previousSet
                ? {
                    ...structuredClone(previousSet),
                    draftId: createDraftId('set'),
                    position: nextSets.length + 1,
                }
                : createWorkoutSet(nextSets.length + 1),
        );
    }

    while (nextSets.length > count) {
        nextSets.pop();
    }

    return stringifyWorkoutConfig({
        ...config,
        sets: nextSets.map((set, index) => ({
            ...set,
            position: index + 1,
        })),
    });
}

export function parseWorkoutConfig(configJson) {
    let config;

    if (!configJson) {
        config = createEmptyWorkoutConfig();
    } else if (typeof configJson === 'object') {
        config = configJson;
    } else {
        try {
            config = JSON.parse(configJson);
        } catch (error) {
            console.warn('Invalid workout config JSON:', error);
            config = createEmptyWorkoutConfig();
        }
    }

    const sets = config.sets?.length
        ? config.sets.map((set, index) => {
            const position = set.position ?? index + 1;

            return {
                draftId: set.draftId ?? `set-${position}`,
                position,
                setType: set.setType ?? WORKOUT_SET_TYPE.STANDARD,
                targets: set.targets ?? {},
            };
        })
        : [createWorkoutSet()];

    return {
        eachSide: config.eachSide ?? false,
        trackingFields: config.trackingFields ?? [],
        sets,
    };
}

export function stringifyWorkoutConfig(config) {
    if (!config) {
        return null;
    }

    return JSON.stringify({
        eachSide: config.eachSide ?? false,
        trackingFields: [...(config.trackingFields ?? [])]
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((field, index) => ({
                key: field.key,
                position: index + 1,
                ...(field.mode ? {mode: field.mode} : {}),
                ...(field.unit ? {unit: field.unit} : {}),
            })),
        sets: (config.sets ?? []).map((set, index) => ({
            position: index + 1,
            setType: set.setType ?? WORKOUT_SET_TYPE.STANDARD,
            targets: normalizeTargets(set.targets),
        })),
    });
}

export function pruneUnusedTargets(config) {
    const trackedKeys = new Set(
        (config.trackingFields ?? []).map(field => field.key)
    );

    return {
        ...config,
        sets: (config.sets ?? []).map(set => ({
            ...set,
            targets: Object.fromEntries(
                Object.entries(set.targets ?? {})
                    .filter(([fieldKey]) => trackedKeys.has(fieldKey))
            ),
        })),
    };
}

function normalizeTargets(targets) {
    return Object.fromEntries(
        Object.entries(targets ?? {})
            .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
            .map(([key, value]) => [
                key,
                value && typeof value === 'object' && !Array.isArray(value)
                    ? Object.fromEntries(
                        Object.entries(value)
                            .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
                    )
                    : value,
            ])
    );
}