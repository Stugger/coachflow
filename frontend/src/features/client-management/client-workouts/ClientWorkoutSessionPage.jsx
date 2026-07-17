import {useEffect, useState} from 'react';
import {
    useLocation,
    useNavigate,
    useParams,
} from 'react-router-dom';
import {
    Alert,
    Badge,
    Box,
    Button,
    Container,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import {IconArrowLeft} from '@tabler/icons-react';

import {ROUTES} from '../../../constants/routes.js';
import {apiGetClientWorkoutSession} from './client-workout-api.js';
import {getClientWorkoutOriginLabel} from './client-workout-constants.js';
import {getClientWorkoutSourceNavigation} from './client-workout-navigation.js';
import {useScreenWakeLock} from '../../../hooks/useScreenWakeLock.js';

import ClientWorkoutSessionOverview from './ClientWorkoutSessionOverview.jsx';
import ClientWorkoutSessionItemView from './ClientWorkoutSessionItemView.jsx';

function ClientWorkoutSessionPage() {

    const navigate = useNavigate();
    const location = useLocation();
    const {clientWorkoutId, itemId} = useParams();

    const [session, setSession] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState('');

    const workout = session?.workout;
    const results = session?.results ?? [];

    useScreenWakeLock(workout?.status === 'IN_PROGRESS');

    useEffect(() => {
        setLoaded(false);
        setError('');

        apiGetClientWorkoutSession(clientWorkoutId)
            .then(setSession)
            .catch(error => {
                console.error('Failed to load client workout session:', error);
                setError(
                    error.message || 'Failed to load the workout session.'
                );
            })
            .finally(() => {
                setLoaded(true);
            });
    }, [clientWorkoutId]);

    function returnToSource() {
        if (!workout) {
            return;
        }

        const sourceNavigation =
            location.state?.sourceNavigation
            ?? getClientWorkoutSourceNavigation(
                workout.clientId,
                workout,
            );

        navigate(
            sourceNavigation?.to
            ?? ROUTES.clientProfile(workout.clientId),
            {
                replace: true,
                state: sourceNavigation?.state ?? null,
            },
        );
    }

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

    function openItem(nextItemId) {
        navigate(`${ROUTES.clientWorkoutSessionItem(workout.id, nextItemId)}${location.search}`, {
            state: location.state,
        });
    }

    const originLabel = getClientWorkoutOriginLabel(workout.origin);

    return (
        <Box
            mih="100dvh"
            bg="var(--mantine-color-body)"
            py={{base: 'sm', sm: 'lg'}}
        >
            <Container
                fluid
                px={{base: 'sm', sm: 'lg'}}
            >
                <Stack gap="md">
                    <Button
                        variant="subtle"
                        w="fit-content"
                        leftSection={<IconArrowLeft size={16}/>}
                        onClick={returnToSource}
                    >
                        Exit Workout
                    </Button>

                    <Paper withBorder radius="md" p="lg">
                        <Stack gap="xs">
                            <Group gap="sm">
                                <Badge
                                    color={
                                        workout.status === 'IN_PROGRESS'
                                            ? 'green'
                                            : 'gray'
                                    }
                                    variant="light"
                                    leftSection={
                                        workout.status === 'IN_PROGRESS'
                                            ? <span className={'client-session-live-dot'}/>
                                            : null
                                    }
                                >
                                    {workout.status === 'IN_PROGRESS'
                                        ? 'In progress'
                                        : workout.status}
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

                    {itemId ? (
                        <ClientWorkoutSessionItemView
                            workout={workout}
                            results={results}
                            itemId={itemId}
                        />
                    ): (
                        <ClientWorkoutSessionOverview
                            workout={workout}
                            results={results}
                            onOpenItem={openItem}
                        />
                    )}
                </Stack>
            </Container>
        </Box>
    );
}

export default ClientWorkoutSessionPage;