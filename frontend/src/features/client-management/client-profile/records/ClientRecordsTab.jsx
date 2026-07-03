import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    Accordion,
    Alert,
    Badge,
    Button,
    Group,
    Modal,
    Stack,
    Text,
} from '@mantine/core';
import {
    IconClipboardCheck,
    IconClipboardText,
    IconRulerMeasure,
} from '@tabler/icons-react';

import {ROUTES} from '../../../../constants/routes';

import {
    apiGetClientIntakesForClient,
} from '../../intake/client-intake-api';

import {
    apiDeleteClientWorkout,
    apiGetInitialAssessmentWorkout,
} from '../../client-workouts/client-workout-api';

import IntakeRecordCard from './IntakeRecordCard';
import InitialAssessmentRecordCard from './InitialAssessmentRecordCard';

function ClientRecordsTab({client, refreshKey, onOpenIntake, onNewInitialAssessment, onInitialAssessmentFromTemplate, onEditInitialAssessment, onInitialAssessmentDeleted}) {

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

        if (client.reviewStatus?.initialAssessmentStatus === 'MISSING') {
            setInitialAssessmentWorkout(null);
            setInitialAssessmentError('');
            setInitialAssessmentLoaded(true);
            return;
        }

        loadInitialAssessmentWorkout();
    }, [client?.id, client.reviewStatus?.initialAssessmentStatus, refreshKey]);

    useEffect(() => {
        const recordId = location.hash.replace('#', '');

        if (![
            'intake',
            'initial-assessment',
            'initial-measurements',
        ].includes(recordId)) {
            return;
        }

        setExpandedRecords(currentRecords => (
            currentRecords.includes(recordId)
                ? currentRecords
                : [...currentRecords, recordId]
        ));

        const timeoutId = window.setTimeout(() => {
            document.getElementById(recordId)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, 125);

        return () => window.clearTimeout(timeoutId);
    }, [
        location.hash,
        intakeLoaded,
        initialAssessmentLoaded,
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
        setInitialAssessmentLoaded(false);
        setInitialAssessmentError('');

        apiGetInitialAssessmentWorkout(client.id)
            .then(setInitialAssessmentWorkout)
            .catch(error => {
                if (error.status === 404) {
                    setInitialAssessmentWorkout(null);
                    return;
                }
                console.error('Failed to load initial assessment workout:', error);
                setInitialAssessmentWorkout(null);
                setInitialAssessmentError(error.message || 'Failed to load the initial assessment workout.');
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

        if (newlyOpenedRecord) {
            navigate(
                `${ROUTES.clientRecords(client.id)}#${newlyOpenedRecord}`,
                {replace: true}
            );
            return;
        }

        const currentHashRecord = location.hash.replace('#', '');

        if (currentHashRecord && !nextExpandedRecords.includes(currentHashRecord)) {
            navigate(ROUTES.clientRecords(client.id), {replace: true});
        }
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
                >
                    <Accordion.Item
                        value="intake"
                        id="intake"
                        style={{scrollMarginTop: '1rem'}}
                        bg='var(--color-surface)'
                    >
                        <Accordion.Control icon={<IconClipboardText size={18}/>}>
                            <Group justify="space-between" pr="sm" wrap="nowrap">
                                <Text fw={600}>Intake</Text>

                                <Badge
                                    color={intake?.status === 'COMPLETED' ? 'green' : 'red'}
                                    variant="light"
                                >
                                    {intake?.status === 'COMPLETED'
                                        ? 'Completed'
                                        : 'In Progress'
                                    }
                                </Badge>
                            </Group>
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
                        style={{scrollMarginTop: '1rem'}}
                        bg='var(--color-surface)'
                    >
                        <Accordion.Control icon={<IconClipboardCheck size={18}/>}>
                            <Group justify="space-between" pr="sm" wrap="nowrap">
                                <Text fw={600}>Initial Assessment</Text>

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
                        bg='var(--color-surface)'
                    >
                        <Accordion.Control icon={<IconRulerMeasure size={18}/>}>
                            <Group justify="space-between" pr="sm" wrap="nowrap">
                                <Text fw={600}>Initial Measurements</Text>
                                <Badge color="gray" variant="light">
                                    Coming soon
                                </Badge>
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