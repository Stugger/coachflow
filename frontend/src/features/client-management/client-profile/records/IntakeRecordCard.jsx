import {
    Alert,
    Button,
    Group,
    Loader,
    Stack,
    Text,
} from '@mantine/core';
import {
    IconEye,
    IconPlayerPlay,
} from '@tabler/icons-react';

function IntakeRecordCard({intake, loaded, error, onOpen}) {

    if (!loaded) {
        return (
            <Group gap="sm">
                <Loader size="sm"/>
                <Text size="sm" c="dimmed">
                    Loading intake record…
                </Text>
            </Group>
        );
    }

    if (error) {
        return (
            <Alert color="red">
                {error}
            </Alert>
        );
    }

    if (!intake) {
        return (
            <Text size="sm" c="dimmed">
                No intake record is available for this client.
            </Text>
        );
    }

    const completed = intake.status === 'COMPLETED';

    return (
        <Stack gap="sm">
            <Group justify="space-between">
                <Text size="sm" c="dimmed">
                    {completed
                        ? 'The client intake has been completed.'
                        : 'The client intake is still in progress.'
                    }
                </Text>
            </Group>

            <Group>
                <Button
                    variant={completed ? 'default' : 'filled'}
                    leftSection={completed
                        ? <IconEye size={16}/>
                        : <IconPlayerPlay size={16}/>
                    }
                    onClick={() => onOpen(intake.id)}
                >
                    {completed ? 'Review Intake' : 'Resume Intake'}
                </Button>
            </Group>
        </Stack>
    );
}

export default IntakeRecordCard;