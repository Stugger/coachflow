import {
    TRACKING_FIELD_KEY,
} from '../../exercises/exercise-tracking-fields.js';

import * as ExerciseMetadataUtils from '../../exercises/exercise-metadata-utils.js';
import {EXERCISE_UNITS, getExerciseUnitLabel} from '../../exercises/exercise-units.js';

export const EXERCISE_BENCHMARK_TYPE = {
    ONE_REP_MAX: 'ONE_REP_MAX',
};

export const EXERCISE_BENCHMARK_BASIS = {
    MANUAL: 'MANUAL',
    MEASURED: 'MEASURED',
    ESTIMATED: 'ESTIMATED',
};

export const EXERCISE_BENCHMARK_DEFINITIONS = {
    [EXERCISE_BENCHMARK_TYPE.ONE_REP_MAX]: {
        type: EXERCISE_BENCHMARK_TYPE.ONE_REP_MAX,
        label: '1 Rep Max',
        shortLabel: '1RM',
        requiredTrackingFields: [
            TRACKING_FIELD_KEY.REPS,
            TRACKING_FIELD_KEY.WEIGHT,
        ],
        units: [
            EXERCISE_UNITS.POUNDS,
            EXERCISE_UNITS.KILOGRAMS,
        ],
        defaultUnit: EXERCISE_UNITS.POUNDS.value,
    },
};

export const EXERCISE_BENCHMARK_OPTIONS =
    Object.values(EXERCISE_BENCHMARK_DEFINITIONS).map(definition => ({
        value: definition.type,
        label: definition.label,
    }));

const EXERCISE_BENCHMARK_BASIS_LABELS = {
    [EXERCISE_BENCHMARK_BASIS.MANUAL]: 'Manual',
    [EXERCISE_BENCHMARK_BASIS.MEASURED]: 'Measured',
    [EXERCISE_BENCHMARK_BASIS.ESTIMATED]: 'Estimated',
};

export function getExerciseBenchmarkDefinition(benchmarkType) {
    return EXERCISE_BENCHMARK_DEFINITIONS[benchmarkType] ?? null;
}

export function getExerciseBenchmarkBasisLabel(basis) {
    return EXERCISE_BENCHMARK_BASIS_LABELS[basis] ?? basis ?? '';
}

export function getAvailableExerciseBenchmarkDefinitions(exercise) {
    const metadata = ExerciseMetadataUtils.parseExerciseMetadataJson(
        exercise?.metadataJson,
    );

    return Object.values(EXERCISE_BENCHMARK_DEFINITIONS)
        .filter(definition => (
            definition.requiredTrackingFields.every(field =>
                metadata.defaultTrackingFields.includes(field)
            )
        ));
}

export function formatExerciseBenchmarkValue(benchmark) {
    const value = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 3,
    }).format(Number(benchmark.value));

    const unitLabel = getExerciseUnitLabel(benchmark.unit);

    return unitLabel
        ? `${value} ${unitLabel}`
        : value;
}
