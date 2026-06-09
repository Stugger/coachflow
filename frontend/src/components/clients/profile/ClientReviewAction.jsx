import {
    Button,
    Paper,
    Stack,
    Text,
    Group,
} from '@mantine/core';
import {
    IconAlertTriangle,
    IconClipboardCheck
} from '@tabler/icons-react';

function ClientReviewAction({client, reviewStatus, openIntake, openAssessment = null}) { //TODO pass in openAssessment and hook to button

    return (
        <>
            {reviewStatus === 'INTAKE' && (
                <Paper
                    withBorder
                    radius="md"
                    p="lg"
                    style={{
                        borderLeft: '6px solid var(--mantine-color-red-6)',
                    }}
                >
                    <Group justify="space-between" align="center" wrap="wrap">
                        <Stack gap={2}>
                            <Group gap={6}>
                                <IconAlertTriangle size={18} />
                                <Text fw={700}>
                                    Action Required
                                </Text>
                            </Group>
                            <Text size="sm" c="dimmed">
                                {client.firstName} has not completed their intake.
                            </Text>
                        </Stack>

                        <Button onClick={openIntake}>
                            Resume Intake
                        </Button>
                    </Group>
                </Paper>
            )}

            {reviewStatus === 'ASSESS' && (
                <Paper
                    withBorder
                    radius="md"
                    p="lg"
                    style={{
                        borderLeft: '6px solid var(--mantine-color-yellow-6)',
                    }}
                >
                    <Group justify="space-between" align="center" wrap="wrap">
                        <Stack gap={2}>
                            <Group gap={6}>
                                <IconClipboardCheck size={18} />
                                <Text fw={700}>
                                    Action Needed
                                </Text>
                            </Group>
                            <Text size="sm" c="dimmed">
                                {client.firstName} is ready for their initial assessment.
                            </Text>
                        </Stack>

                        <Button disabled>
                            Assessment Coming Soon
                        </Button>
                    </Group>
                </Paper>
            )}
        </>
    );
}

export default ClientReviewAction;