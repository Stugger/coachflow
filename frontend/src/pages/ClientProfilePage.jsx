import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {ROUTES} from '../constants/routes';
import ClientDetailsForm from "../components/clients/ClientDetailsForm.jsx";
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
            });
    }

    function loadIntake() {
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

    function getClientReviewStatus() {
        if (intake.status !== "COMPLETED") {
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

    function renderEditDetailsClient() {
        return (
            <div className="profile-card">
                <h3>Edit Details</h3>

                <ClientDetailsForm
                    form={editForm}
                    errors={editErrors}
                    onChange={updateEditForm}
                    onPhoneChange={updateEditFormPhone}
                    onSubmit={updateClient}
                    submitLabel={"Save Changes"}
                />
            </div>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    if (!client || !editForm || !intake) {
        return <div>Loading client...</div>;
    }

    return (
        <div>
            <section className="client-profile-panel">
                <>
                    <button
                        className="link-button"
                        onClick={() => navigate(ROUTES.CLIENTS)}
                    >
                        {'< Go back'}
                    </button>
                    <div className="client-profile-header">
                        <div>
                            <h2>
                                {client.firstName} {client.lastName}
                                {client.preferredName ? ` (${client.preferredName})` : ''}
                            </h2>
                            <p className="client-contact-info">
                                <span>{client.phone || 'No phone'}</span>
                                <span>{client.email || 'No email'}</span>
                            </p>
                        </div>

                        <button
                            className="edit-details-button"
                            onClick={() => setEditingDetails(!editingDetails)}
                        >
                            {editingDetails ? 'Cancel' : 'Edit Details'}
                        </button>
                    </div>
                    <div className="client-profile-content">
                        {editingDetails && (
                           renderEditDetailsClient()
                        )}
                        {getClientReviewStatus() === 'INTAKE' && (
                            <div className="profile-card review-action urgent">
                                <h3>Incomplete Intake</h3>
                                <p>{client.firstName} has not completed their intake.</p>
                                <button
                                    onClick={() =>  openIncompleteIntake()}
                                >
                                    Resume Intake
                                </button>
                            </div>
                        )}
                        {getClientReviewStatus() === 'ASSESS' && (
                            <div className="profile-card review-action warning">
                                <h3>Initial Assessment Needed</h3>
                                <p>{client.firstName} has completed intake and is ready for an initial assessment.</p>
                                <button disabled>Start Assessment (Coming Soon)</button>
                            </div>
                        )}
                        <div className="profile-card-grid">
                            <div className="profile-card">
                                <h3>Upcoming Sessions</h3>
                                <p>No sessions scheduled yet.</p>
                                <button disabled>+ Schedule Session (Coming Soon)</button>
                            </div>
                            <div className="profile-card">
                                <h3>Recent Notes</h3>
                                <p>No notes yet.</p>
                                <button disabled>+ Add Note (Coming Soon)</button>
                            </div>
                        </div>
                        <div className="profile-card">
                            <h3>Current Workout Plan</h3>
                            <p>No workout plan assigned yet.</p>
                            <button disabled>+ Create Workout Plan (Coming Soon)</button>
                        </div>
                    </div>
                </>
            </section>
        </div>
    );
}

export default ClientProfilePage;