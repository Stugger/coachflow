import {
    convertExerciseUnitValue,
} from '../../exercises/exercise-units.js';

export const BENCHMARK_TARGET_RESOLUTION_REASON = {
    MISSING_BENCHMARK: 'MISSING_BENCHMARK',
    INVALID_PERCENTAGE: 'INVALID_PERCENTAGE',
    INVALID_BENCHMARK_VALUE: 'INVALID_BENCHMARK_VALUE',
    UNSUPPORTED_UNIT_CONVERSION: 'UNSUPPORTED_UNIT_CONVERSION',
};

export function findCurrentExerciseBenchmark(benchmarks, exerciseId, benchmarkType) {
    return (benchmarks ?? []).find(benchmark => {
        const benchmarkExerciseId =
            benchmark.exercise?.id
            ?? benchmark.exerciseId;

        return benchmarkExerciseId === exerciseId
            && benchmark.benchmarkType === benchmarkType;
    }) ?? null;
}

export function resolveExerciseBenchmarkPercentageTarget({benchmarks, exerciseId, benchmarkType, percentage, targetUnit}) {
    const benchmark = findCurrentExerciseBenchmark(
        benchmarks,
        exerciseId,
        benchmarkType,
    );

    if (!benchmark) {
        return {
            resolved: false,
            reason: BENCHMARK_TARGET_RESOLUTION_REASON.MISSING_BENCHMARK,
            benchmark: null,
        };
    }

    const numericPercentage = Number(percentage);

    if (!Number.isFinite(numericPercentage)) {
        return {
            resolved: false,
            reason: BENCHMARK_TARGET_RESOLUTION_REASON.INVALID_PERCENTAGE,
            benchmark,
        };
    }

    const benchmarkValue = Number(benchmark.value);

    if (!Number.isFinite(benchmarkValue)) {
        return {
            resolved: false,
            reason: BENCHMARK_TARGET_RESOLUTION_REASON.INVALID_BENCHMARK_VALUE,
            benchmark,
        };
    }

    const resolvedUnit = targetUnit ?? benchmark.unit ?? null;

    const convertedBenchmarkValue = convertExerciseUnitValue(
        benchmarkValue,
        benchmark.unit ?? null,
        resolvedUnit,
    );

    if (convertedBenchmarkValue === null) {
        return {
            resolved: false,
            reason: BENCHMARK_TARGET_RESOLUTION_REASON.UNSUPPORTED_UNIT_CONVERSION,
            benchmark,
        };
    }

    return {
        resolved: true,
        percentage: numericPercentage,
        resolvedValue: convertedBenchmarkValue * (numericPercentage / 100),
        resolvedUnit,
        benchmark,
    };
}