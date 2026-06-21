import {WORKOUT_ITEM_TYPE, WORKOUT_SECTION_TYPE, WORKOUT_SET_TYPE} from './workout-builder-constants';

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
        configJson: stringifyWorkoutConfig(createEmptyWorkoutConfig()),
        itemExercises: [],
    };
}

export function createStackItem(itemType, position = 1) {
    return {
        id: null,
        draftId: createDraftId('item'),
        position,
        itemType,
        exercise: null,
        exerciseId: null,
        name: '',
        rounds: 3,
        notes: '',
        configJson: null,
        itemExercises: [],
    };
}

export function createStackExercise(exercise, position = 1) {
    return {
        id: null,
        draftId: createDraftId('item-exercise'),
        exercise,
        exerciseId: exercise.id,
        position,
        name: '',
        notes: '',
        configJson: stringifyWorkoutConfig(createEmptyWorkoutConfig()),
    };
}

export function createEmptyWorkoutConfig() {
    return {
        trackingFields: [],
        sets: [],
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

export function parseWorkoutConfig(configJson) {
    if (!configJson) {
        return createEmptyWorkoutConfig();
    }

    if (typeof configJson === 'object') {
        return configJson;
    }

    try {
        return JSON.parse(configJson);
    } catch (error) {
        console.warn('Invalid workout config JSON:', error);
        return createEmptyWorkoutConfig();
    }
}

export function stringifyWorkoutConfig(config) {
    if (!config) {
        return null;
    }

    return JSON.stringify(config);
}