import {
    ScrollArea,
    Table,
    Text,
} from '@mantine/core';

import ExerciseSetTargetInput from './ExerciseSetTargetInput';

import {TRACKING_FIELD_DEFINITIONS} from './workout-tracking-fields';

const SET_COLUMN_WIDTH = '3.25rem';

const rowCellStyle = {
    borderBottom: '2px solid var(--color-border)',
    background: 'transparent',
};

function ExerciseSetTable({config, disabled, onChange}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const trackingFields = [...(config.trackingFields ?? [])]
        .sort((a, b) => a.position - b.position);

    const sets = [...(config.sets ?? [])]
        .sort((a, b) => a.position - b.position);

    if (trackingFields.length === 0) {
        const sets = config.sets?.length ?? 0;
        return (
            <Text size="sm" c='dimmed'>
                {sets} Set{sets == 1 ? '' : 's'} — No tracking fields configured.
            </Text>
        );
    }

    const scrollAreaKey = trackingFields
        .map(field => `${field.key}:${field.mode ?? ''}:${field.unit ?? ''}`)
        .join('|');

    // ------------------------------------------------------------------------------------------------------------------------
    // Config update helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function updateSetTarget(setPosition, fieldKey, value) {
        onChange({
            ...config,
            sets: sets.map(set => {
                if (set.position !== setPosition) {
                    return set;
                }

                const targets = {
                    ...set.targets,
                };

                if (isEmptyTarget(value)) {
                    delete targets[fieldKey];
                } else {
                    targets[fieldKey] = value;
                }

                return {
                    ...set,
                    targets,
                };
            }),
        });
    }

    function isEmptyTarget(value) {
        return value === ''
            || value === null
            || value === undefined
            || (
                typeof value === 'object'
                && Object.values(value).every(
                    targetValue => targetValue === null || targetValue === undefined
                )
            );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Utility
    // ------------------------------------------------------------------------------------------------------------------------

    function getTrackingFieldMode(field) {
        const definition = TRACKING_FIELD_DEFINITIONS[field.key];

        if (!definition.modes) {
            return null;
        }

        return definition.modes.find(mode => mode.value === field.mode)
            ?? definition.modes[0];
    }

    function getColumnMinWidth(field) {
        const activeMode = getTrackingFieldMode(field);

        return activeMode?.minColumnWidth
            ?? TRACKING_FIELD_DEFINITIONS[field.key].minColumnWidth
            ?? '7rem';
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <ScrollArea
            key={scrollAreaKey}
            type="auto"
            scrollbarSize={8}
            style={{
                opacity: disabled ? 0.65 : 1,
            }}
        >
            <Table
                //withColumnBorders
                verticalSpacing="sm"
                horizontalSpacing="sm"
                mb="xs"
                style={{
                    minWidth: 'max-content',
                    tableLayout: 'auto',
                    borderCollapse: 'separate',
                    borderSpacing: '0',
                }}
            >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th style={{
                            width: SET_COLUMN_WIDTH,
                            minWidth: SET_COLUMN_WIDTH,
                            textAlign: 'center',
                        }}>
                            <Text size="xs" fw={600}>
                                Set
                            </Text>
                        </Table.Th>

                        {trackingFields.map(field => {
                            const definition = TRACKING_FIELD_DEFINITIONS[field.key];
                            return (
                                <Table.Th
                                    key={field.key}
                                    style={{
                                        minWidth: getColumnMinWidth(field),
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center',
                                    }}
                                >
                                    <Text size="xs" fw={600}>
                                        {definition.label}{field.unit ? ' (' + field.unit.toLowerCase() + ')' : field.mode ? ' (' + getTrackingFieldMode(field).label.toLowerCase() + ')' : ''}
                                    </Text>
                                </Table.Th>
                            );
                        })}
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {sets.map((set, setIndex) => {
                        const isFirstRow = setIndex === 0;
                        const isLastRow = setIndex === sets.length - 1;

                        return (
                            <Table.Tr key={set.position}>
                                <Table.Td
                                    style={{
                                        ...rowCellStyle,
                                        width: SET_COLUMN_WIDTH,
                                        minWidth: SET_COLUMN_WIDTH,
                                        textAlign: 'center',
                                        borderLeft: '2px solid var(--color-border)',
                                        ...(isFirstRow ? {
                                            borderTop: '2px solid var(--color-border)',
                                            borderTopLeftRadius: 'var(--mantine-radius-md)',
                                        } : {}),
                                        ...(isLastRow ? {
                                            borderBottomLeftRadius: 'var(--mantine-radius-md)',
                                        } : {}),
                                    }}
                                >
                                    <Text size="sm" fw={600}>
                                        {set.position}
                                    </Text>
                                </Table.Td>

                                {trackingFields.map((field, fieldIndex) => (
                                    <Table.Td
                                        key={field.key}
                                        style={{
                                            ...rowCellStyle,
                                            minWidth: getColumnMinWidth(field),
                                            textAlign: 'center',
                                            ...(isFirstRow ? {
                                                borderTop: '2px solid var(--color-border)',
                                            } : {}),
                                            ...(fieldIndex === trackingFields.length - 1 ? {
                                                borderRight: '2px solid var(--color-border)',
                                                ...(isFirstRow ? {
                                                    borderTopRightRadius: 'var(--mantine-radius-md)',
                                                } : {}),
                                                ...(isLastRow ? {
                                                    borderBottomRightRadius: 'var(--mantine-radius-md)',
                                                } : {}),
                                            } : {}),
                                        }}
                                    >
                                        <ExerciseSetTargetInput
                                            field={field}
                                            value={set.targets?.[field.key]}
                                            disabled={disabled}
                                            onChange={value => updateSetTarget(set.position, field.key, value)}
                                        />
                                    </Table.Td>
                                ))}
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    );
}

export default ExerciseSetTable;