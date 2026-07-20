import {
    TRACKING_FIELD_DEFINITIONS,
    TRACKING_FIELD_KEY,
    TRACKING_FIELD_TYPE,
} from '../../../exercises/exercise-tracking-fields.js';

import {getExerciseUnitLabel} from '../../../exercises/exercise-units.js';
import {formatDurationSeconds} from '../../../../utils/time-utils.js';

import {
    BENCHMARK_TARGET_RESOLUTION_REASON,
    getBenchmarkTargetResolutionMessage,
    resolveExerciseBenchmarkPercentageTarget,
} from '../../benchmarks/exercise-benchmark-resolution.js';

import {
    getExerciseBenchmarkDefinition,
} from '../../benchmarks/exercise-benchmark-definitions.js';

export function getSetInstruction(config, set) {
    const notesField = config.trackingFields.find(field => field.key === TRACKING_FIELD_KEY.NOTES);

    if (!notesField) {
        return '';
    }

    return String(set.targets?.[TRACKING_FIELD_KEY.NOTES] ?? '').trim();
}

export function getSetResultInputDetails(field, target, {exerciseId = null, benchmarks = []} = {}) {
    const definition = TRACKING_FIELD_DEFINITIONS[field.key];
    const activeMode = definition?.modes?.find(mode => mode.value === field.mode) ?? definition?.modes?.[0];
    const type = activeMode?.type ?? definition?.type;
    const targetUnit = field.unit ?? activeMode?.unit ?? definition?.unit ?? null;
    const unit = getExerciseUnitLabel(targetUnit);
    const width = type !== TRACKING_FIELD_TYPE.RANGE ? activeMode?.inputWidth ?? definition.inputWidth ?? '5rem' : '5rem';

    const targetDisplay = type === TRACKING_FIELD_TYPE.BENCHMARK_PERCENT
        ? getBenchmarkPercentageTargetDisplay({value: target, exerciseId, benchmarks, benchmarkType: activeMode?.benchmarkType, targetUnit})
        : {
            label: formatTarget(field, target, type, unit),
            detail: null,
            detailColor: null,
            placeholder: getTargetPlaceholder(target, type),
        };

    return {
        width,
        label: definition?.label ?? field.key,
        modeLabel: getModeLabel(field, definition, activeMode),
        type,
        unit,
        targetLabel: targetDisplay.label,
        targetDetailLabel: targetDisplay.detail,
        targetDetailColor: targetDisplay.detailColor,
        placeholder: targetDisplay.placeholder,
    };
}

export function getSetRestSeconds(set) {
    const seconds = Number(set?.targets?.[TRACKING_FIELD_KEY.REST]);
    return Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : null;
}

export function usesSeparateSideValues(values) {
    return Boolean(values && (Object.hasOwn(values, 'left') || Object.hasOwn(values, 'right')));
}

export function formatSetResultValues(trackingFields, values) {
    if (!values) {
        return '';
    }

    return trackingFields
        .filter(field =>
            field.key !== TRACKING_FIELD_KEY.NOTES
            && field.key !== TRACKING_FIELD_KEY.REST
            && values[field.key] !== ''
            && values[field.key] !== null
            && values[field.key] !== undefined
        )
        .map(field => {
            const definition = TRACKING_FIELD_DEFINITIONS[field.key];
            const activeMode = definition?.modes?.find(mode => mode.value === field.mode) ?? definition?.modes?.[0];
            const type = activeMode?.type ?? definition?.type;

            const value = type === TRACKING_FIELD_TYPE.TIME
                ? formatDurationSeconds(values[field.key]) ?? values[field.key]
                : values[field.key];

            const unit = getExerciseUnitLabel(field.unit ?? activeMode?.unit ?? definition?.unit);

            return `${definition?.label ?? field.key}: ${value}${unit ? ` ${unit}` : ''}`;
        })
        .join(' · ');
}

function getBenchmarkPercentageTargetDisplay({value, exerciseId, benchmarks, benchmarkType, targetUnit}) {
    if (value === '' || value === null || value === undefined) {
        return {
            label: '—',
            detail: null,
            detailColor: null,
            placeholder: '—',
        };
    }

    const percentageLabel = formatNumber(value);

    const benchmarkDefinition = getExerciseBenchmarkDefinition(benchmarkType);

    const benchmarkLabel =
        benchmarkDefinition?.shortLabel
        ?? benchmarkDefinition?.label
        ?? 'benchmark';

    const resolution = resolveExerciseBenchmarkPercentageTarget({
        benchmarks,
        exerciseId,
        benchmarkType,
        percentage: value,
        targetUnit,
    });

    if (!resolution.resolved) {
        const detail = resolution.reason === BENCHMARK_TARGET_RESOLUTION_REASON.MISSING_BENCHMARK
            ? 'Missing benchmark'
            : getBenchmarkTargetResolutionMessage(resolution, benchmarkType);

        return {
            label: `${percentageLabel}% ${benchmarkLabel}`,
            detail,
            detailColor: 'red',
            placeholder: '—',
        };
    }

    return {
        label: formatBenchmarkValue(resolution.resolvedValue, resolution.resolvedUnit),
        detail: `${percentageLabel}% of ${formatBenchmarkValue(resolution.resolvedBenchmarkValue, resolution.resolvedUnit)}`,
        detailColor: 'dimmed',
        placeholder: String(resolution.resolvedValue),
    };
}

function formatBenchmarkValue(value, unit) {
    const formattedValue = formatNumber(value);
    const unitLabel = getExerciseUnitLabel(unit);

    return unitLabel
        ? `${formattedValue} ${unitLabel}`
        : formattedValue;
}

function formatNumber(value) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return String(value);
    }

    return new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
    }).format(numericValue);
}

function formatTarget(field, value, type, unit) {
    if (value === '' || value === null || value === undefined) {
        return '—';
    }

    if (type === TRACKING_FIELD_TYPE.RANGE) {
        return `${value.min ?? '—'}–${value.max ?? '—'}`;
    }

    if (type === TRACKING_FIELD_TYPE.TIME) {
        return formatDurationSeconds(value) ?? '—';
    }

    return unit ? `${value} ${unit}` : String(value);
}

function getTargetPlaceholder(value, type) {
    if (value === '' || value === null || value === undefined) {
        return '—';
    }

    if (type === TRACKING_FIELD_TYPE.RANGE) {
        return `${value.min ?? '—'}–${value.max ?? '—'}`;
    }

    return String(value);
}

function getModeLabel(field, definition, activeMode) {
    if (!activeMode) {
        return '';
    }

    if (field.key === TRACKING_FIELD_KEY.TIME) {
        return activeMode.label;
    }

    const defaultMode = definition?.modes?.[0];

    return activeMode.value !== defaultMode?.value
        ? activeMode.label
        : '';
}