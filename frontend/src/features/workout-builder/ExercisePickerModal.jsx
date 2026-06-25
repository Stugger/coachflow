import {useEffect, useMemo, useRef, useState} from 'react';
import {
    Avatar,
    Box,
    Group,
    Modal,
    ScrollArea,
    Stack,
    Text,
    TextInput,
    UnstyledButton,
} from '@mantine/core';
import {
    IconBarbell,
    IconPhoto,
    IconSearch,
} from '@tabler/icons-react';

import * as ExerciseMetadataUtils from '../../utils/exercise-metadata-utils';

import {
    EQUIPMENT_OPTIONS,
    MUSCLE_OPTIONS,
    EXERCISE_TAG_OPTIONS
} from '../../constants/exercises';

function ExercisePickerModal({opened, exercises, onClose, onAdd}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [searchText, setSearchText] = useState('');

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const searchInputRef = useRef(null);

    const filteredExercises = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();

        return [...exercises]
            .filter(exercise => matchesSearch(exercise, normalizedSearch))
            .sort((first, second) => first.name.localeCompare(second.name));
    }, [exercises, searchText]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (!opened) {
            setSearchText('');
            return;
        }
    }, [opened]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Utility
    // ------------------------------------------------------------------------------------------------------------------------

    function matchesSearch(exercise, normalizedSearch) {
        if (!normalizedSearch) {
            return true;
        }

        const metadata = ExerciseMetadataUtils.parseExerciseMetadataJson(
            exercise.metadataJson,
        );

        const searchableValues = [
            exercise.name,
            ...metadata.equipment.map(value => findOptionLabel(EQUIPMENT_OPTIONS, value)),
            ...metadata.primaryMuscles.map(value => findOptionLabel(MUSCLE_OPTIONS, value)),
            ...metadata.tags.map(value => findOptionLabel(EXERCISE_TAG_OPTIONS, value)),
        ];

        return searchableValues
            .filter(Boolean)
            .some(value => value.toLowerCase().includes(normalizedSearch));
    }

    function findOptionLabel(options, value) {
        return options.find(option => option.value === value)?.label || value;
    }

    function getExerciseSummary(exercise) {
        const metadata = ExerciseMetadataUtils.parseExerciseMetadataJson(
            exercise.metadataJson,
        );

        const equipment = metadata.equipment
            .slice(0, 1)
            .map(value => findOptionLabel(EQUIPMENT_OPTIONS, value));

        const muscles = metadata.primaryMuscles
            .slice(0, 2)
            .map(value => findOptionLabel(MUSCLE_OPTIONS, value));

        return [...equipment, ...muscles].join(' · ');
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderSearchPanel() {
        return (
            <Box
                p="sm"
                style={{
                    flexShrink: 0,
                    borderBottom: '1px solid var(--color-border)',
                }}
            >
                <Stack gap="xs">
                    <TextInput
                        ref={searchInputRef}
                        placeholder="Search exercises..."
                        leftSection={<IconSearch size={16}/>}
                        value={searchText}
                        onChange={event => setSearchText(event.currentTarget.value)}
                    />

                    <Text size="sm" c="dimmed" pt={2}>
                        {filteredExercises.length} exercise{filteredExercises.length === 1 ? '' : 's'}
                    </Text>
                </Stack>
            </Box>
        );
    }

    function renderExercises() {
        if (filteredExercises.length === 0) {
            return (
                <Box
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--color-surface)',
                    }}
                    p="xl"
                >
                    <Stack gap={2} align="center">
                        <Text fw={700}>No exercises found</Text>
                        <Text size="sm" c="dimmed" ta="center">
                            Try a different search.
                        </Text>
                    </Stack>
                </Box>
            );
        }
        return (
            <ScrollArea
                type="auto"
                style={{
                    flex: 1,
                    minHeight: 0,
                    backgroundColor: 'var(--color-background)',
                }}
            >
                <Stack gap={8} pt="xs" pb="xs" pl="xs" pr="md">
                    {filteredExercises.map(renderExerciseRow)}
                </Stack>
            </ScrollArea>
        );
    }

    function renderExerciseRow(exercise) {
        const summary = getExerciseSummary(exercise);

        return (
            <UnstyledButton
                key={exercise.id}
                onClick={() => onAdd(exercise)}
                style={{
                    width: '100%',
                    borderRadius: 'var(--mantine-radius-md)',
                    backgroundColor: 'var(--color-surface)',
                }}
            >
                <Box
                    className="interactive-card subtle"
                    p="sm"
                    style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--mantine-radius-md)',
                    }}
                >
                    <Stack gap={0}>
                        <Box
                            style={{
                                display: 'flex',
                                gap: 'var(--mantine-spacing-sm)',
                                alignItems: 'center',
                            }}
                        >
                            <Avatar
                                src={exercise.thumbnailUrl}
                                alt={exercise.name}
                                size={50}
                                radius="sm"
                                variant="subtle"
                            >
                                <IconPhoto size={20}/>
                            </Avatar>

                            <Stack gap={2} style={{minWidth: 0, flex: 1}}>
                                <Text fw={700} lineClamp={1}>
                                    {exercise.name}
                                </Text>

                                {summary && (
                                    <Text size="sm" c="dimmed" lineClamp={1}>
                                        {summary}
                                    </Text>
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                </Box>
            </UnstyledButton>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Modal.Root
            opened={opened}
            onClose={onClose}
            centered
            size="lg"
            transitionProps={{
                onEntered: () => {
                    searchInputRef.current?.focus();
                },
            }}
            styles={{
                content: { height: '800px', display: 'flex', flexDirection: 'column' },
                body: { flex: 1, minHeight: 0 }
            }}
        >
            <Modal.Overlay/>

            <Modal.Content
                style={{
                    borderRadius: '1rem',
                }}
            >
                <Modal.Header
                    style={{
                        flexShrink: 0,
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                    }}
                >
                    <Modal.Title style={{ flex: 1, minWidth: 0 }}>
                        <Group gap="0.5rem" wrap="nowrap" style={{ minWidth: 0 }}>
                            <IconBarbell stroke={1.2}/>
                            <Text size="1.2rem" fw={500}>
                                Add exercise
                            </Text>
                        </Group>
                    </Modal.Title>
                    <Modal.CloseButton style={{ flexShrink: 0 }} />
                </Modal.Header>

                <Modal.Body
                    style={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 0,
                        backgroundColor: 'var(--color-background)',
                    }}
                >
                    {renderSearchPanel()}
                    {renderExercises()}
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
}

export default ExercisePickerModal;