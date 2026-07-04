import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    Accordion,
    Badge,
    Button,
    Group,
    Modal,
    Stack,
    Text,
    ThemeIcon,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {
    IconCheck,
    IconClipboardCheck,
    IconCircleDashedCheck,
} from '@tabler/icons-react';

import {
    apiGetClientIntakesForClient,
} from '../../intake/client-intake-api';

import {
    apiDeleteClientWorkout,
    apiGetInitialAssessmentWorkout,
} from '../../client-workouts/client-workout-api';

import IntakeRecordCard from './IntakeRecordCard';
import InitialAssessmentRecordCard from './InitialAssessmentRecordCard';

const RECORD_IDS = [
    'intake',
    'initial-assessment',
    'initial-measurements',
];

function isRecordId(recordId) {
    return RECORD_IDS.includes(recordId);
}

function ClientRecordsTab({client, refreshKey, onOpenIntake, onNewInitialAssessment, onInitialAssessmentFromTemplate, onEditInitialAssessment, onInitialAssessmentDeleted}) {

    const isMobile = useMediaQuery('(max-width: 48em)');

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

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [deletingInitialAssessment, setDeletingInitialAssessment] = useState(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (!client?.id) {
            return;
        }

        loadIntake();
    }, [client?.id]);

    useEffect(() => {
        if (!client?.id) {
            return;
        }

        if (client.reviewStatus?.initialAssessmentStatus === 'MISSING') {
            setInitialAssessmentWorkout(null);
            setInitialAssessmentError('');
            setInitialAssessmentLoaded(true);
            return;
        }

        loadInitialAssessmentWorkout();
    }, [
        client?.id,
        client.reviewStatus?.initialAssessmentStatus,
        refreshKey,
    ]);

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

        setExpandedRecords(currentRecords => (
            currentRecords.includes(recordId)
                ? currentRecords
                : [...currentRecords, recordId]
        ));

        const scrollDelay =
            (isMobile ? 125 : 225)
            + (intakeLoaded && initialAssessmentLoaded ? 0 : 250);

        const timeoutId = window.setTimeout(() => {
            document.getElementById(recordId)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });

            navigate({
                pathname: location.pathname,
                search: location.search,
                hash: location.hash,
            }, {
                replace: true,
                state: null,
            });
        }, scrollDelay);

        return () => window.clearTimeout(timeoutId);
    }, [
        location.key,
        location.state?.scrollToRecord,
    ]);

    // ------------------------------------------------------------------------------------------------------------------------
    // API loading
    // ------------------------------------------------------------------------------------------------------------------------

    function loadIntake() {
        setIntakeLoaded(false);
        setIntakeError('');

        apiGetClientIntakesForClient(client.id)
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
    }

    function loadInitialAssessmentWorkout() {
        const shouldShowInitialLoader = !initialAssessmentLoaded;

        if (shouldShowInitialLoader) {
            setInitialAssessmentLoaded(false);
        }

        setInitialAssessmentError('');

        apiGetInitialAssessmentWorkout(client.id)
            .then(workout => {
                setInitialAssessmentWorkout(workout);
            })
            .catch(error => {
                if (error.status === 404) {
                    setInitialAssessmentWorkout(null);
                    return;
                }
                console.error('Failed to load initial assessment workout:', error);
                setInitialAssessmentError(error.message || 'Failed to refresh the initial assessment workout.');
            })
            .finally(() => {
                setInitialAssessmentLoaded(true);
            });
    }

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

    function handleExpandedRecordsChange(nextExpandedRecords) {
        const newlyOpenedRecord = nextExpandedRecords.find(
            recordId => !expandedRecords.includes(recordId)
        );

        setExpandedRecords(nextExpandedRecords);

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
                <Stack gap={2}>
                    <Text fw={700}>Records</Text>
                    <Text size="sm" c="dimmed">
                        Review client onboarding records and manage the initial assessment setup.
                    </Text>
                </Stack>

                <Accordion
                    multiple
                    value={expandedRecords}
                    onChange={handleExpandedRecordsChange}
                    variant="separated"
                    radius="md"
                    transitionDuration={isMobile ? 100 : 200}
                >
                    <Accordion.Item
                        value="intake"
                        id="intake"
                        style={{scrollMarginTop: isMobile ? '4.5rem' : '1rem'}}
                        bg='var(--color-surface)'
                    >
                        <Accordion.Control
                            icon={intake?.status === 'COMPLETED'
                                ?
                                    <ThemeIcon size={20} radius="xl" color="green">
                                        <IconCheck size={16} stroke={3}/>
                                    </ThemeIcon>
                                :
                                <IconCircleDashedCheck size={20} color='gray'/>
                            }
                        >
                            {intake?.status === 'COMPLETED' ? (
                                <Text fw={600}>Intake</Text>
                            ) : (
                                <Group justify="space-between" pr="sm" wrap="nowrap">
                                    <Text fw={600} c='dimmed'>Intake</Text>
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
                                loaded={intakeLoaded}
                                error={intakeError}
                                onOpen={onOpenIntake}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item
                        value="initial-assessment"
                        id="initial-assessment"
                        style={{scrollMarginTop: isMobile ? '4.5rem' : '1rem'}}
                        bg='var(--color-surface)'
                    >
                        {/*TODO completed assessment style: no badge, not dimmed, green circle check (like intake)*/}
                        <Accordion.Control
                            icon={initialAssessmentWorkout
                                    ?
                                    <ThemeIcon size={20} radius="xl" color="yellow">
                                        <IconClipboardCheck size={14} stroke={2.5}/>
                                    </ThemeIcon>
                                    :
                                    <IconCircleDashedCheck size={20} color='gray'/>
                            }
                        >
                            <Group justify="space-between" pr="sm" wrap="nowrap">
                                <Text fw={600} c={initialAssessmentWorkout ? undefined : 'dimmed'}>Initial Assessment</Text>

                                <Badge
                                    color={initialAssessmentWorkout ? 'yellow' : 'gray'}
                                    variant="light"
                                >
                                    {initialAssessmentWorkout ? 'Ready' : 'Not set up'}
                                </Badge>
                            </Group>
                        </Accordion.Control>

                        <Accordion.Panel>
                            <InitialAssessmentRecordCard
                                workout={initialAssessmentWorkout}
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
                        style={{scrollMarginTop: isMobile ? '4.5rem' : '1rem'}}
                        bg="var(--color-surface)"
                    >
                        {/*TODO completed initial measurements style: no badge, not dimmed, green circle check (like intake)*/}
                        <Accordion.Control icon={<IconCircleDashedCheck size={20} color='gray'/>}>
                            <Group justify="space-between" pr="sm" wrap="nowrap">
                                <Text fw={600} c='dimmed'>Initial Measurements</Text>
                            </Group>
                        </Accordion.Control>

                        <Accordion.Panel>
                            <Text size="sm" c="dimmed">
                                Initial measurements will be added in a later workflow.
                            </Text>
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