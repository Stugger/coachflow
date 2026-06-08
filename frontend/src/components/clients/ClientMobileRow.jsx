import {
    Avatar,
    Badge,
    Group,
    Table,
    Text
} from '@mantine/core';
import {
    IconMail,
    IconPhone,
    IconUser,
    IconChevronRight
} from '@tabler/icons-react';

function ClientMobileRow({client, reviewStatus, onClick}) {

    const lastInitial = client.lastName ? `${client.lastName.charAt(0)}.` : '';
    const fullName = `${client.firstName} ${lastInitial}`.trim();
    const initials = `${client.firstName?.charAt(0) || ''}${client.lastName?.charAt(0) || ''}`.toUpperCase();

    function renderReviewBadge() {
        if (client.archived) {
            return (
                <Badge size="xs" color="gray" variant="light">
                    Archived
                </Badge>
            );
        }
        if (reviewStatus === 'INTAKE') {
            return (
                <Badge size="xs" color="red" variant="light">
                    Intake
                </Badge>
            );
        }
        if (reviewStatus === 'ASSESS') {
            return (
                <Badge size="xs" color="yellow" variant="light">
                    Assess
                </Badge>
            );
        }
        return (
            <Badge size="xs" color="green" variant="light">
                Ready
            </Badge>
        );
    }

    return (
        <Table.Tr style={{cursor: 'pointer'}} onClick={onClick}>
            <Table.Td>
                <Group gap="sm" align="flex-start" wrap="nowrap">
                    <Avatar color="blue" radius="xl">
                        {initials || <IconUser size={18}/>}
                    </Avatar>

                    <div style={{flex: 1, minWidth: 0}}>
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Text fw={600} lineClamp={1}>
                                {fullName}
                            </Text>

                            <Group gap="xs" wrap="nowrap">
                                {renderReviewBadge()}
                                <IconChevronRight size={16}/>
                            </Group>
                        </Group>

                        {client.preferredName && (
                            <Text c="dimmed" size="sm" fw={500} mb={4} lineClamp={1}>
                                ({client.preferredName})
                            </Text>
                        )}

                        {client.phone && (
                            <Group gap={6} wrap="nowrap">
                                <IconPhone size={15} stroke={1.8}/>
                                <Text size="sm" c="dimmed" lineClamp={1}>
                                    {client.phone}
                                </Text>
                            </Group>
                        )}

                        {client.email && (
                            <Group gap={6} wrap="nowrap">
                                <IconMail size={15} stroke={1.8}/>
                                <Text size="sm" c="dimmed" lineClamp={1}>
                                    {client.email}
                                </Text>
                            </Group>
                        )}
                    </div>
                </Group>
            </Table.Td>
        </Table.Tr>
    );
}

export default ClientMobileRow;