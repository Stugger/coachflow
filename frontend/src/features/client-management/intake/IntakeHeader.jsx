import {
    Title,
    Progress,
    Group,
    Stack,
    Text,
    ActionIcon,
    Divider,
} from '@mantine/core';
import {
    IconX
} from '@tabler/icons-react';
import {TOTAL_STEPS} from './intake-constants.js';

function IntakeHeader({step, stepNumber, exitIntake, isReviewEditing = false}) {
    return (
        <Stack gap="xs" mb="xs">
            <Group justify="space-between">
                <Title order={3}>
                    {isReviewEditing
                        ? 'Edit Client Intake'
                        : 'New Client Intake'}
                </Title>

                <ActionIcon
                    variant="default"
                    size="lg"
                    onClick={exitIntake}
                >
                    <IconX size={18} stroke={1.5}/>
                </ActionIcon>
            </Group>

            {isReviewEditing ? (
                <Text size="xs" c="dimmed">
                    Update this section, then return to the client record.
                </Text>
            ) : (
                <>
                    <Text size="xs" c="dimmed">
                        Step {stepNumber} of {TOTAL_STEPS}
                    </Text>
                    <Progress value={(stepNumber / TOTAL_STEPS) * 100}/>
                </>
            )}

            <Divider my={isReviewEditing ? 0 : "xs"} size="sm" label={step} labelPosition="center"/>
        </Stack>
    );
}

export default IntakeHeader;