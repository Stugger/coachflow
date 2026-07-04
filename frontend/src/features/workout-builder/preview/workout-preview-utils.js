import {
    TRACKING_FIELD_TYPE,
    WORKOUT_ITEM_TYPE,
    WORKOUT_SET_TYPE,
    WORKOUT_SET_TYPE_OPTIONS,
} from '../workout-builder-constants';

import {
    TRACKING_FIELD_DEFINITIONS,
    TRACKING_FIELD_KEY,
} from '../workout-tracking-fields';

import {parseWorkoutConfig} from '../draft/workout-draft-factory';

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

export function getExercisePreviewSummary(configJson, {stackControlled = false} = {}) {
    const config = parseWorkoutConfig(configJson);
    const trackingFields = sortWorkoutPreviewItems(config.trackingFields ?? []);

    return {
        eachSide: config.eachSide,
        setGroups: createSetGroups(
            config.sets ?? [],
            trackingFields,
            stackControlled,
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

function createSetGroups(sets, trackingFields, stackControlled) {
    const groups = [];

    for (const set of sets) {
        const setType = set.setType ?? WORKOUT_SET_TYPE.STANDARD;

        const targetParts = trackingFields
            .filter(field => field.key !== TRACKING_FIELD_KEY.NOTES)
            .map(field => formatTrackingTarget(field, set.targets?.[field.key]))
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

    return groups.map(({signature, ...group}) => ({
        ...group,
        label: [
            formatSetGroupLead(group.setType, group.count, stackControlled),
            ...group.targetParts,
        ].join(' · '),
    }));
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

function formatTrackingTarget(field, value) {
    if (!hasTargetValue(value)) {
        return null;
    }

    const definition = TRACKING_FIELD_DEFINITIONS[field.key];

    if (!definition) {
        return null;
    }

    const activeMode = definition.modes?.find(
        mode => mode.value === field.mode,
    ) ?? definition.modes?.[0];

    const type = activeMode?.type ?? definition.type;
    const unit = getUnitLabel(field, definition, activeMode);

    if (field.key === TRACKING_FIELD_KEY.REPS) {
        const reps = type === TRACKING_FIELD_TYPE.RANGE
            ? formatRange(value)
            : formatNumber(value);

        return reps ? `${reps} reps` : null;
    }

    if (field.key === TRACKING_FIELD_KEY.TIME || field.key === TRACKING_FIELD_KEY.REST) {
        const duration = formatDuration(value);

        if (!duration) {
            return null;
        }

        return field.key === TRACKING_FIELD_KEY.REST
            ? `Rest ${duration}`
            : duration;
    }

    if (field.key === TRACKING_FIELD_KEY.RPE) {
        return `RPE ${formatNumber(value)}`;
    }

    if (field.key === TRACKING_FIELD_KEY.RESISTANCE && field.mode === 'LEVEL') {
        return `Level ${value}`;
    }

    const formattedValue = formatNumber(value);

    if (!formattedValue) {
        return null;
    }

    if (field.key === TRACKING_FIELD_KEY.INCLINE) {
        return `${formattedValue}${unit || '%'}`;
    }

    return unit
        ? `${formattedValue} ${unit}`
        : formattedValue;
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

function formatDuration(value) {
    const totalSeconds = Number(value);

    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
        return null;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
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

    if (!unit) {
        return null;
    }

    return definition.units?.find(
        option => option.value === unit,
    )?.label ?? String(unit).toLowerCase();
}