const CLIENT_REVIEW_BADGES = {
    ARCHIVED: {
        label: 'ARCHIVED',
        color: 'gray',
        priority: -1,
    },
    SESSION: {
        label: 'ACTIVE',
        color: 'green',
        priority: 0,
        live: true,
    },
    INTAKE: {
        label: 'INTAKE',
        color: 'red',
        priority: 1,
    },
    ASSESS: {
        label: 'ASSESS',
        color: 'yellow',
        priority: 2,
    },
    ACTIVE: {
        label: 'ACTIVE',
        color: 'green',
        priority: 3,
    },
};

export function getClientReviewBadge(client) {
    if (client.archived) {
        return CLIENT_REVIEW_BADGES.ARCHIVED;
    }

    if (client.activeWorkout) {
        return CLIENT_REVIEW_BADGES.SESSION;
    }

    const reviewStatus = client.reviewStatus;

    if (!reviewStatus) {
        return CLIENT_REVIEW_BADGES.ACTIVE;
    }

    if (reviewStatus.intakeStatus !== 'COMPLETED') {
        return CLIENT_REVIEW_BADGES.INTAKE;
    }

    if (reviewStatus.initialAssessmentStatus !== 'COMPLETED') {
        return CLIENT_REVIEW_BADGES.ASSESS;
    }

    return CLIENT_REVIEW_BADGES.ACTIVE;
}

export function getClientReviewPriority(client) {
    return getClientReviewBadge(client).priority;
}