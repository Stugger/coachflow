export const CLIENT_WORKOUT_ORIGIN_LABELS = {
    INITIAL_ASSESSMENT: 'Initial Assessment',
    PROGRAM: 'Program',
    ASSIGNMENT: 'Assignment',
};

export function getClientWorkoutOriginLabel(origin) {
    return CLIENT_WORKOUT_ORIGIN_LABELS[origin] ?? 'Client Workout';
}