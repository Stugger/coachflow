import {
    ActionIcon,
    Menu,
    Table,
    Text,
    Tooltip,
} from '@mantine/core';

import {useMediaQuery} from '@mantine/hooks';

import {
    IconCopy,
    IconDotsVertical,
    IconEdit,
    IconTrash,
} from '@tabler/icons-react';

// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

function formatUpdatedAt(value) {
    if (!value) {
        return '—';
    }

    const updatedAt = new Date(value);
    const timestamp = updatedAt.getTime();

    if (Number.isNaN(timestamp)) {
        return '—';
    }

    const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - timestamp) / 1000),
    );

    if (elapsedSeconds < 60) {
        return 'Just now';
    }

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    if (elapsedMinutes < 60) {
        return `${elapsedMinutes}m ago`;
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);

    if (elapsedHours < 24) {
        return `${elapsedHours}h ago`;
    }

    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedDays < 7) {
        return `${elapsedDays}d ago`;
    }

    return updatedAt.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: updatedAt.getFullYear() === new Date().getFullYear()
            ? undefined
            : 'numeric',
    });
}

function getExercisePreview(exerciseNames) {
    if (!exerciseNames?.length) {
        return 'No exercises added yet';
    }

    return exerciseNames.join(' / ');
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

function WorkoutTemplateListRow({template, onSelect, onEdit, onCopy, onArchive}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isMobile = useMediaQuery('(max-width: 48em)');

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const exercisePreview = getExercisePreview(template.exerciseNames);
    const updatedLabel = formatUpdatedAt(template.updatedAt);

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Table.Tr
            onClick={onSelect}
            style={{cursor: 'pointer'}}
        >
            <Table.Td>
                <Text fw={700} lineClamp={1}>
                    {template.name || 'Unnamed workout'}
                </Text>

                <Text
                    size="sm"
                    c="dimmed"
                    lineClamp={isMobile ? 3 : 4}
                    mt={4}
                >
                    {exercisePreview}
                </Text>

                <Text
                    size="xs"
                    c="dimmed"
                    mt={6}
                    style={{
                        display: isMobile ? 'block' : 'none',
                    }}
                >
                    {template.exerciseCount} exercise{template.exerciseCount === 1 ? '' : 's'} · {updatedLabel}
                </Text>
            </Table.Td>

            <Table.Td style={{textAlign: 'center', display: isMobile ? 'none' : undefined}}>
                <Text size="sm">
                    {template.exerciseCount} exercise{template.exerciseCount === 1 ? '' : 's'}
                </Text>
            </Table.Td>

            <Table.Td style={{textAlign: 'center', display: isMobile ? 'none' : undefined}}>
                <Text size="sm" c="dimmed">
                    {updatedLabel}
                </Text>
            </Table.Td>

            <Table.Td>
                <Menu withinPortal position="bottom-end">
                    <Menu.Target>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={event => event.stopPropagation()}
                        >
                            <Tooltip label="Options" position="top-end">
                                <IconDotsVertical size={18}/>
                            </Tooltip>
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconEdit size={14}/>}
                            onClick={event => {
                                event.stopPropagation();
                                onEdit();
                            }}
                        >
                            Edit
                        </Menu.Item>

                        <Menu.Item
                            leftSection={<IconCopy size={14}/>}
                            onClick={event => {
                                event.stopPropagation();
                                onCopy();
                            }}
                        >
                            Copy
                        </Menu.Item>

                        <Menu.Divider/>

                        <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={14}/>}
                            onClick={event => {
                                event.stopPropagation();
                                onArchive();
                            }}
                        >
                            Archive
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Table.Td>
        </Table.Tr>
    );
}

export default WorkoutTemplateListRow;