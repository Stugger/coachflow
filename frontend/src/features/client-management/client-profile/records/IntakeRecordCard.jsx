import {useState} from 'react'
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
    IconEyeOff,
    IconPlayerPlay,
} from '@tabler/icons-react';

import IntakeReview from './IntakeReview';

function IntakeRecordCard({intake, client, loaded, error, onOpen, onEditClientDetails}) {

    const [intakeShown, setIntakeShown] = useState(false);

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
                {completed ? (
                    <Button
                        variant={'default'}
                        leftSection={intakeShown ? <IconEyeOff size={16}/> : <IconEye size={16}/>}
                        onClick={() => setIntakeShown(!intakeShown)}
                    >
                        {intakeShown ? 'Hide Intake' : 'Show Intake'}
                    </Button>
                ) : (
                    <Button
                        variant={'filled'}
                        leftSection={ <IconPlayerPlay size={16}/>}
                        onClick={() => onOpen(intake.id)}
                    >
                        Resume Intake
                    </Button>
                )}
            </Group>

            {intakeShown && (
                <IntakeReview
                    intake={intake}
                    client={client}
                    onEditBasicInfo={onEditClientDetails}
                />
            )}
        </Stack>
    );
}

export default IntakeRecordCard;