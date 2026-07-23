import {useEffect, useLayoutEffect, useState} from 'react';
import {useLocation, useNavigate, useParams,} from 'react-router-dom';
import {useScreenWakeLock} from '../../../../hooks/useScreenWakeLock.js';
import {useIsSmallScreen} from '../../../../hooks/useIsSmallScreen.js';
import {
    ActionIcon,
    Alert,
    Badge,
    Box,
    Button,
    Container,
    Group,
    Loader,
    Menu,
    Modal,
    Paper,
    Stack,
    Text,
    Title,
    useMantineColorScheme,
} from '@mantine/core';
import {
    IconCheck,
    IconDotsVertical,
    IconEdit,
    IconLogout2,
    IconMoon,
    IconSun,
    IconTrash,
} from '@tabler/icons-react';

import {ROUTES} from '../../../../constants/routes.js';
import {
    INITIAL_ASSESSMENT_BUILDER_MODE,
    INITIAL_ASSESSMENT_BUILDER_QUERY_PARAM,
} from '../../initial-assessment/initial-assessment-builder-route-state.js';
import {
    apiAbandonClientWorkout,
    apiCompleteClientWorkout,
    apiGetClientWorkoutSession,
} from '../client-workout-api.js';
import {getClientWorkoutOriginLabel} from '../client-workout-constants.js';
import {getClientWorkoutSourceNavigation} from '../client-workout-navigation.js';

import ClientWorkoutSessionOverview from './overview/ClientWorkoutSessionOverview.jsx';
import ClientWorkoutSessionItemView from './item/ClientWorkoutSessionItemView.jsx';
import {ClientWorkoutLiveDurationBadge} from "./shared/ClientWorkoutSessionTiming.jsx";

function isSameSetResult(result, identity) {
    return result.setKey === identity.setKey
        && result.clientWorkoutItemId === identity.clientWorkoutItemId
        && result.clientWorkoutItemExerciseId === identity.clientWorkoutItemExerciseId;
}

function ClientWorkoutSessionPage() {

    // ------------------------------------------------------------------------------------------------------------------------
    // Layout state
    // ------------------------------------------------------------------------------------------------------------------------

    const {colorScheme, toggleColorScheme} = useMantineColorScheme();

    const isSmallScreen = useIsSmallScreen();

    // ------------------------------------------------------------------------------------------------------------------------
    // Router state
    // ------------------------------------------------------------------------------------------------------------------------

    const navigate = useNavigate();
    const location = useLocation();
    const {clientWorkoutId, itemId} = useParams();

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [session, setSession] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState('');

    const workout = session?.workout;
    const results = session?.results ?? [];
    const benchmarks = session?.benchmarks ?? [];

    const recordMode = workout?.status === 'COMPLETED';

    const [completionSummary, setCompletionSummary] = useState(null);
    const [completingWorkout, setCompletingWorkout] = useState(false);
    const [completionError, setCompletionError] = useState('');

    const [abandonConfirmationOpen, setAbandonConfirmationOpen] = useState(false);
    const [abandoningWorkout, setAbandoningWorkout] = useState(false);
    const [abandonError, setAbandonError] = useState('');

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects & hooks
    // ------------------------------------------------------------------------------------------------------------------------

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

    useLayoutEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto',
        });
    }, [clientWorkoutId, itemId]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function returnToSource() {
        if (!workout) {
            navigate(ROUTES.CLIENTS)
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

    function editWorkout() {
        if (!workout || workout.status !== 'IN_PROGRESS') {
            return;
        }

        const params = new URLSearchParams({
            [INITIAL_ASSESSMENT_BUILDER_QUERY_PARAM.MODE]: INITIAL_ASSESSMENT_BUILDER_MODE.EDIT,
            [INITIAL_ASSESSMENT_BUILDER_QUERY_PARAM.CLIENT_WORKOUT_ID]: String(workout.id),
        });

        const sourceNavigation = location.state?.sourceNavigation ?? getClientWorkoutSourceNavigation(workout.clientId, workout);

        navigate(
            `${ROUTES.clientProfile(workout.clientId)}?${params.toString()}`,
            {
                state: {
                    sourceNavigation,
                },
            },
        );
    }

    function openItem(nextItemId) {
        navigate(`${ROUTES.clientWorkoutSessionItem(workout.id, nextItemId)}${location.search}`,
            {
                state: {
                    ...(location.state ?? {}),
                    sessionOverviewItemId: nextItemId,
                },
            },
        );
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

    function requestWorkoutCompletion(summary) {
        setCompletionError('');
        setCompletionSummary(summary);
    }

    function closeCompletionConfirmation() {
        if (completingWorkout) {
            return;
        }

        setCompletionError('');
        setCompletionSummary(null);
    }

    async function completeWorkout() {
        if (!workout || workout.status !== 'IN_PROGRESS') {
            return;
        }

        setCompletingWorkout(true);
        setCompletionError('');

        try {
            const completedWorkout = await apiCompleteClientWorkout(workout.id);

            setSession(currentSession =>
                currentSession
                    ? {...currentSession, workout: completedWorkout}
                    : currentSession
            );

            setCompletionSummary(null);

            navigate(
                ROUTES.clientWorkoutSession(workout.id),
                {
                    replace: true,
                    state: {
                        ...(location.state ?? {}),
                        sessionOverviewItemId: null,
                    },
                },
            );

            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        } catch (error) {
            console.error('Failed to complete client workout:', error);

            setCompletionError(error.message || 'Failed to complete the workout.');
        } finally {
            setCompletingWorkout(false);
        }
    }

    function openAbandonConfirmation() {
        setAbandonError('');
        setAbandonConfirmationOpen(true);
    }

    async function abandonWorkout() {
        if (!workout || workout.status !== 'IN_PROGRESS') {
            return;
        }

        setAbandoningWorkout(true);
        setAbandonError('');

        try {
            await apiAbandonClientWorkout(workout.id);

            setAbandonConfirmationOpen(false);
            returnToSource();
        } catch (error) {
            console.error('Failed to abandon client workout:', error);

            setAbandonError(error.message || 'Failed to abandon the workout.');
        } finally {
            setAbandoningWorkout(false);
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Conditional return
    // ------------------------------------------------------------------------------------------------------------------------

    if (!loaded) {
        return (
            <Box mih="100dvh" bg={isSmallScreen ? "var(--mantine-color-body)" : "var(--color-background)"}>
                <Container
                    size="sm"
                    mih="100dvh"
                    px={{base: 'xs', sm: 'md'}}
                    py={{base: 'xs', sm: 'sm'}}
                >
                    <Group
                        gap="sm"
                        px={{base: 'xs', sm: 'md'}}
                        py={{base: 'xs', sm: 'sm'}}
                    >
                        <Loader size="sm"/>
                        <Text size="sm" c="dimmed">
                            Loading workout session…
                        </Text>
                    </Group>
                </Container>
            </Box>
        );
    }

    if (error || !workout) {
        return (
            <Stack gap="sm" px="md" py="md">
                <Alert color="red">
                    {error || 'Workout session not found.'}
                    <Button
                        fullWidth
                        size="md"
                        variant="default"
                        mt="lg"
                        leftSection={<IconLogout2 size={16}/>}
                        onClick={returnToSource}
                    >
                        Exit page
                    </Button>
                </Alert>
            </Stack>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render utils
    // ------------------------------------------------------------------------------------------------------------------------

    function renderCompleteWorkoutConfirmationModal() {
        if (completionSummary === null) {
            return null;
        }
        return (
            <Modal
                opened
                onClose={closeCompletionConfirmation}
                title={completionSummary?.fullyCompleted ? 'Complete workout?' : 'Complete unfinished workout?'}
                centered={isSmallScreen}
                yOffset={isSmallScreen ? undefined : "30vh"}
                closeOnClickOutside={!completingWorkout}
                closeOnEscape={!completingWorkout}
                withCloseButton={!completingWorkout}
            >
                <Stack gap="lg">
                    {completionError && (
                        <Alert color="red">
                            {completionError}
                        </Alert>
                    )}

                    {completionSummary?.fullyCompleted ? (
                        <Text size="sm" c="dimmed">
                            This workout will be finalized as a client record.
                        </Text>
                    ) : (
                        <Text size="sm" c="dimmed">
                            {completionSummary?.remainingSetCount}{' '}
                            {completionSummary?.remainingSetCount === 1
                                ? 'set has'
                                : 'sets have'
                            } not been completed.<br/><br/>Saved values and notes will be
                            preserved, while untouched sets will remain unrecorded.
                        </Text>
                    )}

                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            disabled={completingWorkout}
                            onClick={closeCompletionConfirmation}
                        >
                            Stay here
                        </Button>

                        <Button
                            color="green"
                            leftSection={<IconCheck size={16}/>}
                            loading={completingWorkout}
                            onClick={completeWorkout}
                        >
                            {completionSummary?.fullyCompleted
                                ? 'Complete workout'
                                : 'Complete anyway'
                            }
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        );
    }

    function renderAbandonWorkoutConfirmationModal() {
        return (
            <Modal
                opened={abandonConfirmationOpen}
                onClose={() => {
                    if (!abandoningWorkout) {
                        setAbandonConfirmationOpen(false);
                    }
                }}
                title="Abandon workout?"
                centered={isSmallScreen}
                yOffset={isSmallScreen ? undefined : "30vh"}
                closeOnClickOutside={!abandoningWorkout}
                closeOnEscape={!abandoningWorkout}
                withCloseButton={!abandoningWorkout}
            >
                <Stack gap="lg">
                    {abandonError && (
                        <Alert color="red">
                            {abandonError}
                        </Alert>
                    )}

                    <Text size="sm" c="dimmed">
                        This will erase all recorded set results and return the
                        workout to Ready. The workout structure and targets will
                        be kept so it can be restarted later or deleted from its
                        source.
                    </Text>

                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            disabled={abandoningWorkout}
                            onClick={() => setAbandonConfirmationOpen(false)}
                        >
                            Keep active
                        </Button>

                        <Button
                            color="red"
                            leftSection={<IconTrash size={16}/>}
                            loading={abandoningWorkout}
                            onClick={abandonWorkout}
                        >
                            Abandon workout
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

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
                                <Group justify="space-between">
                                    <Button
                                        variant="subtle"
                                        w="fit-content"
                                        pl={{base: 'xs', sm: 0}}
                                        pr='xs'
                                        leftSection={<IconLogout2 size={16}/>}
                                        onClick={returnToSource}
                                    >
                                        Exit{recordMode ? ' Record' : ' Workout'}
                                    </Button>

                                    <Menu position="bottom-end" withinPortal>
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray" aria-label="Workout options">
                                                <IconDotsVertical size={18}/>
                                            </ActionIcon>
                                        </Menu.Target>

                                        <Menu.Dropdown>
                                            {workout.status === 'IN_PROGRESS' && (
                                                <>
                                                    <Menu.Item
                                                        leftSection={<IconEdit size={16}/>}
                                                        onClick={editWorkout}
                                                    >
                                                        Edit workout
                                                    </Menu.Item>

                                                    <Menu.Divider/>
                                                </>
                                            )}

                                            <Menu.Item
                                                leftSection={colorScheme === 'dark'
                                                    ? <IconSun size={16}/>
                                                    : <IconMoon size={16}/>
                                                }
                                                onClick={toggleColorScheme}
                                            >
                                                {colorScheme === 'light' ? "Dark mode" : "Light mode"}
                                            </Menu.Item>

                                            <Menu.Divider/>

                                            <Menu.Item
                                                leftSection={<IconLogout2 size={16}/>}
                                                onClick={returnToSource}
                                            >
                                                Exit{recordMode ? ' record' : ' workout'}
                                            </Menu.Item>

                                            {workout.status === 'IN_PROGRESS' && (
                                                <>
                                                    <Menu.Label>Danger zone</Menu.Label>

                                                    <Menu.Item
                                                        color="red"
                                                        leftSection={<IconTrash size={16}/>}
                                                        onClick={openAbandonConfirmation}
                                                    >
                                                        Abandon workout
                                                    </Menu.Item>
                                                </>
                                            )}
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>

                                <Paper
                                    radius={0}
                                    style={{ borderBottom: '1px solid var(--color-border)'}}
                                    pb="xs"
                                >
                                    <Stack gap="xs" px={{base: 'xs', sm: 0}}>
                                        <Group gap="sm">
                                            {workout.status === 'IN_PROGRESS' ? (
                                                <ClientWorkoutLiveDurationBadge
                                                    startedAt={workout.startedAt}
                                                />
                                            ) : (
                                                <Badge color="gray" variant="light">
                                                    Completed
                                                </Badge>
                                            )}

                                            <Text size="sm" c="dimmed">
                                                {getClientWorkoutOriginLabel(workout.origin)}
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
                                benchmarks={benchmarks}
                                itemId={itemId}
                                recordMode={recordMode}
                                isSmallScreen={isSmallScreen}
                                onEditWorkout={editWorkout}
                                onExitWorkout={returnToSource}
                                onAbandonWorkout={openAbandonConfirmation}
                                onOpenItem={openItem}
                                onResultSaved={handleResultSaved}
                            />
                        ) : (
                            <ClientWorkoutSessionOverview
                                workout={workout}
                                results={results}
                                scrollItemId={location.state?.sessionOverviewItemId}
                                completingWorkout={completingWorkout}
                                isSmallScreen={isSmallScreen}
                                onOpenItem={openItem}
                                onCompleteWorkout={requestWorkoutCompletion}
                            />
                        )}
                    </Stack>
                </Paper>
            </Container>
            {renderCompleteWorkoutConfirmationModal()}
            {renderAbandonWorkoutConfirmationModal()}
        </Box>
    );
}

export default ClientWorkoutSessionPage;