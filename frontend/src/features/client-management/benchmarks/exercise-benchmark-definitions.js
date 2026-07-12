import {
    TRACKING_FIELD_KEY,
} from '../../exercises/exercise-tracking-fields.js';

import * as ExerciseMetadataUtils from '../../exercises/exercise-metadata-utils.js';
import {EXERCISE_UNITS, getExerciseUnitLabel} from '../../exercises/exercise-units.js';
import {EXERCISE_BENCHMARK_TYPE} from "./exercise-benchmark-types.js";
import {formatDurationSeconds} from "../../../utils/time-utils.js";

export const EXERCISE_BENCHMARK_BASIS = {
    MANUAL: 'MANUAL',
    MEASURED: 'MEASURED',
    ESTIMATED: 'ESTIMATED',
};

export const EXERCISE_BENCHMARK_COMPARISON = {
    HIGHER_IS_BETTER: 'HIGHER_IS_BETTER',
    LOWER_IS_BETTER: 'LOWER_IS_BETTER',
};

export const EXERCISE_BENCHMARK_VALUE_TYPE = {
    NUMBER: 'NUMBER',
    DURATION: 'DURATION',
};

export const EXERCISE_BENCHMARK_DEFINITIONS = {
    [EXERCISE_BENCHMARK_TYPE.ONE_REP_MAX]: {
        type: EXERCISE_BENCHMARK_TYPE.ONE_REP_MAX,
        label: '1 Rep Max',
        shortLabel: '1RM',
        valueType: EXERCISE_BENCHMARK_VALUE_TYPE.NUMBER,
        comparison: EXERCISE_BENCHMARK_COMPARISON.HIGHER_IS_BETTER,
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
    [EXERCISE_BENCHMARK_TYPE.FASTEST_TIME]: {
        type: EXERCISE_BENCHMARK_TYPE.FASTEST_TIME,
        label: 'Fastest Time',
        shortLabel: 'Fastest',
        valueType: EXERCISE_BENCHMARK_VALUE_TYPE.DURATION,
        comparison: EXERCISE_BENCHMARK_COMPARISON.LOWER_IS_BETTER,
        requiredTrackingFields: [
            TRACKING_FIELD_KEY.TIME,
        ],
        units: [
            EXERCISE_UNITS.SECONDS,
        ],
        defaultUnit: EXERCISE_UNITS.SECONDS.value,
    },
    [EXERCISE_BENCHMARK_TYPE.MAX_DURATION]: {
        type: EXERCISE_BENCHMARK_TYPE.MAX_DURATION,
        label: 'Max Duration',
        shortLabel: 'Longest',
        valueType: EXERCISE_BENCHMARK_VALUE_TYPE.DURATION,
        comparison: EXERCISE_BENCHMARK_COMPARISON.HIGHER_IS_BETTER,
        requiredTrackingFields: [
            TRACKING_FIELD_KEY.TIME,
        ],
        units: [
            EXERCISE_UNITS.SECONDS,
        ],
        defaultUnit: EXERCISE_UNITS.SECONDS.value,
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

export function findBestExerciseBenchmark(benchmarks, benchmarkDefinition) {
    const validBenchmarks = (benchmarks ?? []).filter(
        benchmark => Number.isFinite(Number(benchmark.value))
    );

    if (!validBenchmarks.length || !benchmarkDefinition) {
        return null;
    }

    return validBenchmarks.reduce((best, benchmark) => {
        const value = Number(benchmark.value);
        const bestValue = Number(best.value);

        if (benchmarkDefinition.comparison === EXERCISE_BENCHMARK_COMPARISON.LOWER_IS_BETTER) {
            return value < bestValue ? benchmark : best;
        }

        return value > bestValue ? benchmark : best;
    });
}

export function formatExerciseBenchmarkValue(benchmark) {
    const definition = getExerciseBenchmarkDefinition(
        benchmark.benchmarkType
    );

    if (definition?.valueType === EXERCISE_BENCHMARK_VALUE_TYPE.DURATION) {
        return formatDurationSeconds(benchmark.value)
            ?? String(benchmark.value);
    }

    const formattedValue = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 3,
    }).format(benchmark.value);

    const unitLabel = getExerciseUnitLabel(benchmark.unit);

    return unitLabel
        ? `${formattedValue} ${unitLabel}`
        : formattedValue;
}
