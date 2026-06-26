import {TRACKING_FIELD_TYPE} from './workout-builder-constants';

export const TRACKING_FIELD_KEY = {
    REPS: 'reps',
    WEIGHT: 'weight',
    TIME: 'time',
    DISTANCE: 'distance',
    SPEED: 'speed',
    INCLINE: 'incline',
    HEIGHT: 'height',
    RESISTANCE: 'resistance',
    RPE: 'rpe',
    REST: 'rest',
    NOTES: 'notes',
};

export const TRACKING_FIELD_DEFINITIONS = {
    [TRACKING_FIELD_KEY.REPS]: {
        key: TRACKING_FIELD_KEY.REPS,
        label: 'Reps',
        modes: [
            {
                value: 'INTEGER',
                label: 'Fixed',
                type: TRACKING_FIELD_TYPE.INTEGER,
                minColumnWidth: '7rem',
                inputWidth: '5rem',
            },
            {
                value: 'RANGE',
                label: 'Range',
                type: TRACKING_FIELD_TYPE.RANGE,
                minColumnWidth: '10rem',
                inputWidth: '3rem',
            },
        ],
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
        minColumnWidth: '7rem',
        inputWidth: '5rem',
    },
    [TRACKING_FIELD_KEY.TIME]: {
        key: TRACKING_FIELD_KEY.TIME,
        label: 'Time',
        type: TRACKING_FIELD_TYPE.TIME,
        minColumnWidth: '8rem',
        inputWidth: '6rem',
        modes: [
            {
                value: 'TIMER',
                label: 'Countdown',
            },
            {
                value: 'STOPWATCH',
                label: 'Stopwatch',
            },
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
        minColumnWidth: '7rem',
        inputWidth: '5rem',
    },
    [TRACKING_FIELD_KEY.SPEED]: {
        key: TRACKING_FIELD_KEY.SPEED,
        label: 'Speed',
        type: TRACKING_FIELD_TYPE.DECIMAL,
        unit: 'MPH',
        minColumnWidth: '7rem',
        inputWidth: '5rem',
    },
    [TRACKING_FIELD_KEY.INCLINE]: {
        key: TRACKING_FIELD_KEY.INCLINE,
        label: 'Incline',
        type: TRACKING_FIELD_TYPE.DECIMAL,
        unit: '%',
        minColumnWidth: '7rem',
        inputWidth: '5rem',
    },
    [TRACKING_FIELD_KEY.HEIGHT]: {
        key: TRACKING_FIELD_KEY.HEIGHT,
        label: 'Height',
        type: TRACKING_FIELD_TYPE.DECIMAL,
        unit: 'FEET',
        units: [
            {value: 'FEET', label: 'ft'},
            {value: 'INCHES', label: 'in'},
        ],
        minColumnWidth: '7rem',
        inputWidth: '5rem',
    },
    [TRACKING_FIELD_KEY.RESISTANCE]: {
        key: TRACKING_FIELD_KEY.RESISTANCE,
        label: 'Resistance',
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
                minColumnWidth: '7rem',
                inputWidth: '5rem',
            },
            {
                value: 'LEVEL',
                label: 'Level',
                type: TRACKING_FIELD_TYPE.TEXT,
                minColumnWidth: '10rem',
                inputWidth: '8rem',
            },
        ],
    },
    [TRACKING_FIELD_KEY.RPE]: {
        key: TRACKING_FIELD_KEY.RPE,
        label: 'RPE',
        type: TRACKING_FIELD_TYPE.DECIMAL,
        minColumnWidth: '7rem',
        inputWidth: '5rem',
    },
    [TRACKING_FIELD_KEY.REST]: {
        key: TRACKING_FIELD_KEY.REST,
        label: 'Rest',
        type: TRACKING_FIELD_TYPE.TIME,
        minColumnWidth: '8rem',
        inputWidth: '6rem',
    },
    [TRACKING_FIELD_KEY.NOTES]: {
        key: TRACKING_FIELD_KEY.NOTES,
        label: 'Notes',
        type: TRACKING_FIELD_TYPE.TEXT_LONG,
        minColumnWidth: '14rem',
        inputWidth: '12rem',
    },
};

export const TRACKING_FIELD_OPTIONS = Object.values(TRACKING_FIELD_DEFINITIONS).map(field => ({
    value: field.key,
    label: field.label,
}));

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