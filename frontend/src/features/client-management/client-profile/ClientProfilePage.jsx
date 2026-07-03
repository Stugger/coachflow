import {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    LoadingOverlay,
    Modal,
    Paper,
    Stack,
    Text,
    Group,
} from '@mantine/core';
import {
    IconAlertTriangle,
    IconClipboardCheck,
    IconEye,
    IconPlayerPlay,
    IconPlus,
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

import * as ClientDetailsFormUtils from '../shared/client-form-utils.js';
import * as TextUtils from '../../../utils/text-utils.js';

function ClientProfilePage() {

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

    const [editForm, setEditForm] = useState(null);
    const [editErrors, setEditErrors] = useState({});
    const [editingDetails, setEditingDetails] = useState(false);

    const [initialAssessmentBuilder, setInitialAssessmentBuilder] = useState(null);
    const [recordsRefreshKey, setRecordsRefreshKey] = useState(0);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        loadClient();
    }, [clientId]);

    useEffect(() => {
        setVisitedTabs(currentTabs =>
            currentTabs.includes(activeTab)
                ? currentTabs
                : [...currentTabs, activeTab]
        );
    }, [activeTab]);

    useEffect(() => {
        setVisitedTabs([activeTab]);
    }, [clientId]);

    // ------------------------------------------------------------------------------------------------------------------------
    // API loading
    // ------------------------------------------------------------------------------------------------------------------------

    function loadClient() {
        setClientLoaded(false);
        apiGetClient(clientId)
            .then(client => {
                applyClient(client);
            })
            .catch(error => {
                console.error('Error loading client:', error);
            })
            .finally(() => {
                setClientLoaded(true);
            });
    }

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
                setTimeout(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 200);
            })
            .catch(error => {
                if (error.fieldErrors) {
                    setEditErrors(error.fieldErrors);
                }

                console.error('Error updating client:', error);
            });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Client applied
    // ------------------------------------------------------------------------------------------------------------------------

    function applyClient(client) {
        setClient(client);
        setEditErrors({});
        setEditingDetails(false);
        setEditForm(ClientDetailsFormUtils.createClientDetailsFormFromClient(client));
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Route/query param helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function changeProfileTab(tabValue) {
        navigate(getClientProfileTabPath(clientId, tabValue));
    }

    function openIntakeAction() {
        const intakeId = client.reviewStatus?.inProgressIntakeId;

        if (!intakeId) {
            return;
        }

        navigate(ROUTES.intake(intakeId));
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

    function openInitialAssessmentBuilder(clientWorkoutId = null, {returnToRecordsOnClose = false} = {}) {
        setInitialAssessmentBuilder({clientWorkoutId, returnToRecordsOnClose});
    }

    function openInitialAssessmentAction() {
        if (client.reviewStatus?.initialAssessmentStatus === 'MISSING') {
            openInitialAssessmentBuilder(null, {
                returnToRecordsOnClose: true,
            });
            return;
        }

        navigate(`${ROUTES.clientRecords(clientId)}#initial-assessment`);
    }

    function handleInitialAssessmentSaved(savedWorkout) {
        setInitialAssessmentBuilder(currentBuilder => (
            currentBuilder
                ? {
                    ...currentBuilder,
                    clientWorkoutId: savedWorkout.id,
                }
                : currentBuilder
        ));

        setRecordsRefreshKey(currentKey => currentKey + 1);

        apiGetClient(clientId)
            .then(updatedClient => {
                setClient(currentClient => ({
                    ...currentClient,
                    reviewStatus: updatedClient.reviewStatus,
                }));
            })
            .catch(error => {
                console.error('Failed to refresh client review status:', error);
            });
    }

    function closeInitialAssessmentBuilder({hasSavedWorkout} = {}) {
        const returnToRecords = Boolean(
            initialAssessmentBuilder?.returnToRecordsOnClose
            && hasSavedWorkout
        );

        setInitialAssessmentBuilder(null);

        if (returnToRecords) {
            navigate(`${ROUTES.clientRecords(clientId)}#initial-assessment`);
        }
    }

    function handleInitialAssessmentDeleted() {
        setRecordsRefreshKey(currentKey => currentKey + 1);

        apiGetClient(clientId)
            .then(updatedClient => {
                setClient(currentClient => ({
                    ...currentClient,
                    reviewStatus: updatedClient.reviewStatus,
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
                    <Stack gap="sm">
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
                    <Stack gap="sm">
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
                        onCreateInitialAssessment={() => {
                            openInitialAssessmentBuilder();
                        }}
                        onEditInitialAssessment={clientWorkoutId => {
                            openInitialAssessmentBuilder(clientWorkoutId);
                        }}
                        onInitialAssessmentDeleted={handleInitialAssessmentDeleted}
                    />
                )}
                {tab === 'habits' && (
                    //TODO temp content, will be replaced with own component
                    <Stack gap="sm">
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
                    <Stack gap="sm">
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

        if (!reviewStatus) {
            return null;
        }

        const intakeNeedsAction = reviewStatus.intakeStatus === 'IN_PROGRESS';

        const assessmentNeedsAction = reviewStatus.initialAssessmentStatus === 'MISSING' || reviewStatus.initialAssessmentStatus === 'READY';

        return (
            <>
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
                                ? `${client.firstName}'s initial assessment workout is ready to review.`
                                : `${client.firstName} needs an initial assessment workout.`
                        }
                        actionLabel={
                            reviewStatus.initialAssessmentStatus === 'READY'
                                ? 'View Assessment'
                                : 'Set Up Assessment'
                        }
                        actionIcon={reviewStatus.initialAssessmentStatus === 'READY'
                            ? <IconEye size={16}/>
                            : <IconPlus size={16}/>
                        }
                        onAction={openInitialAssessmentAction}
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

            {initialAssessmentBuilder !== null && (
                <InitialAssessmentBuilder
                    opened
                    client={client}
                    clientWorkoutId={initialAssessmentBuilder?.clientWorkoutId ?? null}
                    onClose={closeInitialAssessmentBuilder}
                    onSaved={handleInitialAssessmentSaved}
                />
            )}
        </Stack>
    );
}

export default ClientProfilePage;