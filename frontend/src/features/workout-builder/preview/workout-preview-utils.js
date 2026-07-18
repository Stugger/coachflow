import {
    WORKOUT_ITEM_TYPE,
    WORKOUT_SET_TYPE,
    WORKOUT_SET_TYPE_OPTIONS,
} from '../workout-builder-constants';

import {
    TRACKING_FIELD_DEFINITIONS,
    TRACKING_FIELD_KEY,
    TRACKING_FIELD_TYPE,
} from '../../exercises/exercise-tracking-fields';

import {parseWorkoutConfig} from '../draft/workout-draft-factory';
import {getExerciseUnitLabel} from '../../exercises/exercise-units.js';

import {
    getBenchmarkTargetResolutionMessage,
    resolveExerciseBenchmarkPercentageTarget,
} from '../../client-management/benchmarks/exercise-benchmark-resolution.js';

import {formatDurationSeconds} from "../../../utils/time-utils.js";

export function sortWorkoutPreviewItems(items = []) {
    return [...items].sort((first, second) =>
        (first.position ?? 0) - (second.position ?? 0)
    );
}

export function getWorkoutPreviewKey(entity, fallback) {
    return entity?.id ?? entity?.draftId ?? fallback;
}

export function getWorkoutStructureCounts(workout) {
    return sortWorkoutPreviewItems(workout?.sections ?? []).reduce(
        (counts, section) => {
            const items = sortWorkoutPreviewItems(section.items ?? []);

            return {
                sectionCount: counts.sectionCount + 1,
                itemCount: counts.itemCount + items.length,
                exerciseCount: counts.exerciseCount + items.reduce(
                    (exerciseCount, item) => {
                        if (item.itemType === WORKOUT_ITEM_TYPE.EXERCISE || item.exercise) {
                            return exerciseCount + 1;
                        }
                        return exerciseCount + (item.itemExercises?.length ?? 0);
                    },
                    0,
                ),
            };
        },
        {
            sectionCount: 0,
            itemCount: 0,
            exerciseCount: 0,
        },
    );
}

export function getExerciseDisplayName(item) {
    return item.name?.trim()
        || item.exercise?.name
        || 'Unnamed exercise';
}

export function getExercisePreviewSummary(configJson, {stackControlled = false, exerciseId = null, benchmarks = null} = {}) {
    const config = parseWorkoutConfig(configJson);
    const trackingFields = sortWorkoutPreviewItems(config.trackingFields ?? []);
    const sets = config.sets ?? [];

    return {
        eachSide: config.eachSide,
        setGroups: createSetGroups(
            sets,
            trackingFields,
            stackControlled,
            {
                exerciseId,
                benchmarks,
            },
        ),
        noTargetTrackingFields: getNoTargetTrackingFields(
            sets,
            trackingFields,
        ),
    };
}

export function getStackRoundCount(stack) {
    const rounds = Number(stack.rounds);

    if (Number.isFinite(rounds) && rounds > 0) {
        return rounds;
    }

    const firstExercise = stack.itemExercises?.[0];

    if (!firstExercise) {
        return 1;
    }

    return parseWorkoutConfig(firstExercise.configJson).sets.length;
}

function createSetGroups(sets, trackingFields, stackControlled, benchmarkContext) {
    const groups = [];

    for (const set of sets) {
        const setType = set.setType ?? WORKOUT_SET_TYPE.STANDARD;

        const targetParts = trackingFields
            .filter(field => field.key !== TRACKING_FIELD_KEY.NOTES)
            .map(field => formatTrackingTarget(field, set.targets?.[field.key], benchmarkContext))
            .filter(Boolean);

        const noteParts = trackingFields
            .filter(field => field.key === TRACKING_FIELD_KEY.NOTES)
            .map(field => formatNotesTarget(set.targets?.[field.key]))
            .filter(Boolean);

        const signature = JSON.stringify({
            setType,
            targetParts,
            noteParts,
        });

        const previousGroup = groups.at(-1);

        if (previousGroup?.signature === signature) {
            previousGroup.count += 1;
            continue;
        }

        groups.push({
            signature,
            count: 1,
            setType,
            targetParts,
            noteParts,
        });
    }

    return groups.map(group => ({
        signature: group.signature,
        count: group.count,
        setType: group.setType,
        targetParts: group.targetParts,
        noteParts: group.noteParts,
        lead: formatSetGroupLead(
            group.setType,
            group.count,
            stackControlled,
        ),
    }));
}

function getNoTargetTrackingFields(sets, trackingFields) {
    const representedFieldKeys = new Set();

    for (const set of sets) {
        for (const field of trackingFields) {
            if (field.key === TRACKING_FIELD_KEY.NOTES) {
                continue;
            }

            const targetLabel = formatTrackingTarget(
                field,
                set.targets?.[field.key],
            );

            if (targetLabel) {
                representedFieldKeys.add(field.key);
            }
        }
    }

    return trackingFields
        .filter(field =>
            field.key !== TRACKING_FIELD_KEY.NOTES
            && !representedFieldKeys.has(field.key)
        )
        .map(field => ({
            key: field.key,
            label: formatTrackingFieldLabel(field),
        }));
}

function formatTrackingFieldLabel(field) {
    const definition = TRACKING_FIELD_DEFINITIONS[field.key];

    if (!definition) {
        return field.key;
    }

    const activeMode = getActiveTrackingFieldMode(definition, field);

    if (activeMode?.type === TRACKING_FIELD_TYPE.BENCHMARK_PERCENT) {
        return `${definition.label} (${activeMode.label})`;
    }

    const unitLabel = getUnitLabel(field, definition, activeMode);

    return unitLabel || activeMode?.label
        ? `${definition.label} (${unitLabel ?? activeMode.label.toLowerCase()})`
        : definition.label;
}

function getActiveTrackingFieldMode(definition, field) {
    return definition.modes?.find(
        mode => mode.value === field.mode,
    ) ?? definition.modes?.[0] ?? null;
}

function formatSetGroupLead(setType, count, stackControlled) {
    const unit = stackControlled ? 'round' : 'set';

    if (setType === WORKOUT_SET_TYPE.STANDARD) {
        return `${count} ${unit}${count === 1 ? '' : 's'}`;
    }

    if (setType === WORKOUT_SET_TYPE.WARMUP) {
        return count === 1
            ? 'Warm-up'
            : `${count} warm-up sets`;
    }

    if (setType === WORKOUT_SET_TYPE.DROP) {
        return count === 1
            ? 'Drop set'
            : `${count} drop sets`;
    }

    if (setType === WORKOUT_SET_TYPE.FAILURE) {
        return count === 1
            ? 'Failure set'
            : `${count} failure sets`;
    }

    const label = WORKOUT_SET_TYPE_OPTIONS.find(
        option => option.value === setType,
    )?.label?.toLowerCase() ?? 'set';

    return `${count} ${label}${count === 1 ? '' : 's'}`;
}

function createTrackingTargetPart(text, warning = null) {
    return text ? {text, warning} : null;
}

function formatTrackingTarget(field, value, {exerciseId = null, benchmarks = null} = {}) {
    if (!hasTargetValue(value)) {
        return null;
    }

    const definition = TRACKING_FIELD_DEFINITIONS[field.key];

    if (!definition) {
        return null;
    }

    const activeMode = getActiveTrackingFieldMode(definition, field);

    const type = activeMode?.type ?? definition.type;
    const unit = getUnitLabel(field, definition, activeMode);

    if (field.key === TRACKING_FIELD_KEY.REPS) {
        const reps = type === TRACKING_FIELD_TYPE.RANGE
            ? formatRange(value)
            : formatNumber(value);

        return createTrackingTargetPart(reps ? `${reps} ${reps == 1 ? 'rep' : 'reps'}` : null);
    }

    if (type === TRACKING_FIELD_TYPE.TIME) {
        const duration = formatDurationSeconds(value);

        if (!duration) {
            return null;
        }

        return createTrackingTargetPart(field.key === TRACKING_FIELD_KEY.REST ? `Rest ${duration}` : duration);
    }

    if (field.key === TRACKING_FIELD_KEY.RPE) {
        return createTrackingTargetPart(`RPE ${formatNumber(value)}`);
    }

    if (field.key === TRACKING_FIELD_KEY.RESISTANCE) {
        if (field.mode === 'LEVEL') {
            return createTrackingTargetPart(`Level ${value}`);
        }

        return createTrackingTargetPart(`${value} ${unit} resistance`);
    }

    const formattedValue = formatNumber(value);

    if (!formattedValue) {
        return null;
    }

    if (type === TRACKING_FIELD_TYPE.BENCHMARK_PERCENT) {
        const percentageLabel = `${formattedValue}${activeMode?.label ?? '%'}`;

        if (!Array.isArray(benchmarks) || !exerciseId || !activeMode?.benchmarkType) {
            return createTrackingTargetPart(percentageLabel);
        }

        const resolution =
            resolveExerciseBenchmarkPercentageTarget({
                benchmarks,
                exerciseId,
                benchmarkType: activeMode.benchmarkType,
                percentage: value,
                targetUnit: field.unit
                    ?? activeMode.unit
                    ?? definition.unit
                    ?? null,
            });

        if (!resolution.resolved) {
            return createTrackingTargetPart(
                percentageLabel,
                getBenchmarkTargetResolutionMessage(resolution, activeMode.benchmarkType),
            );
        }

        const resolvedValue = formatNumber(resolution.resolvedValue);

        const resolvedUnit = getExerciseUnitLabel(resolution.resolvedUnit);

        return createTrackingTargetPart(resolvedUnit ? `${resolvedValue} ${resolvedUnit}` : resolvedValue);
    }

    if (field.key === TRACKING_FIELD_KEY.INCLINE) {
        return createTrackingTargetPart(`${formattedValue}${unit || '%'}`);
    }

    return createTrackingTargetPart(unit ? `${formattedValue} ${unit}` : formattedValue);
}

function formatNotesTarget(value) {
    if (value === null || value === undefined) {
        return null;
    }

    const text = String(value).trim();

    return text || null;
}

function hasTargetValue(value) {
    if (value === null || value === undefined || value === '') {
        return false;
    }

    if (typeof value !== 'object') {
        return true;
    }

    return Object.values(value).some(
        nestedValue =>
            nestedValue !== null
            && nestedValue !== undefined
            && nestedValue !== '',
    );
}

function formatRange(value) {
    const minimum = formatNumber(value?.min);
    const maximum = formatNumber(value?.max);

    if (minimum && maximum) {
        return `${minimum}–${maximum}`;
    }

    return minimum || maximum || null;
}

function formatNumber(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return String(value).trim() || null;
    }

    return new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
    }).format(numericValue);
}

function getUnitLabel(field, definition, activeMode) {
    const unit = field.unit
        ?? activeMode?.unit
        ?? definition.unit;

    return unit ? getExerciseUnitLabel(unit) : null;
}