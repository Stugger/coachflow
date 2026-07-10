import {memo, useMemo, useEffect, useRef, useState} from 'react';
import {useIsSmallScreen} from "../../../hooks/useIsSmallScreen.js";
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
    Textarea,
    TextInput,
    Tooltip,
} from '@mantine/core';
import {
    IconArrowDown,
    IconArrowUp,
    IconConnection,
    IconDots,
    IconEdit,
    IconEye,
    IconLink,
    IconAlertTriangle,
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
} from '../draft/workout-draft-factory';

import {resolveMediaUrl} from '../../../utils/media-url-utils';

function ExerciseItemCard({
                              item,
                              itemIndex,
                              itemCount,
                              independent,
                              isNew,
                              onChange,
                              onDelete,
                              onMoveUp,
                              onMoveDown,
                              onViewExercise,
                          }) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isSmallScreen = useIsSmallScreen();

    const computedColorScheme = useComputedColorScheme('light');

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const exercise = item.exercise;

    const [configDraft, setConfigDraft] = useState(null);
    const [customizingFields, setCustomizingFields] = useState(false);

    const nameInputRef = useRef(false);
    const exerciseOptionsButtonRef = useRef(null);

    const libraryExerciseName = exercise?.name ?? '';

    const [nameInputValue, setNameInputValue] = useState(
        item.name?.trim() || libraryExerciseName,
    );

    const hasNameOverride =
        Boolean(item.name?.trim()) &&
        item.name.trim() !== exercise?.name?.trim();

    const committedConfig = useMemo(
        () => parseWorkoutConfig(item.configJson),
        [item.configJson],
    );

    const activeConfig = customizingFields && configDraft
        ? configDraft
        : committedConfig;

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (!nameInputRef.current) {
            setNameInputValue(
                item.name?.trim() || libraryExerciseName,
            );
        }
    }, [item.name, libraryExerciseName]);

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
        const currentConfigJson = stringifyWorkoutConfig(committedConfig);
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

        setConfigDraft(structuredClone(committedConfig));
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
                    size={40}
                    radius="sm"
                    variant="subtle"
                    style={{cursor: 'pointer'}}
                    onClick={() => {
                        if (exercise) {
                            onViewExercise(exercise)
                        }
                    }}
                >
                    <IconPhoto size={24}/>
                </Avatar>
            );
        }

        return (
            <Avatar
                src={resolveMediaUrl(exercise.thumbnailUrl)}
                alt={exercise.name}
                size={50}
                radius="md"
                style={{cursor: 'pointer'}}
                onClick={() => onViewExercise(exercise)}
            />
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            <Paper
                className={isNew ? 'workout-structure-created' : undefined}
                radius={isSmallScreen ? "sm" : "md"}
                p={isSmallScreen ? 'md' : 'lg'}
                ml={!independent ? 0 : isSmallScreen ? 3 : 5}
                mr={!independent ? 0 : isSmallScreen ? 3 : 5}
                bg="var(--color-workout-exercise-bg)"
                shadow="0px 3px 10px -1px rgba(0, 0, 0, 0.1), 0px 6px 20px -4px rgba(0, 0, 0, 0.05)"
                style={{
                    border: '1px solid var(--color-border)'
                }}
            >
                <Stack gap={isSmallScreen ? 'sm' : 'md'}>
                    <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
                        {renderExerciseThumbnail()}

                        <TextInput
                            classNames={{input: 'subtle-input'}}
                            fw={600}
                            variant='filled'
                            placeholder="Name this exercise"
                            leftSection={
                                hasNameOverride && (
                                    <Tooltip
                                        label="Custom exercise name"
                                        position="top-start"
                                        offset={4}
                                        withArrow
                                        arrowSize={10}
                                        arrowOffset={13}
                                        events={{ hover: true, focus: false, touch: true }}
                                    >
                                        <IconAlertTriangle
                                            size={18}
                                            color="var(--mantine-color-yellow-5)"
                                            style={{
                                                flexShrink: 0,
                                                paddingTop: '2px',
                                                filter: 'drop-shadow(0 0 4px rgba(250, 176, 5, 0.6))',
                                            }}
                                        />
                                    </Tooltip>
                                )
                            }
                            value={nameInputValue}
                            maxLength={255}
                            onFocus={() => {
                                nameInputRef.current = true;
                            }}
                            onChange={event => {
                                const nextName = event.currentTarget.value;
                                setNameInputValue(nextName);
                                onChange({
                                    name: nextName,
                                });
                            }}
                            onBlur={() => {
                                nameInputRef.current = false;
                                if (!nameInputValue.trim()) {
                                    setNameInputValue(libraryExerciseName);
                                }
                            }}
                            style={{
                                flex: 1,
                                minWidth: 0,
                                paddingLeft: isSmallScreen ? 2 : 4,
                            }}
                            styles={{
                                input: {
                                    paddingLeft: hasNameOverride ? '2rem' : undefined,
                                    backgroundColor: computedColorScheme === 'light' ? '#f5f7f9' : '#2f2f2f',
                                }
                            }}
                        />

                        <Menu shadow="md" withinPortal position="bottom-end" transitionProps={{ duration: 0 }}>
                            <Menu.Target>
                                <Tooltip label="Exercise options">
                                    <ActionIcon
                                        ref={exerciseOptionsButtonRef}
                                        variant="subtle"
                                        color={computedColorScheme === 'light' ? "gray" : "light"}
                                        style={{flexShrink: 0}}
                                    >
                                        <IconDots size={18}/>
                                    </ActionIcon>
                                </Tooltip>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconEye size={14}/>}
                                    disabled={!exercise}
                                    onClick={() => onViewExercise(exercise)}
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
                            colorScheme={computedColorScheme}
                            onChange={setConfigDraft}
                            onClose={closeTrackingConfig}
                            onSave={saveTrackingConfig}
                        />
                    </Collapse>

                    <ExerciseSetTable
                        config={activeConfig}
                        locked={customizingFields}
                        stackControlled={!independent}
                        colorScheme={computedColorScheme}
                        onChange={nextConfig => {
                            if (customizingFields) {
                                setConfigDraft(nextConfig);
                                return;
                            }

                            updateExerciseConfig(nextConfig);
                        }}
                    />

                    <Group justify="space-between" align="center" wrap="nowrap" mt={-5}>
                        <Switch
                            label="Each side"
                            size={isSmallScreen ? "xs" : "sm"}
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
                                    size={isSmallScreen ? "xs" : "sm"}
                                    leftSection={independent ? <IconPlus size={16}/> : null}
                                    rightSection={independent ? null : <IconProgressHelp size={isSmallScreen ? 16 : 18}/>}
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
                        classNames={{input: 'subtle-input'}}
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
                                backgroundColor: computedColorScheme === 'light' ? '#f5f7f9' : '#2f2f2f',
                            },
                        }}
                    />
                </Stack>
            </Paper>

            {itemIndex !== itemCount - 1 && (
                <Group gap={0} mb="sm" mt="sm" mr={!independent ? (isSmallScreen ? 13 : 24) : 0} wrap="nowrap" justify="center">
                    {!independent ? (
                        <IconConnection opacity={0.35} size={24}/>
                    ) : (
                        <IconLink opacity={0.4} size={24}/>
                    )}
                </Group>
            )}
        </>
    );
}

function areExerciseItemCardPropsEqual(previous, next) {
    return previous.item === next.item &&
        previous.sectionIndex === next.sectionIndex &&
        previous.parentStackItemIndex === next.parentStackItemIndex &&
        previous.itemIndex === next.itemIndex &&
        previous.itemCount === next.itemCount &&
        previous.independent === next.independent &&
        previous.isNew === next.isNew;
}

export default memo(ExerciseItemCard, areExerciseItemCardPropsEqual);