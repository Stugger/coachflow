import {ROUTES} from '../../../constants/routes.js';

export function getClientWorkoutSourceNavigation(clientId, workout) {
    if (!clientId || !workout) {
        return null;
    }

    switch (workout.origin) {
        case 'INITIAL_ASSESSMENT':
            return {
                to: `${ROUTES.clientRecords(clientId)}#initial-assessment`,
                state: {
                    scrollToRecord: 'initial-assessment',
                },
            };

        default:
            return {
                to: ROUTES.clientProfile(clientId),
                state: null,
            };
    }
}

export function getClientWorkoutSessionNavigation(clientId, workout) {
    if (!workout?.id) {
        return null;
    }

    const sourceNavigation = getClientWorkoutSourceNavigation(clientId, workout);

    return {
        to: ROUTES.clientWorkoutSession(workout.id),
        state: {
            sourceNavigation,
        },
    };
}