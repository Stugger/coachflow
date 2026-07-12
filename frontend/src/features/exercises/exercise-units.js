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

// ------------------------------------------------------------------------------------------------------------------------
// Conversions
// ------------------------------------------------------------------------------------------------------------------------

const POUNDS_PER_KILOGRAM = 2.2046226218487757;

export function convertExerciseUnitValue(value, fromUnit, toUnit) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return null;
    }

    if (fromUnit === toUnit) {
        return numericValue;
    }

    if (fromUnit === EXERCISE_UNITS.POUNDS.value && toUnit === EXERCISE_UNITS.KILOGRAMS.value) {
        return numericValue / POUNDS_PER_KILOGRAM;
    }

    if (fromUnit === EXERCISE_UNITS.KILOGRAMS.value && toUnit === EXERCISE_UNITS.POUNDS.value) {
        return numericValue * POUNDS_PER_KILOGRAM;
    }

    return null;
}
