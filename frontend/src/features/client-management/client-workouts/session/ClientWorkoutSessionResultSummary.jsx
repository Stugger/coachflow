import {Stack, Text} from '@mantine/core';

import {formatSetResultValues} from './client-workout-set-result-utils.js';

function ClientWorkoutSessionResultSummary({config, values}) {
    const groups = config.eachSide
        ? [['Left', values.left], ['Right', values.right]]
        : [['', values.default]];

    const summaries = groups
        .map(([label, sideValues]) => ({
            label,
            text: formatSetResultValues(config.trackingFields, sideValues),
        }))
        .filter(summary => summary.text);

    if (!summaries.length) {
        return (
            <Text size="sm" c="dimmed">
                No result values entered.
            </Text>
        );
    }

    return (
        <Stack gap={2}>
            {summaries.map(summary => (
                <Text key={summary.label || 'default'} size="sm">
                    {summary.label && (
                        <Text component="span" fw={700}>
                            {summary.label}:{' '}
                        </Text>
                    )}

                    {summary.text}
                </Text>
            ))}
        </Stack>
    );
}

export default ClientWorkoutSessionResultSummary;