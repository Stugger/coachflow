import {ActionIcon, Badge, Group, Menu, Paper, Stack, Text} from '@mantine/core';
import {IconDotsVertical, IconEdit, IconCopy, IconTrash} from '@tabler/icons-react';

function WorkoutTemplateListRow({template, onSelect, onEdit, onCopy, onArchive}) {

    const sectionCount = template.sections?.length ?? 0;
    const itemCount = (template.sections ?? []).reduce((total, section) => total + (section.items?.length ?? 0), 0);

    return (
        <Paper
            withBorder
            radius="md"
            p="sm"
            onClick={onSelect}
            style={{
                cursor: 'pointer',
            }}
        >
            <Group justify="space-between" wrap="nowrap" align="center">
                <Stack gap={2} style={{minWidth: 0}}>
                    <Group gap="xs" wrap="nowrap">
                        <Text fw={700} truncate>{template.name}</Text>
                        <Badge size="xs" variant="light">Workout</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                        {sectionCount} section{sectionCount === 1 ? '' : 's'} • {itemCount} item{itemCount === 1 ? '' : 's'}
                    </Text>
                    {template.description && (
                        <Text size="xs" c="dimmed" lineClamp={1}>{template.description}</Text>
                    )}
                </Stack>

                <Menu withinPortal position="bottom-end">
                    <Menu.Target>
                        <ActionIcon variant="subtle" onClick={event => event.stopPropagation()}>
                            <IconDotsVertical size={16}/>
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEdit size={14}/>} onClick={onEdit}>Edit</Menu.Item>
                        <Menu.Item leftSection={<IconCopy size={14}/>} onClick={onCopy}>Copy</Menu.Item>
                        <Menu.Divider/>
                        <Menu.Item color="red" leftSection={<IconTrash size={14}/>} onClick={onArchive}>Archive</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Paper>
    );
}

export default WorkoutTemplateListRow;
