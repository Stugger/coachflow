const CLIENT_REVIEW_BADGES = {
    ARCHIVED: {
        label: 'ARCHIVED',
        color: 'gray',
        priority: 3,
    },
    INTAKE: {
        label: 'INTAKE',
        color: 'red',
        priority: 0,
    },
    ASSESS: {
        label: 'ASSESS',
        color: 'yellow',
        priority: 1,
    },
    ACTIVE: {
        label: 'ACTIVE',
        color: 'green',
        priority: 2,
    },
};

export function getClientReviewBadge(client) {
    if (client.archived) {
        return CLIENT_REVIEW_BADGES.ARCHIVED;
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