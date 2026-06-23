import {
    ActionIcon,
    Menu,
    ScrollArea,
    Table,
    Text,
    Tooltip,
} from '@mantine/core';

import {
    IconArrowDown,
    IconArrowUp,
    IconCopy,
    IconDotsVertical,
    IconTrash,
} from '@tabler/icons-react';

import ExerciseSetTargetInput from './ExerciseSetTargetInput';
import ExerciseSetTypeInput from './ExerciseSetTypeInput';

import {reindexSets} from './workout-draft-mappers';
import {createDraftId} from './workout-draft-factory';
import {TRACKING_FIELD_DEFINITIONS} from './workout-tracking-fields';

// ------------------------------------------------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------------------------------------------------

const SET_COLUMN_WIDTH = '4rem';
const ACTIONS_COLUMN_WIDTH = '3rem';

const rowCellStyle = {
    borderBottom: '2px solid var(--color-border)',
    background: 'transparent',
};

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

function ExerciseSetTable({config, disabled, stackControlled, onChange}) {

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

    function updateSetType(setPosition, setType) {
        onChange({
            ...config,
            sets: sets.map(set =>
                set.position === setPosition
                    ? {
                        ...set,
                        setType,
                    }
                    : set
            ),
        });
    }

    function duplicateSet(setPosition) {
        const sourceSet = sets.find(
            set => set.position === setPosition
        );

        if (!sourceSet) {
            return;
        }

        const duplicatedSet = {
            ...structuredClone(sourceSet),
            draftId: createDraftId('set'),
        };

        onChange({
            ...config,
            sets: reindexSets([
                ...sets,
                duplicatedSet,
            ]),
        });
    }

    function moveSet(setPosition, direction) {
        const currentIndex = sets.findIndex(
            set => set.position === setPosition
        );

        const nextIndex = currentIndex + direction;

        if (
            currentIndex < 0
            || nextIndex < 0
            || nextIndex >= sets.length
        ) {
            return;
        }

        const nextSets = [...sets];

        [nextSets[currentIndex], nextSets[nextIndex]] = [
            nextSets[nextIndex],
            nextSets[currentIndex],
        ];

        onChange({
            ...config,
            sets: reindexSets(nextSets),
        });
    }

    function deleteSet(setPosition) {
        if (sets.length <= 1) {
            return;
        }

        onChange({
            ...config,
            sets: reindexSets(
                sets.filter(set => set.position !== setPosition)
            ),
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
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderSetMenu(set, setIndex) {
        const isFirstSet = setIndex === 0;
        const isLastSet = setIndex === sets.length - 1;

        const duplicateDisabled = disabled || stackControlled;
        const deleteDisabled =
            disabled
            || stackControlled
            || sets.length <= 1;

        return (
            <Menu withinPortal position="bottom-end">
                <Menu.Target>
                    <Tooltip label="Set options">
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            disabled={disabled}
                        >
                            <IconDotsVertical size={18}/>
                        </ActionIcon>
                    </Tooltip>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={<IconCopy size={14}/>}
                        disabled={duplicateDisabled}
                        onClick={() => duplicateSet(set.position)}
                    >
                        Duplicate set
                    </Menu.Item>

                    <Menu.Divider/>

                    <Menu.Item
                        leftSection={<IconArrowUp size={14}/>}
                        disabled={disabled || isFirstSet}
                        onClick={() => moveSet(set.position, -1)}
                    >
                        Move up
                    </Menu.Item>

                    <Menu.Item
                        leftSection={<IconArrowDown size={14}/>}
                        disabled={disabled || isLastSet}
                        onClick={() => moveSet(set.position, 1)}
                    >
                        Move down
                    </Menu.Item>

                    <Menu.Divider/>

                    <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={14}/>}
                        disabled={deleteDisabled}
                        onClick={() => deleteSet(set.position)}
                    >
                        Delete set
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        );
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

                        <Table.Th
                            style={{
                                width: ACTIONS_COLUMN_WIDTH,
                                minWidth: ACTIONS_COLUMN_WIDTH,
                            }}
                        />
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
                                    <ExerciseSetTypeInput
                                        set={set}
                                        disabled={disabled}
                                        onChange={setType => updateSetType(set.position, setType)}
                                    />
                                </Table.Td>

                                {trackingFields.map(field => (
                                    <Table.Td
                                        key={field.key}
                                        style={{
                                            ...rowCellStyle,
                                            minWidth: getColumnMinWidth(field),
                                            textAlign: 'center',
                                            ...(isFirstRow ? {
                                                borderTop: '2px solid var(--color-border)',
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

                                <Table.Td
                                    style={{
                                        ...rowCellStyle,
                                        width: ACTIONS_COLUMN_WIDTH,
                                        minWidth: ACTIONS_COLUMN_WIDTH,
                                        textAlign: 'center',
                                        borderRight: '2px solid var(--color-border)',
                                        ...(isFirstRow ? {
                                            borderTop: '2px solid var(--color-border)',
                                            borderTopRightRadius: 'var(--mantine-radius-md)',
                                        } : {}),
                                        ...(isLastRow ? {
                                            borderBottomRightRadius: 'var(--mantine-radius-md)',
                                        } : {}),
                                    }}
                                >
                                    {renderSetMenu(set, setIndex)}
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    );
}

export default ExerciseSetTable;