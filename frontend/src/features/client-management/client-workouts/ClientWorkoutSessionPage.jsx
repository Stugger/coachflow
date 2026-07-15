import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Alert,
    Badge,
    Button,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
} from '@mantine/core';

import {ROUTES} from '../../../constants/routes.js';
import {apiGetClientWorkout} from './client-workout-api.js';
import {getClientWorkoutOriginLabel} from "./client-workout-constants.js";

function ClientWorkoutSessionPage() {
    const navigate = useNavigate();
    const {clientWorkoutId} = useParams();

    const [workout, setWorkout] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoaded(false);
        setError('');

        apiGetClientWorkout(clientWorkoutId)
            .then(setWorkout)
            .catch(error => {
                console.error('Failed to load client workout:', error);
                setError(
                    error.message || 'Failed to load the workout session.'
                );
            })
            .finally(() => {
                setLoaded(true);
            });
    }, [clientWorkoutId]);

    if (!loaded) {
        return (
            <Group gap="sm">
                <Loader size="sm"/>
                <Text size="sm" c="dimmed">
                    Loading workout session…
                </Text>
            </Group>
        );
    }

    if (error || !workout) {
        return (
            <Alert color="red">
                {error || 'Workout session not found.'}
            </Alert>
        );
    }

    const originLabel = getClientWorkoutOriginLabel(workout.origin) ?? 'Client Workout';

    return (
        <Stack gap="md">
            <Button
                variant="subtle"
                w="fit-content"
                onClick={() => navigate(
                    ROUTES.clientProfile(workout.clientId)
                )}
            >
                ← Back to client
            </Button>

            <Paper withBorder radius="md" p="lg">
                <Stack gap="xs">
                    <Group gap="sm">
                        <Badge
                            color={workout.status === 'IN_PROGRESS' ? 'green' : 'gray'}
                            variant="light"
                            leftSection={
                                workout.status === 'IN_PROGRESS'
                                    ? (
                                        <span
                                            className="client-session-live-dot"
                                        />
                                    )
                                    : null
                            }
                        >
                            {workout.status === 'IN_PROGRESS' ? 'In progress' : workout.status}
                        </Badge>

                        <Text size="sm" c="dimmed">
                            {originLabel}
                        </Text>
                    </Group>

                    <Title order={2}>
                        {workout.name}
                    </Title>

                    {workout.description?.trim() && (
                        <Text c="dimmed">
                            {workout.description}
                        </Text>
                    )}
                </Stack>
            </Paper>

            <Alert color="blue">
                Live result entry and session-aware workout editing will be
                added in the next implementation slices.
            </Alert>
        </Stack>
    );
}

export default ClientWorkoutSessionPage;