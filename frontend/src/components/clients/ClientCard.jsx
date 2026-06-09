import {
    Avatar,
    Badge,
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

function ClientCard({client, reviewStatus, onClick}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const fullName = `${client.firstName} ${client.lastName}`;
    const initials = `${client.firstName?.charAt(0) || ''}${client.lastName?.charAt(0) || ''}`.toUpperCase();
    const hasBadge = client.archived || reviewStatus === 'INTAKE' || reviewStatus === 'ASSESS';

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderReviewBadge() {
        if (client.archived) {
            return (
                <Badge color="gray" variant="light">
                    Archived
                </Badge>
            );
        }
        if (reviewStatus === 'INTAKE') {
            return (
                <Badge color="red" variant="light">
                    Intake
                </Badge>
            );
        }
        if (reviewStatus === 'ASSESS') {
            return (
                <Badge color="yellow" variant="light">
                    Assess
                </Badge>
            );
        }
        return (
            <Badge color="green" variant="light">
                Active
            </Badge>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Card
            className="client-card"
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
                            <Text fw={700} lineClamp={1}>
                                {fullName}
                            </Text>

                            {client.preferredName && (
                                <Text size="sm" c="dimmed" lineClamp={1}>
                                    ({client.preferredName})
                                </Text>
                            )}
                        </Stack>
                    </Group>

                    {renderReviewBadge()}
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