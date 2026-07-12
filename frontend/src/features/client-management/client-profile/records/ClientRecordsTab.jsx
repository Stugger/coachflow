import {useCallback, useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useIsSmallScreen} from "../../../../hooks/useIsSmallScreen.js";
import {
    Accordion,
    Badge,
    Button,
    Group,
    Loader,
    Modal,
    Stack,
    Text,
    ThemeIcon,
} from '@mantine/core';
import {
    IconCheck,
    IconClipboardCheck,
    IconCircleDashedCheck,
    IconTrophy,
} from '@tabler/icons-react';

import {
    apiGetClientIntakesForClient,
} from '../../intake/client-intake-api';

import {
    apiDeleteClientWorkout,
    apiGetInitialAssessmentWorkout,
} from '../../client-workouts/client-workout-api';

import {
    apiGetCurrentClientExerciseBenchmarks,
} from '../../benchmarks/client-exercise-benchmarks-api.js';

import IntakeRecordCard from './IntakeRecordCard';
import InitialAssessmentRecordCard from './InitialAssessmentRecordCard';
import ExerciseBenchmarksRecordCard from '../records/ExerciseBenchmarksRecordCard.jsx';

const SETUP_RECORD_IDS = [
    'intake',
    'initial-assessment',
    'initial-measurements',
];

const CLIENT_RECORD_IDS = [
    'benchmarks',
];

const RECORD_IDS = [
    ...SETUP_RECORD_IDS,
    ...CLIENT_RECORD_IDS,
];

function isRecordId(recordId) {
    return RECORD_IDS.includes(recordId);
}

function ClientRecordsTab({client, refreshKey,
                              onOpenIntake, onEditClientDetails, onEditIntakeSection,
                              onNewInitialAssessment, onInitialAssessmentFromTemplate, onEditInitialAssessment, onInitialAssessmentDeleted}) {

    const clientId = client?.id ?? null;

    const isSmallScreen = useIsSmallScreen();

    // ------------------------------------------------------------------------------------------------------------------------
    // Route state
    // ------------------------------------------------------------------------------------------------------------------------

    const location = useLocation();
    const navigate = useNavigate();

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [expandedRecords, setExpandedRecords] = useState([]);

    const [intake, setIntake] = useState(null);
    const [intakeLoaded, setIntakeLoaded] = useState(false);
    const [intakeError, setIntakeError] = useState('');

    const [initialAssessmentWorkout, setInitialAssessmentWorkout] = useState(null);
    const [initialAssessmentLoaded, setInitialAssessmentLoaded] = useState(false);
    const [initialAssessmentError, setInitialAssessmentError] = useState('');

    const [benchmarks, setBenchmarks] = useState([]);
    const [benchmarksLoaded, setBenchmarksLoaded] = useState(false);
    const [benchmarksError, setBenchmarksError] = useState('');

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [deletingInitialAssessment, setDeletingInitialAssessment] = useState(false);

    const initialAssessmentLoadedRef = useRef(false);
    const scrollContextRef = useRef(null);

    // ------------------------------------------------------------------------------------------------------------------------
    // API loading
    // ------------------------------------------------------------------------------------------------------------------------

    const loadIntake = useCallback(() => {
        if (!clientId) {
            return;
        }

        setIntakeLoaded(false);
        setIntakeError('');

        return apiGetClientIntakesForClient(clientId)
            .then(intakes => {
                setIntake(intakes?.[0] ?? null);
            })
            .catch(error => {
                console.error('Failed to load intake record:', error);
                setIntake(null);
                setIntakeError(error.message || 'Failed to load the intake record.');
            })
            .finally(() => {
                setIntakeLoaded(true);
            });
    }, [clientId]);

    const loadInitialAssessmentWorkout = useCallback(() => {
        if (!clientId) {
            return;
        }

        const shouldShowInitialLoader = !initialAssessmentLoadedRef.current;

        if (shouldShowInitialLoader) {
            setInitialAssessmentLoaded(false);
        }

        setInitialAssessmentError('');

        return apiGetInitialAssessmentWorkout(clientId)
            .then(workout => {
                setInitialAssessmentWorkout(workout);
            })
            .catch(error => {
                if (error.status === 404) {
                    setInitialAssessmentWorkout(null);
                    return;
                }

                console.error('Failed to load initial assessment workout:', error);
                setInitialAssessmentError(
                    error.message || 'Failed to refresh the initial assessment workout.'
                );
            })
            .finally(() => {
                initialAssessmentLoadedRef.current = true;
                setInitialAssessmentLoaded(true);
            });
    }, [clientId]);

    const loadCurrentBenchmarks = useCallback((showLoader = true) => {
        if (!clientId) {
            return Promise.resolve();
        }

        if (showLoader) {
            setBenchmarksLoaded(false);
        }

        setBenchmarksError('');

        return apiGetCurrentClientExerciseBenchmarks(clientId)
            .then(result => {
                const currentBenchmarks = result ?? [];

                setBenchmarks(currentBenchmarks);

                return currentBenchmarks;
            })
            .catch(error => {
                console.error('Failed to load exercise benchmarks:', error);

                setBenchmarks([]);
                setBenchmarksError(
                    error.message || 'Failed to load exercise benchmarks.'
                );
            })
            .finally(() => {
                setBenchmarksLoaded(true);
            });
    }, [clientId]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        initialAssessmentLoadedRef.current = false;
    }, [clientId]);

    useEffect(() => {
        loadIntake();
    }, [loadIntake]);

    useEffect(() => {
        loadCurrentBenchmarks();
    }, [loadCurrentBenchmarks]);

    useEffect(() => {
        if (!clientId) {
            return;
        }

        if (client.reviewStatus?.initialAssessmentStatus === 'MISSING') {
            initialAssessmentLoadedRef.current = true;
            setInitialAssessmentWorkout(null);
            setInitialAssessmentError('');
            setInitialAssessmentLoaded(true);
            return;
        }

        loadInitialAssessmentWorkout();
    }, [clientId, client.reviewStatus?.initialAssessmentStatus, refreshKey, loadInitialAssessmentWorkout]);

    useEffect(() => {
        scrollContextRef.current = {
            isSmallScreen,
            intakeLoaded,
            initialAssessmentLoaded,
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            navigate,
        };
    }, [isSmallScreen, intakeLoaded, initialAssessmentLoaded, location.pathname, location.search, location.hash, navigate]);

    useEffect(() => {
        const recordId = location.hash.replace('#', '');

        if (!isRecordId(recordId)) {
            return;
        }

        setExpandedRecords(currentRecords => (
            currentRecords.includes(recordId)
                ? currentRecords
                : [...currentRecords, recordId]
        ));
    }, [location.hash]);

    useEffect(() => {
        const recordId = location.state?.scrollToRecord;

        if (!isRecordId(recordId)) {
            return;
        }

        const scrollContext = scrollContextRef.current;

        if (!scrollContext) {
            return;
        }

        setExpandedRecords(currentRecords => (
            currentRecords.includes(recordId)
                ? currentRecords
                : [...currentRecords, recordId]
        ));

        const scrollDelay =
            (scrollContext.isSmallScreen ? 135 : 235)
            + (scrollContext.intakeLoaded && scrollContext.initialAssessmentLoaded ? 0 : 250);

        const timeoutId = window.setTimeout(() => {
            document.getElementById(recordId)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });

            scrollContext.navigate({
                pathname: scrollContext.pathname,
                search: scrollContext.search,
                hash: scrollContext.hash,
            }, {
                replace: true,
                state: null,
            });
        }, scrollDelay);

        return () => window.clearTimeout(timeoutId);
    }, [location.key, location.state?.scrollToRecord]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    async function deleteInitialAssessmentWorkout() {
        if (!initialAssessmentWorkout) {
            return;
        }

        setDeletingInitialAssessment(true);
        setInitialAssessmentError('');

        try {
            await apiDeleteClientWorkout(initialAssessmentWorkout.id);

            setInitialAssessmentWorkout(null);
            setDeleteConfirmationOpen(false);
            onInitialAssessmentDeleted?.();
        } catch (error) {
            console.error('Failed to delete initial assessment workout:', error);
            setInitialAssessmentError(error.message || 'Failed to delete the initial assessment workout.');
        } finally {
            setDeletingInitialAssessment(false);
        }
    }

    function handleExpandedRecordsChange(nextGroupRecords, groupRecordIds) {
        const previousGroupRecords = expandedRecords.filter(
            recordId => groupRecordIds.includes(recordId)
        );

        const newlyOpenedRecord = nextGroupRecords.find(
            recordId => !previousGroupRecords.includes(recordId)
        );

        setExpandedRecords(currentRecords => [
            ...currentRecords.filter(recordId => !groupRecordIds.includes(recordId)),
            ...nextGroupRecords,
        ]);

        const nextHash = newlyOpenedRecord
            ? `#${newlyOpenedRecord}`
            : '';

        navigate({
            pathname: location.pathname,
            search: location.search,
            hash: nextHash,
        }, {
            replace: true,
            state: null,
        });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            <Stack gap="md">
                <Stack gap={2} pl="0.25rem">
                    <Text fw={700}>Records</Text>
                    <Text size="sm" c="dimmed">
                        Review client onboarding records and manage ongoing client records.
                    </Text>
                </Stack>

                {/* Onboarding records */}

                <Accordion
                    multiple
                    value={expandedRecords.filter(recordId => SETUP_RECORD_IDS.includes(recordId))}
                    onChange={records => handleExpandedRecordsChange(records, SETUP_RECORD_IDS)}
                    variant="separated"
                    radius="md"
                    transitionDuration={isSmallScreen ? 100 : 200} //mobile flickers so we speed it up
                >
                    <Accordion.Item
                        value="intake"
                        id="intake"
                        style={{scrollMarginTop: isSmallScreen ? '4.5rem' : '1rem'}}
                        bg="var(--color-surface)"
                    >
                        <Accordion.Control
                            icon={!intakeLoaded
                                ? <Loader size={20} color="gray"/>
                                : intake?.status === 'COMPLETED'
                                    ? (
                                        <ThemeIcon size={20} radius="xl" color="green">
                                            <IconCheck size={16} stroke={3}/>
                                        </ThemeIcon>
                                    )
                                    : <IconCircleDashedCheck size={20} color="gray"/>
                            }
                        >
                            {intake?.status === 'COMPLETED' ? (
                                <Text fw={600}>Intake</Text>
                            ) : (
                                <Group justify="space-between" pr="sm" wrap="nowrap">
                                    <Text fw={600} c="dimmed">Intake</Text>
                                    {intakeLoaded && (
                                        <Badge color="red" variant="light">
                                            {intake === null ? 'Missing' : 'Incomplete'}
                                        </Badge>
                                    )}
                                </Group>
                            )}
                        </Accordion.Control>

                        <Accordion.Panel>
                            <IntakeRecordCard
                                intake={intake}
                                client={client}
                                loaded={intakeLoaded}
                                error={intakeError}
                                onOpen={onOpenIntake}
                                onEditClientDetails={onEditClientDetails}
                                onEditIntakeSection={onEditIntakeSection}
                                showIntakeReview={Boolean(location.state?.showIntakeReview)}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item
                        value="initial-assessment"
                        id="initial-assessment"
                        style={{scrollMarginTop: isSmallScreen ? '4.5rem' : '1rem'}}
                        bg="var(--color-surface)"
                    >
                        {/*TODO completed assessment style: no badge, not dimmed, green circle check (like intake)*/}
                        <Accordion.Control
                            icon={!initialAssessmentLoaded
                                ? <Loader size={20} color="gray"/>
                                : initialAssessmentWorkout
                                    ? (
                                        <ThemeIcon size={20} radius="xl" color="yellow">
                                            <IconClipboardCheck size={14} stroke={2.5}/>
                                        </ThemeIcon>
                                    )
                                    : <IconCircleDashedCheck size={20} color="gray"/>
                            }
                        >
                            <Group justify="space-between" pr="sm" wrap="nowrap">
                                <Text
                                    fw={600}
                                    c={initialAssessmentLoaded && initialAssessmentWorkout ? undefined : 'dimmed'}
                                >
                                    Initial Assessment
                                </Text>
                                {initialAssessmentLoaded && (
                                    <Badge
                                        color={initialAssessmentWorkout ? 'yellow' : 'gray'}
                                        variant="light"
                                    >
                                        {initialAssessmentWorkout ? 'Ready' : 'Not set up'}
                                    </Badge>
                                )}
                            </Group>
                        </Accordion.Control>

                        <Accordion.Panel>
                            <InitialAssessmentRecordCard
                                workout={initialAssessmentWorkout}
                                benchmarks={benchmarksLoaded && !benchmarksError ? benchmarks : null}
                                loaded={initialAssessmentLoaded}
                                error={initialAssessmentError}
                                deleting={deletingInitialAssessment}
                                onNewWorkout={onNewInitialAssessment}
                                onFromTemplate={onInitialAssessmentFromTemplate}
                                onEdit={onEditInitialAssessment}
                                onDelete={() => setDeleteConfirmationOpen(true)}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item
                        value="initial-measurements"
                        id="initial-measurements"
                        style={{scrollMarginTop: isSmallScreen ? '4.5rem' : '1rem'}}
                        bg="var(--color-surface)"
                    >
                        {/*TODO completed initial measurements style: no badge, not dimmed, green circle check (like intake)*/}
                        <Accordion.Control icon={<IconCircleDashedCheck size={20} color="gray"/>}>
                            <Group justify="space-between" pr="sm" wrap="nowrap">
                                <Text fw={600} c="dimmed">Initial Measurements</Text>
                            </Group>
                        </Accordion.Control>

                        <Accordion.Panel>
                            <Text size="sm" c="dimmed">
                                Initial measurements will be added in a later workflow.
                            </Text>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>

                {/* Progress records */}

                <Accordion
                    multiple
                    value={expandedRecords.filter(recordId => CLIENT_RECORD_IDS.includes(recordId))}
                    onChange={records => handleExpandedRecordsChange(records, CLIENT_RECORD_IDS)}
                    variant="separated"
                    radius="md"
                    transitionDuration={isSmallScreen ? 100 : 200}
                >
                    <Accordion.Item
                        value="benchmarks"
                        id="benchmarks"
                        style={{scrollMarginTop: isSmallScreen ? '4.5rem' : '1rem'}}
                        bg="var(--color-surface)"
                    >
                        <Accordion.Control icon={<IconTrophy size={20} color="gray"/>}>
                            <Text fw={600}>Benchmarks</Text>
                        </Accordion.Control>

                        <Accordion.Panel>
                            <ExerciseBenchmarksRecordCard
                                clientId={clientId}
                                benchmarks={benchmarks}
                                loaded={benchmarksLoaded}
                                loadError={benchmarksError}
                                onReload={loadCurrentBenchmarks}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </Stack>

            <Modal
                opened={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                title="Delete initial assessment workout?"
                centered
            >
                <Stack gap="lg">
                    <Text size="sm" c="dimmed">
                        This permanently removes the saved assessment workout.
                    </Text>

                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            onClick={() => setDeleteConfirmationOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            color="red"
                            loading={deletingInitialAssessment}
                            onClick={deleteInitialAssessmentWorkout}
                        >
                            Delete workout
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}

export default ClientRecordsTab;