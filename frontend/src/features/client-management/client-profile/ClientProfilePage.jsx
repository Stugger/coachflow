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

import {ROUTES} from '../../../constants/routes.js';

import {
    CLIENT_PROFILE_TABS,
    getClientProfileActiveTab,
    getClientProfileTabPath,
} from './client-profile-tab-utils.js';

import {apiGetClient, apiUpdateClient} from '../shared/api/clients-api.js';
import {apiGetClientIntakesForClient} from '../intake/client-intake-api.js';

import ClientProfileHeader from './ClientProfileHeader.jsx';
import ClientDetailsForm from "../shared/ClientDetailsForm.jsx";
import ClientProfileTabs from './ClientProfileTabs.jsx';
import ClientProfileReviewAction from './ClientProfileReviewAction.jsx';

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
    const [intake, setIntake] = useState();

    const [clientLoaded, setClientLoaded] = useState(false);
    const [intakeLoaded, setIntakeLoaded] = useState(false);

    const loading = !clientLoaded || !intakeLoaded;

    const activeTab = getClientProfileActiveTab(location.pathname);

    const [visitedTabs, setVisitedTabs] = useState(() => [activeTab]);

    const [editForm, setEditForm] = useState(null);
    const [editErrors, setEditErrors] = useState({});

    const [editingDetails, setEditingDetails] = useState(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        loadClient();
        loadIntake();
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

    function loadIntake() {
        setIntakeLoaded(false);
        apiGetClientIntakesForClient(clientId)
            .then(intakes => {
                setIntake(Array.isArray(intakes) ? intakes[0] ?? null : intakes);
            })
            .catch(error => {
                console.error('Error loading intake:', error);
            })
            .finally(() => {
                setIntakeLoaded(true);
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
                loadClient();
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
    // Route/query param helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function openIncompleteIntake() {
        navigate(ROUTES.intake(intake.id));
    }

    function changeProfileTab(tabValue) {
        navigate(getClientProfileTabPath(clientId, tabValue));
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
    // Form helpers
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
    // Utility
    // ------------------------------------------------------------------------------------------------------------------------

    function getClientReviewStatus() {
        if (!intake || intake.status !== 'COMPLETED') {
            return 'INTAKE';
        }
        if (intake.status === "COMPLETED") { //TODO would need to check if initial assessment is not completed
            return 'ASSESS';
        }
        return null;
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderTabContent(tab) {
        //TODO temp content, will be replaced with their own components
        return (
            <>
                {tab === 'history' && (
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
                    <Stack gap="sm">
                        <Text fw={700}>
                            Records
                        </Text>

                        <Text size="sm" c="dimmed">
                            Client intake, assessments, records will appear here.
                        </Text>
                    </Stack>
                )}
                {tab === 'habits' && (
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

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    if (!client || !editForm || !intake) {
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
                reviewStatus={getClientReviewStatus()}
                onEditDetails={() => setEditingDetails(true)}
                onArchiveClient={() => console.log('Toggle archive client coming soon')}
            />

            {!client.archived && (
                <ClientProfileReviewAction
                    client={client}
                    reviewStatus={getClientReviewStatus()}
                    openIntake={openIncompleteIntake}
                />
            )}

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
        </Stack>
    );
}

export default ClientProfilePage;