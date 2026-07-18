import {
    TRACKING_FIELD_DEFINITIONS,
    TRACKING_FIELD_KEY,
    TRACKING_FIELD_TYPE,
} from '../../../exercises/exercise-tracking-fields.js';
import {getExerciseUnitLabel} from '../../../exercises/exercise-units.js';
import {formatDurationSeconds} from '../../../../utils/time-utils.js';

export function getSetInstruction(config, set) {
    const notesField = config.trackingFields.find(field => field.key === TRACKING_FIELD_KEY.NOTES);

    if (!notesField) {
        return '';
    }

    return String(set.targets?.[TRACKING_FIELD_KEY.NOTES] ?? '').trim();
}

export function getSetResultInputDetails(field, target) {
    const definition = TRACKING_FIELD_DEFINITIONS[field.key];
    const activeMode = definition?.modes?.find(mode => mode.value === field.mode) ?? definition?.modes?.[0];
    const type = activeMode?.type ?? definition?.type;
    const unit = getExerciseUnitLabel(field.unit ?? activeMode?.unit ?? definition?.unit);
    const width = type !== TRACKING_FIELD_TYPE.RANGE ? activeMode?.inputWidth ?? definition.inputWidth ?? '5rem' : '5rem';

    return {
        width,
        label: definition?.label ?? field.key,
        modeLabel: getModeLabel(field, definition, activeMode),
        type,
        unit,
        targetLabel: formatTarget(field, target, type, unit),
        placeholder: getTargetPlaceholder(target, type),
    };
}

export function formatSetResultValues(trackingFields, values) {
    if (!values) {
        return '';
    }

    return trackingFields
        .filter(field =>
            field.key !== TRACKING_FIELD_KEY.NOTES
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

    if (type === TRACKING_FIELD_TYPE.BENCHMARK_PERCENT) {
        return `${value}% 1RM`;
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

    if (type === TRACKING_FIELD_TYPE.BENCHMARK_PERCENT) {
        return '—';
    }

    return String(value);
}