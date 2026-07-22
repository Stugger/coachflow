import {
    Badge,
    Box,
    Group,
    Paper,
    Stack,
    Text,
} from '@mantine/core';

import {
    getSetResultSummaryFields,
    usesSeparateSideValues,
} from './client-workout-set-result-utils.js';

function ClientWorkoutSessionResultSummary({exerciseId, benchmarks, config, set, values, notes, colorScheme}) {

    const groups = config.eachSide
        ? usesSeparateSideValues(values)
            ? [
                ['Left', values.left],
                ['Right', values.right],
            ]
            : [['Both sides', values.default]]
        : [['', values.default]];

    const trainerNote = (notes ?? '').trim();

    return (
        <Stack gap="sm">
            {groups.map(([label, sideValues]) => (
                <ResultTargetGroup
                    key={label || 'default'}
                    label={label}
                    exerciseId={exerciseId}
                    benchmarks={benchmarks}
                    config={config}
                    set={set}
                    values={sideValues}
                    colorScheme={colorScheme}
                />
            ))}

            {trainerNote && (
                <Text
                    size="sm"
                    c="dimmed"
                    style={{whiteSpace: 'pre-wrap'}}
                >
                    <Text component="span" fw={600}>
                        Trainer note:{' '}
                    </Text>

                    {trainerNote}
                </Text>
            )}
        </Stack>
    );
}

function ResultTargetGroup({label, exerciseId, benchmarks, config, set, values, colorScheme}) {

    const fields = getSetResultSummaryFields({exerciseId, benchmarks, config, set, values});

    return (
        <Stack gap={6}>
            {label && (
                <Text size="sm" fw={700}>
                    {label}
                </Text>
            )}

            {fields.length ? (
                <Paper
                    withBorder
                    radius="md"
                    style={{
                        overflow: 'hidden',
                        backgroundColor: 'var(--color-workout-exercise-bg)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <SummaryRow header colorScheme={colorScheme}>
                        <span/>

                        <Text
                            size="xs"
                            fw={700}
                            c="dimmed"
                            tt="uppercase"
                        >
                            Result
                        </Text>

                        <Text
                            size="xs"
                            fw={700}
                            c="dimmed"
                            tt="uppercase"
                        >
                            Target
                        </Text>
                    </SummaryRow>

                    {fields.map(field => (
                        <SummaryRow key={field.key} colorScheme={colorScheme}>
                            <Stack gap={1}>
                                <Text size="sm" fw={600} truncate>
                                    {field.label}
                                </Text>

                                {field.modeLabel && (
                                    <Text size="xs" c="dimmed" lh={1}>
                                        {field.modeLabel}
                                    </Text>
                                )}
                            </Stack>

                            <Group gap={6} wrap="wrap">
                                <Text size="sm" fw={700}>
                                    {field.resultLabel}
                                </Text>

                                {field.deltaLabel && (
                                    <Badge
                                        size="xs"
                                        variant="light"
                                        color="gray"
                                        radius="sm"
                                    >
                                        {field.deltaLabel}
                                    </Badge>
                                )}
                            </Group>

                            <Stack gap={0}>
                                <Text size="sm" fw={600}>
                                    {field.targetLabel}
                                </Text>

                                {field.targetDetailLabel && (
                                    <Text size="xs" c={field.targetDetailColor ?? 'dimmed'}>
                                        {field.targetDetailLabel}
                                    </Text>
                                )}
                            </Stack>
                        </SummaryRow>
                    ))}
                </Paper>
            ) : (
                <Text size="sm" c="dimmed">
                    No result fields configured.
                </Text>
            )}
        </Stack>
    );
}

function SummaryRow({header = false, children, colorScheme}) {
    return (
        <Box
            px="sm"
            py={header ? 6 : 'sm'}
            bg={header ? colorScheme === 'light' ? 'rgba(0, 0, 0, 0.01)' : 'rgba(255, 255, 255, 0.01)' : undefined}
            style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(4.5rem, 0.8fr) repeat(2, minmax(0, 1fr))',
                alignItems: 'center',
                columnGap: '0.75rem',
                borderTop: header ? undefined : '1px solid var(--mantine-color-disabled)',
            }}
        >
            {children}
        </Box>
    );
}

export default ClientWorkoutSessionResultSummary;