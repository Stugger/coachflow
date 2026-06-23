import {useRef, useState} from 'react';
import {
    useComputedColorScheme,
    ActionIcon,
    Avatar,
    Button,
    Collapse,
    Group,
    Menu,
    Paper,
    Stack,
    Switch,
    Text,
    Textarea,
    TextInput,
    Tooltip,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {
    IconArrowDown,
    IconArrowUp,
    IconDots,
    IconEdit,
    IconEye,
    IconLink,
    IconPencilExclamation,
    IconPhoto,
    IconPlus,
    IconProgressHelp,
    IconTrash,
} from '@tabler/icons-react';

import ExerciseTrackingConfig from './ExerciseTrackingConfig';
import ExerciseSetTable from './ExerciseSetTable';
import {
    createWorkoutSet,
    parseWorkoutConfig,
    stringifyWorkoutConfig,
    pruneUnusedTargets,
} from './workout-draft-factory';

function ExerciseItemCard({item, itemIndex, itemCount, independent, onChange, onDelete, onMoveUp, onMoveDown}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isMobile = useMediaQuery('(max-width: 48em)');

    const computedColorScheme = useComputedColorScheme('light');

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [configDraft, setConfigDraft] = useState(null);
    const [customizingFields, setCustomizingFields] = useState(false);

    const exerciseOptionsButtonRef = useRef(null);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const committedConfig = parseWorkoutConfig(item.configJson);

    const activeConfig = customizingFields && configDraft
        ? configDraft
        : committedConfig;

    const exercise = item.exercise;

    const hasNameOverride =
        Boolean(item.name?.trim()) &&
        item.name.trim() !== exercise?.name?.trim();

    // ------------------------------------------------------------------------------------------------------------------------
    // Draft persistence helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function saveTrackingConfig() {
        updateExerciseConfig(
            pruneUnusedTargets(configDraft)
        );

        closeTrackingConfig();
    }

    function updateExerciseConfig(nextConfig) {
        const currentConfigJson = stringifyWorkoutConfig(
            parseWorkoutConfig(item.configJson)
        );

        const nextConfigJson = stringifyWorkoutConfig(nextConfig);

        if (nextConfigJson !== currentConfigJson) {
            onChange({
                configJson: nextConfigJson,
            });
        }
    }

    function updateEachSide(eachSide) {
        const nextConfig = {
            ...committedConfig,
            eachSide,
        };

        updateExerciseConfig(nextConfig);
    }

    function addSet() {
        const nextConfig = {
            ...committedConfig,
            sets: [
                ...committedConfig.sets,
                createWorkoutSet(committedConfig.sets.length + 1),
            ],
        };

        updateExerciseConfig(nextConfig);
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function openTrackingConfig() {
        if (customizingFields) {
            return;
        }
        setConfigDraft(structuredClone(parseWorkoutConfig(item.configJson)));
        setCustomizingFields(true);
    }

    function closeTrackingConfig() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setCustomizingFields(false);

        requestAnimationFrame(() => {
            exerciseOptionsButtonRef.current?.focus();
        });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderExerciseThumbnail() {
        if (!exercise?.thumbnailUrl) {
            return (
                <Avatar
                    size={42}
                    radius="md"
                    variant="light"
                    style={{cursor: 'pointer'}}
                >
                    <IconPhoto size={24}/>
                </Avatar>
            );
        }

        return (
            <Avatar
                src={exercise.thumbnailUrl}
                alt={exercise.name}
                size={42}
                radius="md"
                style={{cursor: 'pointer'}}
            />
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            <Paper
                radius="sm"
                p={isMobile ? 'md' : 'lg'}
                shadow={computedColorScheme === 'light' ? "var(--mantine-shadow-md)" : "0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)"}
                style={{
                    border: '1px solid var(--color-border)'
                }}
            >
                <Stack gap={isMobile ? 'sm' : 'md'}>
                    <Group justify="space-between" align="center" wrap="nowrap" gap="md">
                        {renderExerciseThumbnail()}

                        <TextInput
                            fw={600}
                            variant={computedColorScheme === 'light' ? "filled" : "default"}
                            placeholder="Name this exercise"
                            leftSection={
                                hasNameOverride && (
                                    <Tooltip label="Custom exercise name" events={{ hover: true, focus: false, touch: true }}>
                                        <IconPencilExclamation
                                            size={18}
                                            color="var(--mantine-color-blue-6)"
                                            style={{flexShrink: 0}}
                                        />
                                    </Tooltip>
                                )
                            }
                            value={item.name || exercise?.name || ''}
                            onChange={event => onChange({
                                name: event.currentTarget.value,
                            })}
                            required
                            style={{
                                flex: 1,
                                minWidth: 0,
                            }}
                            styles={{
                                input: {
                                    paddingLeft: hasNameOverride ? '2rem' : undefined,
                                }
                            }}
                        />

                        <Menu withinPortal position="bottom-end">
                            <Menu.Target>
                                <Tooltip label="Exercise options" position="top-end">
                                    <ActionIcon
                                        ref={exerciseOptionsButtonRef}
                                        variant="subtle"
                                        color="gray"
                                        style={{flexShrink: 0}}
                                    >
                                        <IconDots size={18}/>
                                    </ActionIcon>
                                </Tooltip>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconEye size={14}/>}
                                    disabled
                                >
                                    View exercise
                                </Menu.Item>

                                <Menu.Item
                                    leftSection={<IconEdit size={14}/>}
                                    onClick={openTrackingConfig}
                                >
                                    Customize fields
                                </Menu.Item>

                                <Menu.Divider/>

                                <Menu.Item
                                    leftSection={<IconArrowUp size={14}/>}
                                    disabled={itemIndex === 0}
                                    onClick={onMoveUp}
                                >
                                    Move up
                                </Menu.Item>

                                <Menu.Item
                                    leftSection={<IconArrowDown size={14}/>}
                                    disabled={itemIndex === itemCount - 1}
                                    onClick={onMoveDown}
                                >
                                    Move down
                                </Menu.Item>

                                <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={14}/>}
                                    onClick={onDelete}
                                >
                                    Delete exercise
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>

                    <Collapse expanded={customizingFields}>
                        <ExerciseTrackingConfig
                            configDraft={configDraft}
                            onChange={setConfigDraft}
                            onClose={closeTrackingConfig}
                            onSave={saveTrackingConfig}
                        />
                    </Collapse>

                    <ExerciseSetTable
                        config={activeConfig}
                        disabled={customizingFields}
                        stackControlled={!independent}
                        onChange={nextConfig => {
                            if (customizingFields) {
                                setConfigDraft(nextConfig);
                                return;
                            }

                            updateExerciseConfig(nextConfig);
                        }}
                    />

                    <Group justify="space-between" align="center" wrap="nowrap">
                        <Switch
                            label="Each side"
                            size={isMobile ? "xs" : "sm"}
                            checked={committedConfig.eachSide}
                            onChange={event => updateEachSide(event.currentTarget.checked)}
                            disabled={customizingFields}
                        />

                        <Tooltip
                            label="Rounds control set count"
                            disabled={independent}
                            position="top-end"
                            offset={0}
                            withArrow
                            arrowSize={10}
                            arrowOffset={15}
                            events={{ hover: true, focus: false, touch: true }}
                        >
                            <span>
                                <Button
                                    variant="subtle"
                                    size={isMobile ? "xs" : "sm"}
                                    leftSection={independent ? <IconPlus size={16}/> : null}
                                    rightSection={independent ? null : <IconProgressHelp size={16}/>}
                                    disabled={!independent || customizingFields}
                                    onClick={addSet}
                                    styles={{
                                        label: {
                                            marginLeft: independent ? -4 : 0,
                                            marginRight: independent ? 0 : -4,
                                        }
                                    }}
                                    style={{
                                        ...(!independent || customizingFields ? {
                                            background: 'transparent',
                                        } : {})
                                    }}
                                >
                                    Add set
                                </Button>
                            </span>
                        </Tooltip>
                    </Group>

                    <Textarea
                        classNames={{input: 'subtleInput'}}
                        variant="filled"
                        placeholder="Add notes for this exercise"
                        value={item.notes ?? ''}
                        onChange={event => onChange({
                            notes: event.currentTarget.value,
                        })}
                        autosize
                        minRows={1}
                        maxRows={4}
                        styles={{
                            input: {
                                backgroundColor: computedColorScheme === 'light' ? 'var(--color-background)' : 'var(--color-surface)',
                            },
                        }}
                    />
                </Stack>
            </Paper>

            {independent && itemIndex !== itemCount - 1 && (
                <Group gap={0} mb="sm" mt="sm" wrap="nowrap" justify="center">
                    <IconLink opacity={0.4} size={20}/>
                </Group>
            )}
        </>
    );
}

export default ExerciseItemCard;