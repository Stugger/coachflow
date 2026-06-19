import {WORKOUT_SECTION_TYPE_OPTIONS} from './workout-builder-constants';

export function getSectionKey(section) {
    return section.draftId || section.id;
}

export function getSectionDisplayName(section) {
    return section.name?.trim() || `Section ${section.position}`;
}

export function getSectionTypeLabel(sectionType) {
    return WORKOUT_SECTION_TYPE_OPTIONS.find(option => option.value === sectionType)?.label || 'Regular';
}