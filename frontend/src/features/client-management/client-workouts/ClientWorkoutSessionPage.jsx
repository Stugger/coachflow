import {useEffect, useState} from 'react';
import {useScreenWakeLock} from '../../../hooks/useScreenWakeLock.js';
import {useIsSmallScreen} from '../../../hooks/useIsSmallScreen.js';
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
import {IconLogout2} from '@tabler/icons-react';

import {ROUTES} from '../../../constants/routes.js';
import {apiGetClientWorkoutSession} from './client-workout-api.js';
import {getClientWorkoutOriginLabel} from './client-workout-constants.js';
import {getClientWorkoutSourceNavigation} from './client-workout-navigation.js';

import ClientWorkoutSessionOverview from './ClientWorkoutSessionOverview.jsx';
import ClientWorkoutSessionItemView from './ClientWorkoutSessionItemView.jsx';


function isSameSetResult(result, identity) {
    return result.setKey === identity.setKey
        && result.clientWorkoutItemId === identity.clientWorkoutItemId
        && result.clientWorkoutItemExerciseId === identity.clientWorkoutItemExerciseId;
}

function ClientWorkoutSessionPage() {

    const navigate = useNavigate();
    const location = useLocation();
    const {clientWorkoutId, itemId} = useParams();
    const isSmallScreen = useIsSmallScreen();

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

    function handleResultSaved(savedResult, identity) {
        setSession(currentSession => {
            if (!currentSession) {
                return currentSession;
            }

            const nextResults = (currentSession.results ?? []).filter(result => !isSameSetResult(result, identity));

            if (savedResult) {
                nextResults.push(savedResult);
            }

            return {
                ...currentSession,
                results: nextResults,
            };
        });
    }

    const originLabel = getClientWorkoutOriginLabel(workout.origin);

    return (
        <Box mih="100dvh" bg={isSmallScreen ? "var(--mantine-color-body)" : "var(--color-background)"}>
            <Container
                size="sm"
                mih="100dvh"
                px={{base: 'xs', sm: 'md'}}
                py={{base: 'xs', sm: 'sm'}}
            >
                <Paper
                    withBorder={!isSmallScreen}
                    p={isSmallScreen ? undefined : "1rem 2rem 2rem 2rem"}
                >
                    <Stack gap="md">
                        {!itemId && (
                            <>
                                <Button
                                    variant="subtle"
                                    w="fit-content"
                                    pl={{base: 'xs', sm: 0}}
                                    pr='xs'
                                    leftSection={<IconLogout2 size={16}/>}
                                    onClick={returnToSource}
                                >
                                    Exit Workout
                                </Button>

                                <Paper
                                    radius={0}
                                    style={{ borderBottom: '1px solid var(--color-border)'}}
                                    pb="xs"
                                >
                                    <Stack gap="xs" px={{base: 'xs', sm: 0}}>
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
                            </>
                        )}

                        {itemId ? (
                            <ClientWorkoutSessionItemView
                                workout={workout}
                                results={results}
                                itemId={itemId}
                                onExitWorkout={returnToSource}
                                onResultSaved={handleResultSaved}
                            />
                        ) : (
                            <ClientWorkoutSessionOverview
                                workout={workout}
                                results={results}
                                onOpenItem={openItem}
                            />
                        )}
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

export default ClientWorkoutSessionPage;