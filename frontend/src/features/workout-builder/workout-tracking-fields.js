import {TRACKING_FIELD_TYPE} from './workout-builder-constants';

export const TRACKING_FIELD_KEY = {
    REPS: 'reps',
    WEIGHT: 'weight',
    TIME: 'time',
    DISTANCE: 'distance',
    SPEED: 'speed',
    INCLINE: 'incline',
    RESISTANCE: 'resistance',
    REST: 'rest',
    RPE: 'rpe',
    NOTES: 'notes',
};

export const TRACKING_FIELD_DEFINITIONS = {
    [TRACKING_FIELD_KEY.REPS]: {
        key: TRACKING_FIELD_KEY.REPS,
        label: 'Reps',
        type: TRACKING_FIELD_TYPE.RANGE,
        unit: null,
    },
    [TRACKING_FIELD_KEY.WEIGHT]: {
        key: TRACKING_FIELD_KEY.WEIGHT,
        label: 'Weight',
        type: TRACKING_FIELD_TYPE.DECIMAL,
        unit: 'LB',
        units: [
            {value: 'LB', label: 'lb'},
            {value: 'KG', label: 'kg'},
        ],
    },
    [TRACKING_FIELD_KEY.TIME]: {
        key: TRACKING_FIELD_KEY.TIME,
        label: 'Time',
        type: TRACKING_FIELD_TYPE.TIME,
        unit: 'SECONDS',
        units: [
            {value: 'SECONDS', label: 'sec'},
            {value: 'MINUTES', label: 'min'},
        ],
    },
    [TRACKING_FIELD_KEY.DISTANCE]: {
        key: TRACKING_FIELD_KEY.DISTANCE,
        label: 'Distance',
        type: TRACKING_FIELD_TYPE.DECIMAL,
        unit: 'MILES',
        units: [
            {value: 'MILES', label: 'mi'},
            {value: 'KILOMETERS', label: 'km'},
            {value: 'METERS', label: 'm'},
            {value: 'FEET', label: 'ft'},
        ],
    },
    [TRACKING_FIELD_KEY.SPEED]: {
        key: TRACKING_FIELD_KEY.SPEED,
        label: 'Speed',
        type: TRACKING_FIELD_TYPE.DECIMAL,
        unit: 'MPH',
    },
    [TRACKING_FIELD_KEY.INCLINE]: {
        key: TRACKING_FIELD_KEY.INCLINE,
        label: 'Incline',
        type: TRACKING_FIELD_TYPE.DECIMAL,
        unit: '%',
    },
    [TRACKING_FIELD_KEY.RESISTANCE]: {
        key: TRACKING_FIELD_KEY.RESISTANCE,
        label: 'Resistance',
        type: TRACKING_FIELD_TYPE.DECIMAL,
        unit: 'LB',
        modes: [
            {
                value: 'LOAD',
                label: 'Numeric load',
                type: TRACKING_FIELD_TYPE.DECIMAL,
                unit: 'LB',
                units: [
                    {value: 'LB', label: 'lb'},
                    {value: 'KG', label: 'kg'},
                ],
            },
            {
                value: 'LEVEL',
                label: 'Resistance level',
                type: TRACKING_FIELD_TYPE.TEXT,
                unit: null,
            },
        ],
    },
    [TRACKING_FIELD_KEY.RPE]: {
        key: TRACKING_FIELD_KEY.RPE,
        label: 'RPE',
        type: TRACKING_FIELD_TYPE.DECIMAL,
        unit: null,
    },
    [TRACKING_FIELD_KEY.REST]: {
        key: TRACKING_FIELD_KEY.REST,
        label: 'Rest',
        type: TRACKING_FIELD_TYPE.TIME,
        unit: 'SECONDS',
    },
    [TRACKING_FIELD_KEY.NOTES]: {
        key: TRACKING_FIELD_KEY.NOTES,
        label: 'Notes',
        type: TRACKING_FIELD_TYPE.TEXT,
        unit: null,
    },
};

export const TRACKING_FIELD_OPTIONS = Object.values(TRACKING_FIELD_DEFINITIONS);

export function createTrackingField(key, position = 1) {
    const definition = TRACKING_FIELD_DEFINITIONS[key];

    if (!definition) {
        throw new Error(`Unknown tracking field: ${key}`);
    }

    const defaultMode = definition.modes?.[0];

    return {
        key: definition.key,
        position,
        ...(defaultMode ? {mode: defaultMode.value} : {}),
        ...(defaultMode?.unit
            ? {unit: defaultMode.unit}
            : definition.unit
                ? {unit: definition.unit}
                : {}),
    };
}