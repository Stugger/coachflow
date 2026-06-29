import {
    Badge,
    Button,
    Divider,
    Group,
    Menu,
    Paper,
    Stack,
    Text,
} from '@mantine/core';
import {useComputedColorScheme} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {
    IconArrowLeft,
    IconArrowRight,
    IconCheck,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';

import {reindexTrackingFields} from './draft/workout-draft-mappers';
import {
    TRACKING_FIELD_DEFINITIONS,
    createTrackingField,
} from './workout-tracking-fields';

function ExerciseTrackingConfig({configDraft, onChange, onClose, onSave}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isMobile = useMediaQuery('(max-width: 48em)');

    const computedColorScheme = useComputedColorScheme('light');

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
            <Menu shadow="md" key={field.key} withinPortal position="bottom-start">
                <Menu.Target>
                    <Badge
                        bg={computedColorScheme === 'light'
                            ? 'var(--color-surface)'
                            : 'var(--mantine-color-dark-5)'}
                        size={isMobile ? "lg" : "xl"}
                        radius="sm"
                        component="button"
                        style={{
                            cursor: 'pointer',
                            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = computedColorScheme === 'light' ? 'transparent' : 'var(--mantine-color-dark-4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = computedColorScheme === 'light' ? 'var(--color-surface)' : 'var(--mantine-color-dark-5)';
                        }}
                        styles={{
                            root: {
                                borderColor: "var(--color-border)",
                                boxShadow: computedColorScheme === 'light' ? "0 0.15rem 0.3rem rgba(0, 0, 0, 0.2)" : "0 0.1rem 0.5rem rgba(0, 0, 0, 0.4)",
                            },
                            label: {
                                color: computedColorScheme === 'light' ? "black" : "gray",
                            }
                        }}
                    >
                        <Group gap={4}>
                            <Text size="xs" c="dimmed" fw={600}>
                                {field.position}.
                            </Text>
                            <Text size="xs" c={computedColorScheme === 'light' ? "black" : "white"} fw={600}>
                                {definition.label}
                                {unit ? ` · ${unit.toLowerCase()}` : ''}
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
                        Delete field
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
            bg={computedColorScheme === 'light'
                ? 'var(--color-background)'
                : 'var(--mantine-color-dark-6)'
            }
            shadow="none"
        >
            <Stack gap="sm">
                <Group gap={"xs"} justify="space-between">
                    <Text fw={600} size="xs" c="dimmed" style={{flexGrow: 1}}>
                        TRACKING FIELDS
                    </Text>
                    <Button size="xs" variant="default" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button size="xs" onClick={onSave}>
                        Save
                    </Button>
                </Group>

                <Divider opacity={0.4}/>

                {trackingFields.length === 0 ? (
                    <Text size="xs" c="dimmed" opacity={0.6} pt={isMobile ? "xs" : "0.9rem"}>No trackers added</Text>
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
                                size="sm"
                                variant={computedColorScheme}
                            >
                                <IconPlus size={16}/>
                            </Button>
                        </Menu.Target>

                        <Menu.Dropdown>
                            {Object.values(TRACKING_FIELD_DEFINITIONS).map((field) => (
                                <Menu.Item
                                    key={field.key}
                                    onClick={() => addTrackingField(field.key)}
                                    disabled={isFieldTracked(field.key)}
                                >
                                    {field.label}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Stack>
        </Paper>
    );
}

export default ExerciseTrackingConfig;