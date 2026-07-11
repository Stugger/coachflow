import {useIsSmallScreen} from "../../../hooks/useIsSmallScreen.js";
import {
    ActionIcon,
    Badge,
    Button,
    Checkbox,
    Divider,
    Group,
    Menu,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Tooltip,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconArrowRight,
    IconCheck,
    IconHelpCircle,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';

import {reindexTrackingFields} from '../draft/workout-draft-mappers';
import {
    TRACKING_FIELD_DEFINITIONS,
    createTrackingField,
} from '../../exercises/exercise-tracking-fields';
import {getExerciseUnitLabel} from '../../exercises/exercise-units.js';

function ExerciseTrackingConfig({configDraft, colorScheme, onChange, onClose, onSave}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isSmallScreen = useIsSmallScreen();

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const trackingFields = [...(configDraft?.trackingFields ?? [])]
        .sort((a, b) => a.position - b.position);

    // ------------------------------------------------------------------------------------------------------------------------
    // Draft update helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function updateTrackingField(fieldKey, updates) {
        const currentField = trackingFields.find(
            field => field.key === fieldKey
        );

        const modeChanged =
            updates.mode
            && updates.mode !== currentField?.mode;

        onChange({
            ...configDraft,
            trackingFields: trackingFields.map(field =>
                field.key === fieldKey
                    ? {
                        ...field,
                        ...updates,
                    }
                    : field
            ),
            ...(modeChanged ? {
                sets: configDraft.sets.map(set => {
                    const targets = {
                        ...set.targets,
                    };

                    delete targets[fieldKey];

                    return {
                        ...set,
                        targets,
                    };
                }),
            } : {}),
        });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Draft helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function isFieldTracked(fieldKey) {
        return trackingFields.some(field => field.key === fieldKey);
    }

    function addTrackingField(fieldKey) {
        if (isFieldTracked(fieldKey)) {
            return;
        }
        onChange({
            ...configDraft,
            trackingFields: [
                ...trackingFields,
                createTrackingField(fieldKey, trackingFields.length + 1)
            ],
        });
    }

    function removeTrackingField(fieldKey) {
        if (!isFieldTracked(fieldKey)) {
            return;
        }
        onChange({
            ...configDraft,
            trackingFields: reindexTrackingFields(
                trackingFields.filter(field => field.key !== fieldKey)
            ),
        });

        return;
    }

    function moveTrackingField(fieldKey, direction) {
        const currentIndex = trackingFields.findIndex(
            field => field.key === fieldKey
        );

        const nextIndex = currentIndex + direction;

        if (
            currentIndex === -1 ||
            nextIndex < 0 ||
            nextIndex >= trackingFields.length
        ) {
            return;
        }

        const reorderedFields = [...trackingFields];

        [reorderedFields[currentIndex], reorderedFields[nextIndex]] = [
            reorderedFields[nextIndex],
            reorderedFields[currentIndex],
        ];

        onChange({
            ...configDraft,
            trackingFields: reindexTrackingFields(reorderedFields),
        });
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

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderTrackingFieldPill(field) {
        const definition = TRACKING_FIELD_DEFINITIONS[field.key];

        const activeMode = getTrackingFieldMode(field);

        const availableUnits = activeMode?.units ?? definition.units ?? [];

        const unit = activeMode
            ? field.unit ?? activeMode.unit
            : field.unit ?? definition.unit;

        return (
            <Menu shadow="md" key={field.key} withinPortal position="bottom-start" transitionProps={{ duration: 0 }}>
                <Menu.Target>
                    <Badge
                        bg={colorScheme === 'light'
                            ? 'var(--color-surface)'
                            : 'var(--mantine-color-dark-5)'}
                        size={isSmallScreen ? "lg" : "xl"}
                        radius="sm"
                        component="button"
                        style={{
                            cursor: 'pointer',
                            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = colorScheme === 'light' ? 'transparent' : 'var(--mantine-color-dark-4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = colorScheme === 'light' ? 'var(--color-surface)' : 'var(--mantine-color-dark-5)';
                        }}
                        styles={{
                            root: {
                                borderColor: "var(--color-border)",
                                boxShadow: colorScheme === 'light' ? "0 0.15rem 0.3rem rgba(0, 0, 0, 0.2)" : "0 0.1rem 0.5rem rgba(0, 0, 0, 0.4)",
                            },
                            label: {
                                color: colorScheme === 'light' ? "black" : "gray",
                            }
                        }}
                    >
                        <Group gap={4}>
                            <Text size="xs" c="dimmed" fw={600}>
                                {field.position}.
                            </Text>
                            <Text size="xs" c={colorScheme === 'light' ? "black" : "white"} fw={600}>
                                {definition.label}
                                {unit ? ` · ${getExerciseUnitLabel(unit)}` : ''}
                            </Text>
                        </Group>
                    </Badge>
                </Menu.Target>
                <Menu.Dropdown>
                    {definition.modes?.length > 0 && (
                        <Menu.Sub>
                            <Menu.Sub.Target>
                                <Menu.Sub.Item>
                                    Format
                                </Menu.Sub.Item>
                            </Menu.Sub.Target>

                            <Menu.Sub.Dropdown>
                                {definition.modes.map(mode => (
                                    <Menu.Item
                                        key={mode.value}
                                        rightSection={field.mode === mode.value ? <IconCheck size={18}/>: null}
                                        onClick={() => updateTrackingField(field.key, {
                                            mode: mode.value,
                                            ...(mode.unit ? {unit: mode.unit} : {unit: null}),
                                        })}
                                    >
                                        {mode.label}
                                    </Menu.Item>
                                ))}
                            </Menu.Sub.Dropdown>
                        </Menu.Sub>
                    )}

                    {availableUnits.length > 0 && (
                        <Menu.Sub>
                            <Menu.Sub.Target>
                                <Menu.Sub.Item>
                                    Unit
                                </Menu.Sub.Item>
                            </Menu.Sub.Target>

                            <Menu.Sub.Dropdown>
                                {availableUnits.map(unit => (
                                    <Menu.Item
                                        key={unit.value}
                                        rightSection={field.unit === unit.value ? <IconCheck size={18}/>: null}
                                        onClick={() => updateTrackingField(field.key, {
                                            unit: unit.value,
                                        })}
                                    >
                                        {unit.label}
                                    </Menu.Item>
                                ))}
                            </Menu.Sub.Dropdown>
                        </Menu.Sub>
                    )}

                    {(definition.modes?.length > 0 || availableUnits.length > 0) && (
                        <Menu.Divider />
                    )}

                    <Menu.Item
                        disabled={field.position === 1}
                        leftSection={<IconArrowLeft size={14}/>}
                        onClick={() => moveTrackingField(field.key, -1)}
                    >
                        Move left
                    </Menu.Item>

                    <Menu.Item
                        disabled={field.position === trackingFields.length}
                        leftSection={<IconArrowRight size={14}/>}
                        onClick={() => moveTrackingField(field.key, 1)}
                    >
                        Move right
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => removeTrackingField(field.key)}
                    >
                        Remove field
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Paper
            radius="sm"
            p="sm"
            bg={colorScheme === 'light' ? '#f5f7fa' : '#242424'}
            shadow="none"
        >
            <Stack gap="sm">
                <Group gap={isSmallScreen ? 8 : 'xs'} justify="space-between" wrap='nowrap'>
                    <Group gap={4} align="center" style={{flexGrow: 1}}>
                        <Text size="xs" fw={700} c="dimmed">
                            TRACKING FIELDS
                        </Text>

                        <Tooltip
                            label="Choose and configure the metrics this exercise tracks in this workout. These fields become the set/round columns used for targets, workout sessions, and history. This does not change the exercise library."
                            multiline
                            w={285}
                            withArrow
                            arrowSize={12}
                            position="top"
                            events={{ hover: true, focus: true, touch: true }}
                        >
                            <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="gray"
                                mb={2}
                                aria-label="Tracking fields info"
                                onClick={event => event.stopPropagation()}
                            >
                                <IconHelpCircle size={20} color='gray'/>
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                    <Button
                        size="xs"
                        variant="outline"
                        color='red'
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        size="xs"
                        variant='outline'
                        onClick={onSave}
                    >
                        Save
                    </Button>
                </Group>

                <Divider opacity={0.75} color='var(--color-border)'/>

                {trackingFields.length === 0 ? (
                    <Text size="xs" c="dimmed" opacity={0.6} pt={isSmallScreen ? "xs" : "0.9rem"}>No tracking fields added yet.</Text>
                ) : (
                    <Group gap="xs">
                        {trackingFields.map(field => (
                            renderTrackingFieldPill(field)
                        ))}
                    </Group>
                )}
                <Group justify="flex-end">
                    <Menu shadow="md" withinPortal position="bottom-end" closeOnItemClick={false} style={{flexShrink: 0}}>
                        <Menu.Target>
                            <Button
                                aria-label="Add tracking field"
                                size="sm"
                                w={70}
                                variant='default'
                            >
                                <IconPlus size={16} stroke={3.4} color={colorScheme === 'light' ? 'gray' : 'darkgray'}/>
                            </Button>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <SimpleGrid cols={{base: 2}} spacing={0} verticalSpacing={0}>
                                {Object.values(TRACKING_FIELD_DEFINITIONS).map((field) => {
                                    const tracked = isFieldTracked(field.key);
                                    return (
                                        <Menu.Item
                                            key={field.key}
                                            onClick={() => addTrackingField(field.key)}
                                            disabled={tracked}
                                            leftSection={
                                                <Checkbox.Indicator
                                                    disabled={tracked}
                                                    checked={tracked}
                                                    style={{cursor: tracked ? undefined : 'pointer'}}
                                                />
                                            }
                                        >
                                            {field.label}
                                        </Menu.Item>
                                    );
                                })}
                            </SimpleGrid>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Stack>
        </Paper>
    );
}

export default ExerciseTrackingConfig;