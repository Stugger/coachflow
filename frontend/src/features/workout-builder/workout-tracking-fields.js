import {TRACKING_FIELD_SCOPE, TRACKING_FIELD_TYPE} from './workout-builder-constants';

export const TRACKING_FIELD_KEY = {
    REPS: 'reps',
    WEIGHT: 'weight',
    TIME: 'time',
    DISTANCE: 'distance',
    SPEED: 'speed',
    INCLINE: 'incline',
    REST: 'rest',
    RPE: 'rpe',
    NOTES: 'notes',
};

export const TRACKING_FIELD_DEFINITIONS = {
    [TRACKING_FIELD_KEY.REPS]: {
        key: TRACKING_FIELD_KEY.REPS,
        label: 'Reps',
        type: TRACKING_FIELD_TYPE.INTEGER,
        unit: null,
        defaultScope: TRACKING_FIELD_SCOPE.PER_SET,
    },
    [TRACKING_FIELD_KEY.WEIGHT]: {
        key: TRACKING_FIELD_KEY.WEIGHT,
        label: 'Weight',
        type: TRACKING_FIELD_TYPE.WEIGHT,
        unit: 'LB',
        defaultScope: TRACKING_FIELD_SCOPE.PER_SET,
    },
    [TRACKING_FIELD_KEY.TIME]: {
        key: TRACKING_FIELD_KEY.TIME,
        label: 'Time',
        type: TRACKING_FIELD_TYPE.DURATION,
        unit: 'SECONDS',
        defaultScope: TRACKING_FIELD_SCOPE.PER_SET,
    },
    [TRACKING_FIELD_KEY.REST]: {
        key: TRACKING_FIELD_KEY.REST,
        label: 'Rest',
        type: TRACKING_FIELD_TYPE.DURATION,
        unit: 'SECONDS',
        defaultScope: TRACKING_FIELD_SCOPE.PER_SET,
    },
    [TRACKING_FIELD_KEY.DISTANCE]: {
        key: TRACKING_FIELD_KEY.DISTANCE,
        label: 'Distance',
        type: TRACKING_FIELD_TYPE.DISTANCE,
        unit: 'MILES',
        defaultScope: TRACKING_FIELD_SCOPE.EXERCISE,
    },
    [TRACKING_FIELD_KEY.SPEED]: {
        key: TRACKING_FIELD_KEY.SPEED,
        label: 'Speed',
        type: TRACKING_FIELD_TYPE.DECIMAL,
        unit: 'MPH',
        defaultScope: TRACKING_FIELD_SCOPE.EXERCISE,
    },
    [TRACKING_FIELD_KEY.INCLINE]: {
        key: TRACKING_FIELD_KEY.INCLINE,
        label: 'Incline',
        type: TRACKING_FIELD_TYPE.PERCENT,
        unit: '%',
        defaultScope: TRACKING_FIELD_SCOPE.EXERCISE,
    },
    [TRACKING_FIELD_KEY.RPE]: {
        key: TRACKING_FIELD_KEY.RPE,
        label: 'RPE',
        type: TRACKING_FIELD_TYPE.DECIMAL,
        unit: null,
        defaultScope: TRACKING_FIELD_SCOPE.PER_SET,
    },
    [TRACKING_FIELD_KEY.NOTES]: {
        key: TRACKING_FIELD_KEY.NOTES,
        label: 'Notes',
        type: TRACKING_FIELD_TYPE.TEXT,
        unit: null,
        defaultScope: TRACKING_FIELD_SCOPE.PER_SET,
    },
};

export const TRACKING_FIELD_OPTIONS = Object.values(TRACKING_FIELD_DEFINITIONS);

export function createTrackingField(key) {
    const definition = TRACKING_FIELD_DEFINITIONS[key];

    if (!definition) {
        throw new Error(`Unknown tracking field: ${key}`);
    }

    return {
        key: definition.key,
        label: definition.label,
        type: definition.type,
        unit: definition.unit,
        scope: definition.defaultScope,
    };
}