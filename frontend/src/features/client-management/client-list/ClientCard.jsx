import {
    Avatar,
    Card,
    Group,
    Stack,
    Text
} from '@mantine/core';
import {
    IconMail,
    IconPhone,
    IconUser
} from '@tabler/icons-react';

import ClientReviewBadge from '../shared/review/ClientReviewBadge.jsx';

function ClientCard({client, onClick}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const initials = `${client.firstName?.charAt(0) || ''}${client.lastName?.charAt(0) || ''}`.toUpperCase();

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Card
            className="interactive-card"
            withBorder
            shadow="sm"
            radius="md"
            padding="md"
            onClick={onClick}
            style={{
                cursor: 'pointer',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '0.5rem',
                    background: (client.archived ? 'var(--mantine-color-gray-6)' : 'var(--mantine-primary-color-filled)'),
                }}
            />
            <Stack gap="sm" pt="0.3rem">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                        <Avatar color="blue" radius="xl">
                            {initials || <IconUser size={18}/>}
                        </Avatar>

                        <Stack
                            gap={0}
                            style={{
                                flex: 1,
                                minWidth: 0,
                            }}
                        >
                            <Group gap={4} wrap="nowrap" style={{minWidth: 0}}>
                                <Text fw={700} style={{flexShrink: 0}}>
                                    {client.firstName}
                                </Text>

                                <Text
                                    fw={700}
                                    truncate="end"
                                    style={{
                                        minWidth: 0,
                                        flex: 1,
                                    }}
                                >
                                    {client.lastName}
                                </Text>
                            </Group>

                            {client.preferredName && (
                                <Text size="sm" c="dimmed" lineClamp={1}>
                                    ({client.preferredName})
                                </Text>
                            )}
                        </Stack>
                    </Group>

                    <ClientReviewBadge client={client}/>
                </Group>

                <Stack gap={4}>
                    <Group gap={6} wrap="nowrap">
                        <IconPhone size={15} stroke={1.8}/>
                        <Text size="sm" c="dimmed" lineClamp={1}>
                            {client.phone || 'No phone'}
                        </Text>
                    </Group>

                    <Group gap={6} wrap="nowrap">
                        <IconMail size={15} stroke={1.8}/>
                        <Text size="sm" c="dimmed" lineClamp={1}>
                            {client.email || 'No email'}
                        </Text>
                    </Group>
                </Stack>
            </Stack>
        </Card>
    );
}

export default ClientCard;