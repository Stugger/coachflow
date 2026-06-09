import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Alert,
    Button,
    LoadingOverlay,
    Modal,
    Paper,
    Stack,
    Text,
    Group,
} from '@mantine/core';
import ClientProfileHeader from '../components/clients/profile/ClientProfileHeader';
import ClientDetailsForm from "../components/clients/ClientDetailsForm.jsx";
import ClientProfileTabs from '../components/clients/profile/ClientProfileTabs';
import ClientReviewAction from '../components/clients/profile/ClientReviewAction';
import {ROUTES} from '../constants/routes';
import * as ClientDetailsFormUtils from '../utils/client-form-utils';
import * as TextUtils from '../utils/text-utils';

function ClientProfilePage({trainerId}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Route state
    // ------------------------------------------------------------------------------------------------------------------------

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

    const [editForm, setEditForm] = useState(null);
    const [editErrors, setEditErrors] = useState({});

    const [editingDetails, setEditingDetails] = useState(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        loadClient();
        loadIntake();
    }, []);

    // ------------------------------------------------------------------------------------------------------------------------
    // API loading
    // ------------------------------------------------------------------------------------------------------------------------

    function loadClient() {
        setClientLoaded(false);
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/${clientId}`)
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to load client');
                }

                return response.json();
            })
            .then(client => {
                if (client.trainer.id === trainerId) {
                    applyClient(client);
                }
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
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/client-intakes/client/${clientId}`)
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to load intake');
                }

                return response.json();
            })
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

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/${clientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ClientDetailsFormUtils.normalizeClientDetailsForm(editForm))
        })
            .then(async response => {
                if (!response.ok) {
                    const errorBody = await response.json();

                    if (errorBody.fieldErrors) {
                        setEditErrors(errorBody.fieldErrors);
                    }

                    throw new Error(errorBody.message || 'Failed to update client');
                }

                return response.json();
            })
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
            .catch(error => console.error('Error updating client:', error));
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Route/query param helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function openIncompleteIntake() {
        navigate(ROUTES.intake(intake.id));
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

    function getActiveTab() {
        if (location.pathname.endsWith('/programs')) return 'programs';
        if (location.pathname.endsWith('/records')) return 'records';
        if (location.pathname.endsWith('/habits')) return 'habits';
        if (location.pathname.endsWith('/measurements')) return 'measurements';
        return 'history';
    }

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

    function renderActiveTabContent() {
        //TODO temp content, will be replaced with their own components
        return (
            <>
                {getActiveTab() === 'history' && (
                    <Stack gap="sm">
                        <Text fw={700}>
                            History
                        </Text>

                        <Text size="sm" c="dimmed">
                            Client history, notes, sessions, and timeline activity will appear here.
                        </Text>
                    </Stack>
                )}
                {getActiveTab() === 'programs' && (
                    <Stack gap="sm">
                        <Text fw={700}>
                            Programs
                        </Text>

                        <Text size="sm" c="dimmed">
                            Client assigned programs will appear here where they may also be edited.
                        </Text>
                    </Stack>
                )}
                {getActiveTab() === 'records' && (
                    <Stack gap="sm">
                        <Text fw={700}>
                            Records
                        </Text>

                        <Text size="sm" c="dimmed">
                            Client intake, assessments, records will appear here.
                        </Text>
                    </Stack>
                )}
                {getActiveTab() === 'habits' && (
                    <Stack gap="sm">
                        <Text fw={700}>
                            Habits
                        </Text>

                        <Text size="sm" c="dimmed">
                            Client habits will appear here.
                        </Text>
                    </Stack>
                )}
                {getActiveTab() === 'measurements' && (
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

            <ClientReviewAction
                client={client}
                reviewStatus={getClientReviewStatus()}
                openIntake={openIncompleteIntake}
            />

            <ClientProfileTabs />

            {renderActiveTabContent()}

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