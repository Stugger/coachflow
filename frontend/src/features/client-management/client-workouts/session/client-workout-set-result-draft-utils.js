import {
    TRACKING_FIELD_KEY,
} from '../../../exercises/exercise-tracking-fields.js';

import {
    usesSeparateSideValues,
} from './client-workout-set-result-utils.js';

export function createSetResultValues(config, result) {
    const resultValues = getResultValues(result);

    if (!config.eachSide) {
        return {
            default: {...(resultValues.default ?? {})},
        };
    }

    if (usesSeparateSideValues(resultValues)) {
        return {
            left: {...(resultValues.left ?? {})},
            right: {...(resultValues.right ?? {})},
        };
    }

    /*
     * Preserve existing shared results instead of silently converting
     * results created before timed fields defaulted to separate sides.
     */
    if (Object.hasOwn(resultValues, 'default')) {
        return {
            default: {...resultValues.default},
        };
    }

    const hasTimeField = config.trackingFields?.some(
        field => field.key === TRACKING_FIELD_KEY.TIME,
    );

    return hasTimeField
        ? {
            left: {},
            right: {},
        }
        : {
            default: {},
        };
}

export function createSetResultDraft(config, result) {
    const values = createSetResultValues(config, result);
    const notes = result?.notes ?? '';
    const completed = Boolean(result?.completedAt);

    return {
        values,
        notes,
        completed,
        serialized: serializeSetResultDraft(
            values,
            notes,
            completed,
        ),
    };
}

export function cloneSetResultValues(values) {
    return Object.fromEntries(
        Object.entries(values ?? {}).map(
            ([side, sideValues]) => [
                side,
                {...sideValues},
            ],
        ),
    );
}

export function updateSetResultValue(values, side, fieldKey, nextValue) {
    const nextSideValues = {
        ...(values?.[side] ?? {}),
    };

    if (nextValue === '' || nextValue === null || nextValue === undefined) {
        delete nextSideValues[fieldKey];
    } else {
        nextSideValues[fieldKey] = nextValue;
    }

    return {
        ...(values ?? {}),
        [side]: nextSideValues,
    };
}

export function splitSetResultValues(values) {
    const sharedValues = {
        ...(values?.default ?? {}),
    };

    return {
        left: {...sharedValues},
        right: {...sharedValues},
    };
}

export function mergeSetResultValues(values, sourceSide) {
    return {
        default: {
            ...(values?.[sourceSide] ?? {}),
        },
    };
}

export function normalizeSetResultValues(values) {
    return Object.fromEntries(
        Object.entries(values ?? {})
            .map(([side, sideValues]) => [
                side,
                Object.fromEntries(
                    Object.entries(sideValues ?? {})
                        .filter(([, value]) => value !== '' && value !== null && value !== undefined),
                ),
            ])
            .filter(([, sideValues]) =>
                Object.keys(sideValues).length
            ),
    );
}

export function serializeSetResultDraft(values, notes, completed) {
    return JSON.stringify({
        values: sortObject(normalizeSetResultValues(values)),
        notes: (notes ?? '').trim(),
        completed: Boolean(completed),
    });
}

function getResultValues(result) {
    return isObject(result?.values) ? result.values : parseSetResultValues(result?.valuesJson);
}

function parseSetResultValues(valuesJson) {
    if (!valuesJson) {
        return {};
    }

    if (isObject(valuesJson)) {
        return valuesJson;
    }

    try {
        const values = JSON.parse(valuesJson);
        return isObject(values) ? values : {};
    } catch {
        return {};
    }
}

function sortObject(value) {
    if (!isObject(value)) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value)
            .sort(([leftKey], [rightKey]) =>
                leftKey.localeCompare(rightKey)
            )
            .map(([key, nestedValue]) => [
                key,
                sortObject(nestedValue),
            ]),
    );
}

function isObject(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}