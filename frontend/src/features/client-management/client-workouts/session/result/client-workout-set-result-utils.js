import {
    TRACKING_FIELD_DEFINITIONS,
    TRACKING_FIELD_KEY,
    TRACKING_FIELD_TYPE,
} from '../../../../exercises/exercise-tracking-fields.js';

import {getExerciseUnitLabel} from '../../../../exercises/exercise-units.js';
import {formatDurationSeconds} from '../../../../../utils/time-utils.js';

import {
    BENCHMARK_TARGET_RESOLUTION_REASON,
    getBenchmarkTargetResolutionMessage,
    resolveExerciseBenchmarkPercentageTarget,
} from '../../../benchmarks/exercise-benchmark-resolution.js';

import {
    getExerciseBenchmarkDefinition,
} from '../../../benchmarks/exercise-benchmark-definitions.js';

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
        ? getBenchmarkPercentageTargetDisplay({
            value: target,
            exerciseId,
            benchmarks,
            benchmarkType: activeMode?.benchmarkType,
            targetUnit,
        })
        : {
            label: formatTarget(field, target, type, unit),
            detail: null,
            detailColor: null,
            placeholder: getTargetPlaceholder(target, type),
            comparisonValue: getTargetComparisonValue(target, type),
            fillOptions: getTargetFillOptions(target, type),
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
        targetComparisonValue: targetDisplay.comparisonValue,
        targetFillOptions: targetDisplay.fillOptions,
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

export function getSetResultSummaryFields({config, set, values, exerciseId = null, benchmarks = []}) {
    return (config.trackingFields ?? [])
        .filter(field => field.key !== TRACKING_FIELD_KEY.NOTES && field.key !== TRACKING_FIELD_KEY.REST)
        .map(field => {
            const target = set?.targets?.[field.key];

            const details = getSetResultInputDetails(
                field,
                target,
                {
                    exerciseId,
                    benchmarks,
                },
            );

            const resultValue = values?.[field.key];

            return {
                key: field.key,
                label: details.label,
                modeLabel: details.modeLabel,
                resultLabel: formatSetResultValue(resultValue, details.type, details.unit),
                targetLabel: details.targetLabel,
                targetDetailLabel: details.targetDetailLabel,
                targetDetailColor: details.targetDetailColor,
                deltaLabel: formatSetResultDelta(resultValue, details.targetComparisonValue, details.type),
            };
        });
}

function getBenchmarkPercentageTargetDisplay({value, exerciseId, benchmarks, benchmarkType, targetUnit}) {
    if (value === '' || value === null || value === undefined) {
        return {
            label: '—',
            detail: null,
            detailColor: null,
            placeholder: '—',
            comparisonValue: null,
            fillOptions: [],
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
            comparisonValue: null,
            fillOptions: [],
        };
    }

    return {
        label: formatBenchmarkValue(resolution.resolvedValue, resolution.resolvedUnit),
        detail: `${percentageLabel}% of ${formatBenchmarkValue(resolution.resolvedBenchmarkValue, resolution.resolvedUnit)}`,
        detailColor: 'dimmed',
        placeholder: String(resolution.resolvedValue),
        comparisonValue: resolution.resolvedValue,
        fillOptions: [
            {
                label: 'Use target',
                value: resolution.resolvedValue,
            },
        ],
    };
}

function getTargetFillOptions(value, type) {
    if (type === TRACKING_FIELD_TYPE.RANGE) {
        const minimum = value?.min;
        const maximum = value?.max;

        const hasMinimum = hasTargetValue(minimum);
        const hasMaximum = hasTargetValue(maximum);

        if (!hasMinimum && !hasMaximum) {
            return [];
        }

        if (hasMinimum && hasMaximum && Number(minimum) === Number(maximum)) {
            return [
                {
                    label: 'Use target',
                    value: minimum,
                },
            ];
        }

        return [
            ...(hasMinimum
                ? [{
                    label: 'Use minimum',
                    value: minimum,
                }]
                : []),
            ...(hasMaximum
                ? [{
                    label: 'Use maximum',
                    value: maximum,
                }]
                : []),
        ];
    }

    if (!hasTargetValue(value)) {
        return [];
    }

    return [
        {
            label: 'Use target',
            value,
        },
    ];
}

function hasTargetValue(value) {
    return value !== '' && value !== null && value !== undefined;
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

function getTargetComparisonValue(value, type) {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    if (type === TRACKING_FIELD_TYPE.RANGE) {
        return value;
    }

    return isNumericTrackingType(type) ? toFiniteNumber(value) : null;
}

function getModeLabel(field, definition, activeMode) {
    if (!activeMode) {
        return '';
    }

    if (field.key === TRACKING_FIELD_KEY.TIME) {
        return activeMode.label;
    }

    const defaultMode = definition?.modes?.[0];

    return activeMode.value !== defaultMode?.value ? activeMode.label : '';
}

function formatSetResultValue(value, type, unit) {
    if (value === '' || value === null || value === undefined) {
        return '—';
    }

    if (type === TRACKING_FIELD_TYPE.TIME) {
        return formatDurationSeconds(value) ?? '—';
    }

    const formattedValue = isNumericTrackingType(type) ? formatNumber(value) : String(value);

    return formatValueWithUnit(formattedValue, unit);
}

function formatSetResultDelta(resultValue, targetComparisonValue, type) {
    const numericResult = toFiniteNumber(resultValue);

    if (numericResult === null || targetComparisonValue === null || targetComparisonValue === undefined) {
        return null;
    }

    let delta;

    if (type === TRACKING_FIELD_TYPE.RANGE) {
        const minimum = toFiniteNumber(targetComparisonValue?.min);
        const maximum = toFiniteNumber(targetComparisonValue?.max);
        if (minimum !== null && numericResult < minimum) {
            delta = numericResult - minimum;
        } else if (maximum !== null && numericResult > maximum) {
            delta = numericResult - maximum;
        } else {
            return null;
        }
    } else if (isNumericTrackingType(type)) {
        const numericTarget = toFiniteNumber(targetComparisonValue);
        if (numericTarget === null) {
            return null;
        }
        delta = numericResult - numericTarget;
    } else {
        return null;
    }

    if (Math.abs(delta) < 0.000001) {
        return null;
    }

    const sign = delta > 0 ? '+' : '-';
    const magnitude = type === TRACKING_FIELD_TYPE.TIME ? formatDurationSeconds(Math.abs(delta)) : formatNumber(Math.abs(delta));
    return magnitude ? `${sign}${magnitude}` : null;
}

function formatValueWithUnit(value, unit) {
    if (!unit) {
        return value;
    }
    return unit === '%' ? `${value}${unit}` : `${value} ${unit}`;
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

function isNumericTrackingType(type) {
    return type === TRACKING_FIELD_TYPE.INTEGER
        || type === TRACKING_FIELD_TYPE.DECIMAL
        || type === TRACKING_FIELD_TYPE.RANGE
        || type === TRACKING_FIELD_TYPE.TIME
        || type === TRACKING_FIELD_TYPE.BENCHMARK_PERCENT;
}

function toFiniteNumber(value) {
    if (value === '' || value === null || value === undefined) {
        return null;
    }
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
}