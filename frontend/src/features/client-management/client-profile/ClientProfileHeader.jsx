import {
    ActionIcon,
    Avatar,
    Button,
    Group,
    Menu,
    Paper,
    Stack,
    Text,
    Title,
    Tooltip,
} from '@mantine/core';
import {
    IconArchive,
    IconRestore,
    IconEdit,
    IconMail,
    IconPhone,
    IconUser,
    IconUserCog,
} from '@tabler/icons-react';

import ClientReviewBadge from '../shared/review/ClientReviewBadge.jsx';

function ClientProfileHeader({client, onEditDetails, onArchiveClient}) {

    const fullName = `${client.firstName} ${client.lastName}`;
    const initials = `${client.firstName?.charAt(0) || ''}${client.lastName?.charAt(0) || ''}`.toUpperCase();

    function renderContactInfo() {
        return (
            <>
                {/* Desktop Contact Info */}
                <Group gap="md" visibleFrom="sm">
                    <Group gap={6} wrap="nowrap">
                        <IconPhone size={16} stroke={1.8}/>
                        <Text size="sm" c="dimmed">
                            {client.phone || 'No phone'}
                        </Text>
                    </Group>

                    <Group gap={6} wrap="nowrap">
                        <IconMail size={16} stroke={1.8}/>
                        <Text size="sm" c="dimmed">
                            {client.email || 'No email'}
                        </Text>
                    </Group>
                </Group>

                {/* Mobile Contact Info */}
                <Stack gap={2} hiddenFrom="sm">
                    <Group gap={6} wrap="nowrap">
                        <IconPhone size={16} stroke={1.8}/>
                        <Text size="sm" c="dimmed">
                            {client.phone || 'No phone'}
                        </Text>
                    </Group>

                    <Group gap={6} wrap="nowrap">
                        <IconMail size={16} stroke={1.8}/>
                        <Text size="sm" c="dimmed">
                            {client.email || 'No email'}
                        </Text>
                    </Group>
                </Stack>
            </>
        );
    }

    return (
        <Paper
            withBorder
            radius="md"
            p="lg"
            pt="xl"
            pos="relative"
            style={{ overflow: 'hidden' }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1rem',
                    background: (client.archived ? 'var(--mantine-color-gray-6)' : 'var(--mantine-primary-color-filled)'),
                }}
            />
            <Menu shadow="md" width={180} position="bottom-end">
                <Menu.Target>
                    <Tooltip label="Options" position="top-end">
                        <ActionIcon
                            variant="default"
                            size="lg"
                            style={{
                                position: 'absolute',
                                top: '1.75rem',
                                right: '0.75rem',
                                zIndex: 1,
                            }}
                        >
                            <IconUserCog size={20} stroke={1.6}/>
                        </ActionIcon>
                    </Tooltip>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={<IconEdit size={16}/>}
                        onClick={onEditDetails}
                    >
                        Edit Details
                    </Menu.Item>

                    <Menu.Divider/>

                    {client.archived ? (
                        <Menu.Item
                            leftSection={<IconRestore size={16}/>}
                            onClick={onArchiveClient}
                        >
                            Restore Client
                        </Menu.Item>
                    ) : (
                        <Menu.Item
                            color="red"
                            leftSection={<IconArchive size={16}/>}
                            onClick={onArchiveClient}
                        >
                            Archive Client
                        </Menu.Item>
                    )}
                </Menu.Dropdown>
            </Menu>
            <Group gap="md" align="flex-start" wrap="nowrap" pr="xl">
                <Avatar size={64} radius="xl" color="blue">
                    {initials || <IconUser size={26}/>}
                </Avatar>

                <Stack gap={6}>
                    <Group gap="xs" align="center">
                        <Title order={3}>
                            {fullName}
                        </Title>

                        <ClientReviewBadge client={client}/>
                    </Group>

                    {client.preferredName && (
                        <Text size="sm" c="dimmed">
                            Prefers {client.preferredName}
                        </Text>
                    )}

                    {renderContactInfo()}
                </Stack>
            </Group>
        </Paper>
    );
}

export default ClientProfileHeader;