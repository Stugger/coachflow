export const emptyExerciseMetadata = {
    equipment: [],
    primaryMuscles: [],
    secondaryMuscles: [],
    difficulty: '',
    tags: [],
};

export function parseExerciseMetadataJson(metadataJson) {
    if (!metadataJson) {
        return emptyExerciseMetadata;
    }

    try {
        const metadata = JSON.parse(metadataJson);

        return {
            equipment: Array.isArray(metadata.equipment) ? metadata.equipment : [],
            primaryMuscles: Array.isArray(metadata.primaryMuscles) ? metadata.primaryMuscles : [],
            secondaryMuscles: Array.isArray(metadata.secondaryMuscles) ? metadata.secondaryMuscles : [],
            difficulty: metadata.difficulty || '',
            tags: Array.isArray(metadata.tags) ? metadata.tags : [],
        };
    } catch (error) {
        console.error('Error parsing exercise metadata:', error);
        return emptyExerciseMetadata;
    }
}