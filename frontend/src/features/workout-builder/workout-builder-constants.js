export const WORKOUT_SECTION_TYPE = {
    REGULAR: 'REGULAR',
    WARMUP: 'WARMUP',
    STRENGTH: 'STRENGTH',
    CARDIO: 'CARDIO',
    MOBILITY: 'MOBILITY',
    STABILITY: 'STABILITY',
    COOLDOWN: 'COOLDOWN',
    OTHER: 'OTHER',
};

export const WORKOUT_SECTION_TYPE_OPTIONS = [
    {value: WORKOUT_SECTION_TYPE.REGULAR, label: 'Regular'},
    {value: WORKOUT_SECTION_TYPE.WARMUP, label: 'Warm Up'},
    {value: WORKOUT_SECTION_TYPE.STRENGTH, label: 'Strength'},
    {value: WORKOUT_SECTION_TYPE.CARDIO, label: 'Cardio'},
    {value: WORKOUT_SECTION_TYPE.MOBILITY, label: 'Mobility'},
    {value: WORKOUT_SECTION_TYPE.STABILITY, label: 'Stability'},
    {value: WORKOUT_SECTION_TYPE.COOLDOWN, label: 'Cooldown'},
    {value: WORKOUT_SECTION_TYPE.OTHER, label: 'Other'},
];

export const WORKOUT_ITEM_TYPE = {
    EXERCISE: 'EXERCISE',
    SUPERSET: 'SUPERSET',
    TRISET: 'TRISET',
    CIRCUIT: 'CIRCUIT',
};

export const WORKOUT_SET_TYPE = {
    STANDARD: 'STANDARD',
    WARMUP: 'WARMUP',
    DROP: 'DROP',
    FAILURE: 'FAILURE',
};

export const TRACKING_FIELD_TYPE = {
    INTEGER: 'INTEGER',
    DECIMAL: 'DECIMAL',
    WEIGHT: 'WEIGHT',
    DISTANCE: 'DISTANCE',
    DURATION: 'DURATION',
    PERCENT: 'PERCENT',
    TEXT: 'TEXT',
};

export const TRACKING_FIELD_SCOPE = {
    EXERCISE: 'EXERCISE',
    PER_SET: 'PER_SET',
    PER_SIDE: 'PER_SIDE',
};