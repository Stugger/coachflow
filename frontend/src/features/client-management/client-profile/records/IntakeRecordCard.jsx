import {useEffect, useState} from 'react'
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

import {formatDisplayLongDate} from "../../../../utils/time-utils.js";

function IntakeRecordCard({intake, client, loaded, error, onOpen, onEditClientDetails, onEditIntakeSection, showIntakeReview = false}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [intakeShown, setIntakeShown] = useState(showIntakeReview);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (showIntakeReview) {
            setIntakeShown(true);
        }
    }, [showIntakeReview]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Conditional return
    // ------------------------------------------------------------------------------------------------------------------------

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

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    const completed = intake.status === 'COMPLETED';

    return (
        <Stack gap="sm">
            <Group justify="space-between">
                <Text size="sm" c="dimmed">
                    {completed
                        ? intake.completedAt
                            ? `${client.firstName}'s intake was completed on ${formatDisplayLongDate(intake.completedAt)}.`
                            : `${client.firstName}'s intake has been completed.`
                        : `${client.firstName}'s intake is still in progress.`
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
                    onEditSection={step => onEditIntakeSection?.(intake.id, step)}
                />
            )}
        </Stack>
    );
}

export default IntakeRecordCard;