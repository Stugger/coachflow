import {WORKOUT_ITEM_TYPE, WORKOUT_SECTION_TYPE} from './workout-builder-constants';
import {trimToNull} from '../../utils/text-utils';

import {
    createDraftId,
    createEmptyWorkoutDraft,
    createEmptyWorkoutConfig,
    parseWorkoutConfig,
    stringifyWorkoutConfig,
} from './workout-draft-factory';

export function normalizeTemplateForDraft(template, trainerId) {
    if (!template) {
        return createEmptyWorkoutDraft(trainerId);
    }

    return {
        id: template.id ?? null,
        trainerId: template.trainerId ?? template.trainer?.id ?? trainerId,
        name: template.name ?? '',
        description: template.description ?? '',
        sections: normalizePositions(template.sections ?? []).map((section, sectionIndex) => ({
            id: section.id ?? null,
            draftId: createDraftId('section'),
            position: sectionIndex + 1,
            name: section.name ?? '',
            sectionType: section.sectionType ?? WORKOUT_SECTION_TYPE.REGULAR,
            notes: section.notes ?? '',
            items: normalizePositions(section.items ?? []).map((item, itemIndex) => normalizeItemForDraft(item, itemIndex)),
        })),
    };
}

export function normalizeTemplateForCopy(template, trainerId) {
    const draft = normalizeTemplateForDraft(template, trainerId);

    return stripIdsFromDraft({
        ...draft,
        id: null,
        name: draft.name ? `Copy of ${draft.name}` : '',
    });
}

function normalizeItemForDraft(item, itemIndex) {
    const itemType = item.itemType ?? WORKOUT_ITEM_TYPE.EXERCISE;

    return {
        id: item.id ?? null,
        draftId: createDraftId('item'),
        position: itemIndex + 1,
        itemType,
        exercise: item.exercise ?? null,
        exerciseId: item.exercise?.id ?? item.exerciseId ?? null,
        name: item.name ?? '',
        rounds: item.rounds ?? null,
        notes: item.notes ?? '',
        configJson: normalizeConfigJson(item.configJson),
        itemExercises: normalizePositions(item.itemExercises ?? []).map((itemExercise, itemExerciseIndex) => ({
            id: itemExercise.id ?? null,
            draftId: createDraftId('item-exercise'),
            position: itemExerciseIndex + 1,
            exercise: itemExercise.exercise ?? null,
            exerciseId: itemExercise.exercise?.id ?? itemExercise.exerciseId ?? null,
            name: itemExercise.name ?? '',
            notes: itemExercise.notes ?? '',
            configJson: normalizeConfigJson(itemExercise.configJson),
        })),
    };
}

function normalizeConfigJson(configJson) {
    return stringifyWorkoutConfig(
        parseWorkoutConfig(configJson)
    );
}

export function buildTemplatePayload(draft, trainerId) {
    return {
        trainerId,
        name: trimToNull(draft.name) ?? '',
        description: trimToNull(draft.description),
        sections: normalizePositions(draft.sections ?? []).map((section, sectionIndex) => ({
            id: section.id ?? null,
            position: sectionIndex + 1,
            name: trimToNull(section.name),
            sectionType: section.sectionType || WORKOUT_SECTION_TYPE.REGULAR,
            notes: trimToNull(section.notes),
            items: normalizePositions(section.items ?? []).map((item, itemIndex) => buildItemPayload(item, itemIndex)),
        })),
    };
}

function buildItemPayload(item, itemIndex) {
    const itemType = item.itemType || WORKOUT_ITEM_TYPE.EXERCISE;
    const isExercise = itemType === WORKOUT_ITEM_TYPE.EXERCISE;

    return {
        id: item.id ?? null,
        position: itemIndex + 1,
        itemType,
        exerciseId: isExercise ? getExerciseId(item) : null,
        name: toNameOverrideOrNull(item),
        rounds: isExercise ? null : toPositiveNumberOrNull(item.rounds),
        notes: trimToNull(item.notes),
        configJson: isExercise ? normalizeConfigJson(item.configJson) : null,
        itemExercises: isExercise
            ? []
            : normalizePositions(item.itemExercises ?? []).map((itemExercise, itemExerciseIndex) => ({
                id: itemExercise.id ?? null,
                exerciseId: getExerciseId(itemExercise),
                position: itemExerciseIndex + 1,
                name: toNameOverrideOrNull(itemExercise),
                notes: trimToNull(itemExercise.notes),
                configJson: normalizeConfigJson(itemExercise.configJson),
            })),
    };
}

export function stripIdsFromDraft(draft) {
    return {
        ...draft,
        id: null,
        sections: (draft.sections ?? []).map(section => ({
            ...section,
            id: null,
            draftId: createDraftId('section'),
            items: (section.items ?? []).map(item => ({
                ...item,
                id: null,
                draftId: createDraftId('item'),
                itemExercises: (item.itemExercises ?? []).map(itemExercise => ({
                    ...itemExercise,
                    id: null,
                    draftId: createDraftId('item-exercise'),
                })),
            })),
        })),
    };
}

export function normalizePositions(items) {
    return [...items]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((item, index) => ({
            ...item,
            position: index + 1,
        }));
}

export function reindexPositions(items) {
    return items.map((item, index) => {
        const position = index + 1;

        return item.position === position
            ? item
            : {
                ...item,
                position,
            };
    });
}

export function reindexTrackingFields(fields) {
    return fields.map((field, index) => ({
        ...field,
        position: index + 1,
    }));
}

export function reindexSets(nextSets) {
    return nextSets.map((set, index) => ({
        ...set,
        position: index + 1,
    }));
}

export function getExerciseId(item) {
    return item.exerciseId ?? item.exercise?.id ?? null;
}

export function getWorkoutEquipment(draft) {
    if (!draft) {
        return [];
    }

    const equipment = new Set();

    for (const section of draft.sections ?? []) {
        for (const item of section.items ?? []) {
            addExerciseEquipment(equipment, item.exercise);

            for (const itemExercise of item.itemExercises ?? []) {
                addExerciseEquipment(equipment, itemExercise.exercise);
            }
        }
    }

    return Array.from(equipment).sort((a, b) => a.localeCompare(b));
}

function addExerciseEquipment(equipment, exercise) {
    if (!exercise?.metadataJson) {
        return;
    }

    let metadata = {};

    try {
        metadata = JSON.parse(exercise.metadataJson);
    } catch (error) {
        console.warn('Failed to parse exercise metadataJson:', error);
        return;
    }

    for (const value of metadata.equipment ?? []) {
        if (value) {
            equipment.add(value.replace("_", " "));
        }
    }
}

function toPositiveNumberOrNull(value) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

function toNameOverrideOrNull(item) {
    const customName = trimToNull(item.name);
    const exerciseName = trimToNull(item.exercise?.name);

    if (!customName || customName === exerciseName) {
        return null;
    }

    return customName;
}