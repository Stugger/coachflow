import {
    IconStack,
    IconStack2,
    IconStack3,
} from '@tabler/icons-react';

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

export const WORKOUT_STACK_OPTIONS = [
    {
        value: WORKOUT_ITEM_TYPE.SUPERSET,
        label: 'Superset',
        color: 'blue',
        icon: IconStack,
        minExercises: 2,
        maxExercises: 2,
        requirement: 'Requires exactly 2 exercises',
    },
    {
        value: WORKOUT_ITEM_TYPE.TRISET,
        label: 'Triset',
        color: 'violet',
        icon: IconStack2,
        minExercises: 3,
        maxExercises: 3,
        requirement: 'Requires exactly 3 exercises',
    },
    {
        value: WORKOUT_ITEM_TYPE.CIRCUIT,
        label: 'Circuit',
        color: 'orange',
        icon: IconStack3,
        minExercises: 2,
        maxExercises: null,
        requirement: 'Requires at least 2 exercises',
    },
];

export const WORKOUT_SET_TYPE = {
    STANDARD: 'STANDARD',
    WARMUP: 'WARMUP',
    DROP: 'DROP',
    FAILURE: 'FAILURE',
};

export const TRACKING_FIELD_TYPE = {
    INTEGER: 'INTEGER',
    DECIMAL: 'DECIMAL',
    RANGE: 'RANGE',
    TIME: 'TIME',
    TEXT: 'TEXT',
    TEXT_LONG: 'TEXT_LONG',
};