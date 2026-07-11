export const EXERCISE_UNITS = {
    POUNDS: {
        value: 'LB',
        label: 'lb',
    },
    KILOGRAMS: {
        value: 'KG',
        label: 'kg',
    },
    SECONDS: {
        value: 'SECONDS',
        label: 'sec',
    },
    MILES: {
        value: 'MILES',
        label: 'mi',
    },
    KILOMETERS: {
        value: 'KILOMETERS',
        label: 'km',
    },
    METERS: {
        value: 'METERS',
        label: 'm',
    },
    FEET: {
        value: 'FEET',
        label: 'ft',
    },
    INCHES: {
        value: 'INCHES',
        label: 'in',
    },
    MILES_PER_HOUR: {
        value: 'MPH',
        label: 'mph',
    },
    PERCENT: {
        value: 'PERCENT',
        label: '%',
    },
};

export const EXERCISE_UNIT_OPTIONS = Object.values(EXERCISE_UNITS);

const EXERCISE_UNITS_BY_VALUE = Object.fromEntries(
    EXERCISE_UNIT_OPTIONS.map(unit => [unit.value, unit])
);

export function getExerciseUnit(value) {
    return EXERCISE_UNITS_BY_VALUE[value] ?? null;
}

export function getExerciseUnitLabel(value) {
    return getExerciseUnit(value)?.label ?? value ?? null;
}
