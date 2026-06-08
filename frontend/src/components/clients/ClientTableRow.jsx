import {
    Avatar,
    Badge,
    Group,
    Table,
    Text
} from '@mantine/core';
import {
    IconUser,
    IconChevronRight
} from '@tabler/icons-react';

function ClientTableRow({client, reviewStatus, onClick}) {

    const fullName = `${client.firstName} ${client.lastName}`;
    const initials = `${client.firstName?.charAt(0) || ''}${client.lastName?.charAt(0) || ''}`.toUpperCase();

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

    return (
        <Table.Tr
            style={{cursor: 'pointer'}}
            onClick={onClick}
        >
            <Table.Td>
                <Group gap="sm" wrap="nowrap">
                    <Avatar color="blue" radius="xl">
                        {initials || <IconUser size={18}/>}
                    </Avatar>

                    <div>
                        <Text fz="sm" fw={600}>
                            {fullName}
                        </Text>

                        {client.preferredName && (
                            <Text size="xs" c="dimmed">
                                Prefers {client.preferredName}
                            </Text>
                        )}
                    </div>
                </Group>
            </Table.Td>

            <Table.Td>
                {renderReviewBadge()}
            </Table.Td>

            <Table.Td>
                <Text size="sm" c="dimmed">
                    {client.phone || '—'}
                </Text>
            </Table.Td>

            <Table.Td>
                <Text size="sm" c="dimmed">
                    {client.email || '—'}
                </Text>
            </Table.Td>
            <Table.Td ta="right">
                <IconChevronRight size={16} />
            </Table.Td>
        </Table.Tr>
    );
}

export default ClientTableRow;