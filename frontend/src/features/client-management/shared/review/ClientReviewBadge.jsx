import {Badge} from '@mantine/core';

import {getClientReviewBadge} from './client-review-utils.js';

function ClientReviewBadge({client, size}) {
    const badge = getClientReviewBadge(client);

    return (
        <Badge
            size={size}
            color={badge.color}
            variant="light"
            leftSection={badge.live ? <span className="client-session-live-dot"/> : null}
        >
            {badge.label}
        </Badge>
    );
}

export default ClientReviewBadge;