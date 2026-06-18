import {useState} from 'react';
import {
    useComputedColorScheme,
    useMantineTheme,
    getGradient,
    ActionIcon,
    Badge,
    Box,
    Button,
    Collapse,
    Divider,
    Group,
    Menu,
    Paper,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
    Tooltip,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {
    IconChevronDown,
    IconChevronUp,
    IconDotsVertical,
    IconEdit,
    IconGripVertical,
    IconNote,
    IconPlus,
    IconTrash,
    IconSeparatorHorizontal,
} from '@tabler/icons-react';

import {createWorkoutSection} from './workout-draft-factory';
import {reindexPositions} from './workout-draft-mappers';
import {WORKOUT_SECTION_TYPE_OPTIONS} from './workout-builder-constants';

function WorkoutBuilder({draft, exercises, onChange}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isMobile = useMediaQuery('(max-width: 48em)');
    const computedColorScheme = useComputedColorScheme('light');

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [expandedSectionIds, setExpandedSectionIds] = useState(() => new Set());

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const sections = draft.sections ?? [];

    // ------------------------------------------------------------------------------------------------------------------------
    // Draft helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function updateSections(nextSections) {
        onChange({
            ...draft,
            sections: reindexPositions(nextSections),
        });
    }

    function updateSection(sectionIndex, updater) {
        const nextSections = sections.map((section, index) => {
            if (index !== sectionIndex) {
                return section;
            }

            return updater(section);
        });

        updateSections(nextSections);
    }

    function addSection() {
        const nextSection = createWorkoutSection(sections.length + 1);

        updateSections([
            ...sections,
            nextSection,
        ]);

        setExpandedSectionIds(current => {
            const next = new Set(current);
            next.add(getSectionKey(nextSection));
            return next;
        });
    }

    function deleteSection(sectionIndex) {
        const section = sections[sectionIndex];
        const confirmed = window.confirm(`Delete "${getSectionDisplayName(section)}"?`);

        if (!confirmed) {
            return;
        }

        updateSections(sections.filter((_, index) => index !== sectionIndex));
    }

    function moveSection(sectionIndex, direction) {
        const targetIndex = sectionIndex + direction;

        if (targetIndex < 0 || targetIndex >= sections.length) {
            return;
        }

        const nextSections = [...sections];
        const [section] = nextSections.splice(sectionIndex, 1);
        nextSections.splice(targetIndex, 0, section);

        updateSections(nextSections);
    }

    function toggleSection(section) {
        const key = getSectionKey(section);

        setExpandedSectionIds(current => {
            const next = new Set(current);

            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }

            return next;
        });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="center">
                <Stack gap={2}>
                    <Text fw={800}>Workout Structure</Text>
                    <Text size="sm" c="dimmed">
                        Organize this workout into sections. Exercises and stacks will be added inside each section.
                    </Text>
                </Stack>

                <Button leftSection={<IconPlus size={16}/>} onClick={addSection}>
                    Add Section
                </Button>
            </Group>

            {sections.length === 0 && (
                <Paper withBorder radius="md" p="xl" bg={computedColorScheme === 'light' ? "var(--color-background)" : "var(--color-surface)"}>
                    <Stack gap="sm" align="center">
                        <Text fw={700}>No sections yet</Text>
                        <Text size="sm" c="dimmed" ta="center">
                            Add a section to start building this workout.
                        </Text>
                        <Button leftSection={<IconPlus size={16}/>} onClick={addSection}>
                            Add Section
                        </Button>
                    </Stack>
                </Paper>
            )}

            <Stack gap="xs">
                {sections.map((section, sectionIndex) => (
                    <WorkoutSection
                        key={getSectionKey(section)}
                        section={section}
                        sectionIndex={sectionIndex}
                        sectionCount={sections.length}
                        expanded={expandedSectionIds.has(getSectionKey(section))}
                        onToggle={() => toggleSection(section)}
                        onMoveUp={() => moveSection(sectionIndex, -1)}
                        onMoveDown={() => moveSection(sectionIndex, 1)}
                        onDelete={() => deleteSection(sectionIndex)}
                        onChange={updates => updateSection(sectionIndex, currentSection => ({
                            ...currentSection,
                            ...updates,
                        }))}
                    />
                ))}
            </Stack>
        </Stack>
    );
}

function WorkoutSection({
                            section,
                            sectionIndex,
                            sectionCount,
                            expanded,
                            onToggle,
                            onMoveUp,
                            onMoveDown,
                            onDelete,
                            onChange,
                        }) {

    const isMobile = useMediaQuery('(max-width: 48em)');
    const computedColorScheme = useComputedColorScheme('light');
    const headerGradient = getGradient({ deg: 90, from: 'blue.8', to: 'violet.7' }, useMantineTheme());

    const itemCount = section.items?.length ?? 0;
    const sectionName = getSectionDisplayName(section);
    const sectionTypeLabel = getSectionTypeLabel(section.sectionType);

    return (
        <Box>
            <Paper
                withBorder
                radius="md"
                shadow="lg"
                style={{
                    overflow: 'hidden',
                }}
            >
                <Box
                    style={{
                        borderBottom: '1px solid var(--color-border)',
                        background: headerGradient,
                        color: 'white',
                    }}
                >
                    <Group justify="space-between" wrap="nowrap" px="md" py="sm">
                        <Group gap={6} wrap="nowrap" style={{minWidth: 0}}>
                            <IconGripVertical size={18} opacity={0.65}/>
                            <Tooltip label={expanded ? 'Collapse section settings' : 'Expand section settings'}>
                                <ActionIcon
                                    variant="subtle"
                                    color="black"
                                    onClick={onToggle}
                                >
                                    {expanded ? <IconChevronUp size={18} color="white"/> : <IconChevronDown size={18} color="white"/>}
                                </ActionIcon>
                            </Tooltip>

                            <Group gap="xs" wrap="nowrap" style={{minWidth: 0}}>
                                <Text fw={700} truncate>
                                    {sectionName}
                                </Text>

                                <Text opacity={0.65}>•</Text>

                                <Text size="sm" opacity={0.75} truncate>
                                    {sectionTypeLabel}
                                </Text>

                                <Badge size="xs" variant="light" color="gray">
                                    {itemCount} item{itemCount === 1 ? '' : 's'}
                                </Badge>
                            </Group>
                        </Group>

                        <Menu withinPortal position="bottom-end">
                            <Menu.Target>
                                <Tooltip label="Section options" position="top-end">
                                    <ActionIcon variant="subtle" color="black">
                                        <IconDotsVertical size={18} color="white"/>
                                    </ActionIcon>
                                </Tooltip>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconEdit size={14}/>}
                                    onClick={onToggle}
                                >
                                    Edit section
                                </Menu.Item>
                                <Menu.Divider/>
                                <Menu.Item
                                    disabled={sectionIndex === 0}
                                    onClick={onMoveUp}
                                >
                                    Move up
                                </Menu.Item>
                                <Menu.Item
                                    disabled={sectionIndex === sectionCount - 1}
                                    onClick={onMoveDown}
                                >
                                    Move down
                                </Menu.Item>
                                <Menu.Divider/>
                                <Menu.Item color="red" leftSection={<IconTrash size={14}/>} onClick={onDelete}>
                                    Delete section
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Box>

                <Collapse expanded={expanded}>
                    <Box style={{padding: 'var(--mantine-spacing-md)', paddingBottom: 0}}>
                        <Stack gap="md">
                            <Group grow align="flex-start">
                                <TextInput
                                    label="Section name"
                                    placeholder="Warm Up"
                                    value={section.name || ''}
                                    onChange={event => onChange({name: event.currentTarget.value})}
                                />

                                <Select
                                    label="Section type"
                                    data={WORKOUT_SECTION_TYPE_OPTIONS}
                                    value={section.sectionType || 'REGULAR'}
                                    onChange={value => onChange({sectionType: value || 'REGULAR'})}
                                    allowDeselect={false}
                                />
                            </Group>
                        </Stack>
                    </Box>
                </Collapse>

                <Box style={{padding: 'var(--mantine-spacing-md)', paddingBottom: 0}}>
                    <Textarea
                        classNames={{ input: 'subtleInput' }}
                        placeholder="Add instructions or notes for this section"
                        value={section.notes || ''}
                        onChange={event => onChange({notes: event.currentTarget.value})}
                        autosize
                        minRows={1}
                    />
                </Box>

                <Stack gap={0} p="md">
                    {itemCount === 0 && (
                        <Paper withBorder radius="md" p="lg" bg={computedColorScheme === 'light' ? "var(--color-background)" : "var(--color-surface)"}>
                            <Stack gap="sm" align="center">
                                <Text fw={700}>No exercises in this section</Text>
                                <Text size="sm" c="dimmed" ta="center">
                                    Add exercises or vertical stacks here next.
                                </Text>

                                <Group>
                                    <Button size={isMobile ? "xs" : "sm"} variant="light" leftSection={<IconPlus size={16}/>} disabled>
                                        Add Exercise
                                    </Button>
                                    <Button size={isMobile ? "xs" : "sm"} variant="light" leftSection={<IconPlus size={16}/>} disabled>
                                        Add Stack
                                    </Button>
                                </Group>
                            </Stack>
                        </Paper>
                    )}

                    {itemCount > 0 && (
                        <Stack gap="md">
                            <Text size="sm" c="dimmed">
                                TODO - render exercise and stack cards here.
                            </Text>
                        </Stack>
                    )}
                </Stack>
            </Paper>

            {sectionIndex < sectionCount - 1 && (
                <SectionSeparator/>
            )}
        </Box>
    );
}

function SectionSeparator() {
    return (
        <Group gap="xs" my="lg" wrap="nowrap">
            <Divider size={2} style={{flex: 1}}/>
                <Tooltip label="Section break">
                    <IconSeparatorHorizontal color="gray" size={20}/>
                </Tooltip>
            <Divider size={2} style={{flex: 1}}/>
        </Group>
    );
}

function getSectionKey(section) {
    return section.draftId || section.id;
}

function getSectionDisplayName(section) {
    return section.name?.trim() || ("Section " + section.position);
}

function getSectionTypeLabel(sectionType) {
    return WORKOUT_SECTION_TYPE_OPTIONS.find(option => option.value === sectionType)?.label || 'Regular';
}

export default WorkoutBuilder;