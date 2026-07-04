import {Badge} from '@mantine/core';

import {getClientReviewBadge} from './client-review-utils.js';

function ClientReviewBadge({client, size}) {
    const badge = getClientReviewBadge(client);

    return (
        <Badge
            size={size}
            color={badge.color}
            variant="light"
        >
            {badge.label}
        </Badge>
    );
}

export default ClientReviewBadge;