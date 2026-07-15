import {useCallback, useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {useIsSmallScreen} from "../../../hooks/useIsSmallScreen.js"
import {
    Box,
    Button,
    Group,
    LoadingOverlay,
    Modal,
    Stack,
    Text,
} from '@mantine/core';
import {
    IconAlertTriangle,
    IconClipboardCheck,
    IconExternalLink,
    IconEye,
    IconPlayerPlay,
    IconTreadmill,
} from '@tabler/icons-react';

import {ROUTES} from '../../../constants/routes.js';

import {
    CLIENT_PROFILE_TABS,
    getClientProfileActiveTab,
    getClientProfileTabPath,
} from './client-profile-tab-utils.js';

import {apiGetClient, apiUpdateClient} from '../shared/api/clients-api.js';

import ClientProfileHeader from './ClientProfileHeader.jsx';
import ClientDetailsForm from "../shared/ClientDetailsForm.jsx";
import ClientProfileTabs from './ClientProfileTabs.jsx';
import ClientProfileReviewAction from './ClientProfileReviewAction.jsx';
import ClientRecordsTab from './records/ClientRecordsTab';

import InitialAssessmentBuilder from '../initial-assessment/InitialAssessmentBuilder';
import InitialAssessmentSetupMenu from '../initial-assessment/InitialAssessmentSetupMenu';
import WorkoutTemplatePicker from '../../workout-library/WorkoutTemplatePicker';

import {
    getInitialAssessmentBuilderRouteConfig,
    INITIAL_ASSESSMENT_BUILDER_MODE,
    INITIAL_ASSESSMENT_BUILDER_QUERY_PARAM,
} from '../initial-assessment/initial-assessment-builder-route-state';

import * as ClientDetailsFormUtils from '../shared/client-form-utils.js';

import {formatDisplayDate, formatDisplayTime} from '../../../utils/time-utils.js';
import {getClientWorkoutOriginLabel} from "../client-workouts/client-workout-constants.js";

function ClientProfilePage() {

    const isSmallScreen = useIsSmallScreen();

    // ------------------------------------------------------------------------------------------------------------------------
    // Route state
    // ------------------------------------------------------------------------------------------------------------------------

    const location = useLocation();
    const navigate = useNavigate();
    const {clientId} = useParams();

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [client, setClient] = useState();

    const [clientLoaded, setClientLoaded] = useState(false);

    const loading = !clientLoaded;

    const activeTab = getClientProfileActiveTab(location.pathname);
    const [visitedTabs, setVisitedTabs] = useState(() => [activeTab]);

    const visitedClientIdRef = useRef(clientId);

    const [editForm, setEditForm] = useState(null);
    const [editErrors, setEditErrors] = useState({});
    const [editingDetails, setEditingDetails] = useState(false);

    const initialAssessmentBuilder = getInitialAssessmentBuilderRouteConfig(location.search);
    const [initialAssessmentTemplatePickerOpen, setInitialAssessmentTemplatePickerOpen] = useState(false);

    const [recordsRefreshKey, setRecordsRefreshKey] = useState(0);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects & Callbacks
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        setVisitedTabs(currentTabs => {
            if (visitedClientIdRef.current !== clientId) {
                visitedClientIdRef.current = clientId;
                return [activeTab];
            }

            return currentTabs.includes(activeTab)
                ? currentTabs
                : [...currentTabs, activeTab];
        });
    }, [activeTab, clientId]);

    const applyClient = useCallback((nextClient) => {
        setClient(nextClient);
        setEditErrors({});
        setEditingDetails(false);
        setEditForm(ClientDetailsFormUtils.createClientDetailsFormFromClient(nextClient));
    }, []);

    const loadClient = useCallback(() => {
        setClientLoaded(false);

        return apiGetClient(clientId)
            .then(applyClient)
            .catch(error => {
                console.error('Error loading client:', error);
            })
            .finally(() => {
                setClientLoaded(true);
            });
    }, [clientId, applyClient]);

    useEffect(() => {
        loadClient();
    }, [loadClient]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Client CRUD
    // ------------------------------------------------------------------------------------------------------------------------

    function updateClient(event) {
        event.preventDefault();

        if (!client) {
            return;
        }

        const updatedErrors = ClientDetailsFormUtils.validateClientDetailsForm(editForm);

        if (Object.keys(updatedErrors).length > 0) {
            setEditErrors(updatedErrors);
            return;
        }

        apiUpdateClient(clientId, ClientDetailsFormUtils.normalizeClientDetailsForm(editForm))
            .then(updatedClient => {
                document.activeElement?.blur(); //close mobile keyboard

                applyClient(updatedClient);
            })
            .catch(error => {
                if (error.fieldErrors) {
                    setEditErrors(error.fieldErrors);
                }

                console.error('Error updating client:', error);
            });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Route/query param helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function changeProfileTab(tabValue) {
        navigate(getClientProfileTabPath(clientId, tabValue));
    }

    function navigateToClientRecord(recordId, {scroll = false, replace = false} = {}) {
        navigate(`${ROUTES.clientRecords(clientId)}#${recordId}`, {
            replace,
            state: scroll
                ? {
                    scrollToRecord: recordId,
                }
                : null,
        });
    }

    function resumeActiveWorkout() {
        const activeWorkoutId = client.activeWorkout?.id;

        if (!activeWorkoutId) {
            return;
        }

        navigate(ROUTES.clientWorkoutSession(activeWorkoutId));
    }

    function viewActiveWorkoutSource() {
        const activeWorkout = client.activeWorkout;

        if (!activeWorkout) {
            return;
        }

        if (activeWorkout.origin === 'INITIAL_ASSESSMENT') {
            navigateToClientRecord('initial-assessment', {
                scroll: true,
            });
        }
    }

    function openIntakeAction() {
        const intakeId = client.reviewStatus?.inProgressIntakeId;

        if (!intakeId) {
            return;
        }

        navigate(ROUTES.intake(intakeId));
    }

    function editIntakeSection(intakeId, step) {
        navigate(ROUTES.intakeEditStep(intakeId, step));
    }

    function viewInitialAssessment() {
        navigateToClientRecord('initial-assessment', {
            scroll: true,
        });
    }

    function navigateInitialAssessmentBuilder(params, {replace = false} = {}) {
        const nextParams = new URLSearchParams(location.search);

        nextParams.delete(INITIAL_ASSESSMENT_BUILDER_QUERY_PARAM.MODE);
        nextParams.delete(INITIAL_ASSESSMENT_BUILDER_QUERY_PARAM.TEMPLATE_ID);
        nextParams.delete(INITIAL_ASSESSMENT_BUILDER_QUERY_PARAM.CLIENT_WORKOUT_ID);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                nextParams.set(key, String(value));
            }
        });

        navigate({
            pathname: location.pathname,
            search: nextParams.toString()
                ? `?${nextParams.toString()}`
                : '',
            hash: location.hash,
        }, {replace});
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Edit form helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function updateEditForm(event) {
        const {name, value} = event.target;

        ClientDetailsFormUtils.updateFormField(
            editForm,
            editErrors,
            setEditForm,
            setEditErrors,
            name,
            value
        );
    }

    function updateEditFormPhone(value) {
        ClientDetailsFormUtils.updateFormField(
            editForm,
            editErrors,
            setEditForm,
            setEditErrors,
            'phone',
            value
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Initial assessment helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function createBlankInitialAssessment() {
        navigateInitialAssessmentBuilder({
            initialAssessment: INITIAL_ASSESSMENT_BUILDER_MODE.NEW,
        });
    }

    function selectInitialAssessmentTemplate(template) {
        setInitialAssessmentTemplatePickerOpen(false);

        navigateInitialAssessmentBuilder({
            initialAssessment: INITIAL_ASSESSMENT_BUILDER_MODE.TEMPLATE,
            templateId: template.id,
        });
    }

    function editInitialAssessment(clientWorkoutId) {
        navigateInitialAssessmentBuilder({
            initialAssessment: INITIAL_ASSESSMENT_BUILDER_MODE.EDIT,
            clientWorkoutId,
        });
    }

    function handleInitialAssessmentSaved(savedWorkout) {
        const alreadyEditingSavedWorkout =
            initialAssessmentBuilder?.clientWorkoutId === savedWorkout.id
            && initialAssessmentBuilder?.sourceWorkoutTemplateId === null;

        if (!alreadyEditingSavedWorkout) {
            navigateInitialAssessmentBuilder({
                initialAssessment: INITIAL_ASSESSMENT_BUILDER_MODE.EDIT,
                clientWorkoutId: savedWorkout.id,
            }, {replace: true});
        }

        setRecordsRefreshKey(currentKey => currentKey + 1);

        apiGetClient(clientId)
            .then(updatedClient => {
                setClient(currentClient => ({
                    ...currentClient,
                    reviewStatus: updatedClient.reviewStatus,
                    activeWorkout: updatedClient.activeWorkout,
                }));
            })
            .catch(error => {
                console.error('Failed to refresh client review status:', error);
            });
    }

    function closeInitialAssessmentBuilder({hasSavedWorkout, createdDuringOpen,} = {}) {
        if (hasSavedWorkout && createdDuringOpen) {
            navigateToClientRecord('initial-assessment', {
                scroll: true,
                replace: true,
            });
            return;
        }

        navigateInitialAssessmentBuilder({}, {replace: true});
    }

    function handleInitialAssessmentDeleted() {
        setRecordsRefreshKey(currentKey => currentKey + 1);

        apiGetClient(clientId)
            .then(updatedClient => {
                setClient(currentClient => ({
                    ...currentClient,
                    reviewStatus: updatedClient.reviewStatus,
                    activeWorkout: updatedClient.activeWorkout,
                }));
            })
            .catch(error => {
                console.error('Failed to refresh client review status:', error);
            });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderTabContent(tab) {
        return (
            <>
                {tab === 'history' && (
                    //TODO temp content, will be replaced with own component
                    <Stack gap={2} pl='0.25rem'>
                        <Text fw={700}>
                            History
                        </Text>

                        <Text size="sm" c="dimmed">
                            Client history, notes, sessions, and timeline activity will appear here.
                        </Text>
                    </Stack>
                )}
                {tab === 'programs' && (
                    //TODO temp content, will be replaced with own component
                    <Stack gap={2} pl='0.25rem'>
                        <Text fw={700}>
                            Programs
                        </Text>

                        <Text size="sm" c="dimmed">
                            Client assigned programs will appear here where they may also be edited.
                        </Text>
                    </Stack>
                )}
                {tab === 'records' && (
                    <ClientRecordsTab
                        client={client}
                        refreshKey={recordsRefreshKey}
                        onOpenIntake={intakeId => navigate(ROUTES.intake(intakeId))}
                        onEditClientDetails={() => setEditingDetails(true)}
                        onEditIntakeSection={editIntakeSection}
                        onNewInitialAssessment={createBlankInitialAssessment}
                        onInitialAssessmentFromTemplate={() => setInitialAssessmentTemplatePickerOpen(true)}
                        onEditInitialAssessment={editInitialAssessment}
                        onInitialAssessmentDeleted={handleInitialAssessmentDeleted}
                    />
                )}
                {tab === 'habits' && (
                    //TODO temp content, will be replaced with own component
                    <Stack gap={2} pl='0.25rem'>
                        <Text fw={700}>
                            Habits
                        </Text>

                        <Text size="sm" c="dimmed">
                            Client habits will appear here.
                        </Text>
                    </Stack>
                )}
                {tab === 'measurements' && (
                    //TODO temp content, will be replaced with own component
                    <Stack gap={2} pl='0.25rem'>
                        <Text fw={700}>
                            Measurements
                        </Text>

                        <Text size="sm" c="dimmed">
                            Client measurements will appear here.
                        </Text>
                    </Stack>
                )}
            </>
        );
    }

    function renderReviewActions() {
        if (client.archived) {
            return null;
        }

        const reviewStatus = client.reviewStatus;
        const activeWorkout = client.activeWorkout;

        const activeWorkoutOriginLabel = activeWorkout ? getClientWorkoutOriginLabel(activeWorkout.origin) : null;

        const activeWorkoutDisplayName =
            activeWorkout
            && activeWorkout.name?.trim().toLowerCase()
            !== activeWorkoutOriginLabel.toLowerCase()
                ? `${activeWorkout.name} · ${activeWorkoutOriginLabel}`
                : activeWorkoutOriginLabel;

        const activeWorkoutHasSource =
            activeWorkout?.origin === 'INITIAL_ASSESSMENT';

        if (!reviewStatus) {
            return null;
        }

        const intakeNeedsAction = reviewStatus.intakeStatus === 'IN_PROGRESS';

        const assessmentNeedsAction = reviewStatus.initialAssessmentStatus === 'MISSING' || reviewStatus.initialAssessmentStatus === 'READY';

        return (
            <>
                {activeWorkout && (
                    <ClientProfileReviewAction
                        color="green"
                        shadow
                        icon={
                            <Group gap={8} wrap="nowrap" pr={4}>
                                <IconTreadmill size={18}/>
                                <span className="client-session-live-dot"/>

                            </Group>
                        }
                        title="Workout in Progress"
                        description={
                            <>
                                <Text span>{activeWorkoutDisplayName}</Text>
                                <br />
                                <Text span size="xs">
                                    {`Started ${formatDisplayDate(activeWorkout.startedAt)} at ${formatDisplayTime(activeWorkout.startedAt)}.`}
                                </Text>
                            </>
                        }
                        action={
                            <Group gap="sm">
                                <Button
                                    color="green"
                                    leftSection={<IconPlayerPlay size={16}/>}
                                    onClick={resumeActiveWorkout}
                                >
                                    Resume{isSmallScreen ? '' : ''}
                                </Button>

                                {activeWorkoutHasSource && (
                                    <Button
                                        variant="light"
                                        leftSection={<IconExternalLink size={16}/>}
                                        onClick={viewActiveWorkoutSource}
                                    >
                                        Go to Source
                                    </Button>
                                )}
                            </Group>
                        }
                    />
                )}

                {intakeNeedsAction && (
                    <ClientProfileReviewAction
                        color="red"
                        icon={<IconAlertTriangle size={18}/>}
                        title="Action Required"
                        description={
                            reviewStatus.intakeStatus === 'IN_PROGRESS'
                                ? `${client.firstName} has an intake in progress.`
                                : `${client.firstName} needs an intake.`
                        }
                        actionLabel={
                            reviewStatus.intakeStatus === 'IN_PROGRESS'
                                ? 'Resume Intake'
                                : 'Start Intake'
                        }
                        actionIcon={<IconPlayerPlay size={16}/>}
                        onAction={openIntakeAction}
                    />
                )}

                {assessmentNeedsAction && (
                    <ClientProfileReviewAction
                        color="yellow"
                        icon={<IconClipboardCheck size={18}/>}
                        title={
                            reviewStatus.initialAssessmentStatus === 'READY'
                                ? 'Initial Assessment Ready'
                                : 'Action Needed'
                        }
                        description={
                            reviewStatus.initialAssessmentStatus === 'READY'
                                ? `${client.firstName}'s initial assessment workout is ready.`
                                : `${client.firstName} needs an initial assessment workout.`
                        }
                        actionLabel="View Assessment"
                        actionIcon={<IconEye size={16}/>}
                        onAction={viewInitialAssessment}
                        action={
                            reviewStatus.initialAssessmentStatus === 'MISSING' ? (
                                <InitialAssessmentSetupMenu
                                    variant='light'
                                    onNewWorkout={createBlankInitialAssessment}
                                    onFromTemplate={() => setInitialAssessmentTemplatePickerOpen(true)}
                                />
                            ) : null
                        }
                    />
                )}
            </>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    if (!client || !editForm) {
        return (
            <Stack pos="relative" mih={300}>
                <LoadingOverlay visible overlayProps={{blur: 2}}/>
            </Stack>
        );
    }

    return (
        <Stack pos="relative" gap="sm">
            <LoadingOverlay
                visible={loading}
                overlayProps={{blur: 2}}
            />

            <Button
                variant="subtle"
                onClick={() => navigate(ROUTES.CLIENTS)}
                w="fit-content"
            >
                ← Back to clients
            </Button>

            <ClientProfileHeader
                client={client}
                onEditDetails={() => setEditingDetails(true)}
                onArchiveClient={() => console.log('Toggle archive client coming soon')}
            />

            {renderReviewActions()}

            <ClientProfileTabs
                activeTab={activeTab}
                onChange={changeProfileTab}
            />

            {CLIENT_PROFILE_TABS.map(tab => {
                if (!visitedTabs.includes(tab.value)) {
                    return null;
                }

                return (
                    <Box
                        key={`${clientId}-${tab.value}`}
                        style={{
                            display: activeTab === tab.value ? 'block' : 'none',
                        }}
                    >
                        {renderTabContent(tab.value)}
                    </Box>
                );
            })}

            <Modal
                opened={editingDetails}
                onClose={() => setEditingDetails(false)}
                title="Edit Client Details"
                centered
                size="lg"
            >
                <ClientDetailsForm
                    form={editForm}
                    errors={editErrors}
                    onChange={updateEditForm}
                    onPhoneChange={updateEditFormPhone}
                    onSubmit={updateClient}
                    submitLabel="Save Changes"
                />
            </Modal>

            {initialAssessmentBuilder === null && (
                <WorkoutTemplatePicker
                    opened={initialAssessmentTemplatePickerOpen}
                    onClose={() => setInitialAssessmentTemplatePickerOpen(false)}
                    onSelect={selectInitialAssessmentTemplate}
                />
            )}

            {initialAssessmentBuilder !== null && (
                <InitialAssessmentBuilder
                    opened
                    client={client}
                    clientWorkoutId={initialAssessmentBuilder?.clientWorkoutId ?? null}
                    sourceWorkoutTemplateId={initialAssessmentBuilder?.sourceWorkoutTemplateId ?? null}
                    onClose={closeInitialAssessmentBuilder}
                    onSaved={handleInitialAssessmentSaved}
                />
            )}
        </Stack>
    );
}

export default ClientProfilePage;