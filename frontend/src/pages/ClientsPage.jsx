import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ROUTES} from '../constants/routes';
import * as TextUtils from '../utils/text-utils';

function ClientsPage({trainerId}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Route state
    // ------------------------------------------------------------------------------------------------------------------------

    const navigate = useNavigate();

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [clients, setClients] = useState([]);
    const [intakes, setIntakes] = useState([]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived clients
    // ------------------------------------------------------------------------------------------------------------------------

    const sortedClients = [...clients].sort((a, b) => {
        const aStatus = getClientReviewStatus(a.id);
        const bStatus = getClientReviewStatus(b.id);
        const getPriority = (status) => {
            if (status === 'INTAKE') {
                return 0;
            }
            if (status === 'ASSESS') {
                return 1;
            }
            return 2;
        };
        return getPriority(aStatus) - getPriority(bStatus);
    });

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        loadClients();
        loadIntakes();
    }, []);

    // ------------------------------------------------------------------------------------------------------------------------
    // API loading
    // ------------------------------------------------------------------------------------------------------------------------

    function loadClients() {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/trainer/${trainerId}`)
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to load clients');
                }

                return response.json();
            })
            .then(data => {
                setClients(Array.isArray(data) ? data : []);
            })
            .catch(error => {
                console.error('Error loading clients:', error);
                setClients([]);
            });
    }

    function loadIntakes() {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/client-intakes/trainer/${trainerId}`)
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to load intake drafts');
                }

                return response.json();
            })
            .then(intakes => {
                setIntakes(intakes);
            })
            .catch(error => {
                console.error('Error loading intake drafts:', error);
                setIntakes([]);
            });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Route/query param helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function selectClient(client) {
        navigate(ROUTES.clientProfile(client.id));
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Utility
    // ------------------------------------------------------------------------------------------------------------------------

    function getIncompleteIntakeForClient(clientId) {
        return intakes.find(intake =>
            String(intake.clientId) === String(clientId)
            && intake.status !== 'COMPLETED'
        );
    }

    function getCompletedIntakeForClient(clientId) {
        return intakes.find(intake =>
            String(intake.clientId) === String(clientId)
            && intake.status === 'COMPLETED'
        );
    }

    function hasInitialAssessment(clientId) {
        //TODO, if the client does not have any assessments in database, then that indicates they need an initial assessment
        //and if they have 1 assessment but it is incomplete then that indicates their initial assessment is incomplete
        return false;
    }

    function getClientReviewStatus(clientId) {
        if (getIncompleteIntakeForClient(clientId)) {
            return 'INTAKE';
        }
        if (getCompletedIntakeForClient(clientId) && !hasInitialAssessment(clientId)) {
            return 'ASSESS';
        }
        return null;
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderClientListItem(client) {
        const reviewStatus = getClientReviewStatus(client.id);
        return (
            <button
                key={client.id}
                className={'client-list-item'}
                onClick={() => selectClient(client)}
            >
                <span className="client-list-name">
                    {client.firstName} {client.lastName}
                    {client.preferredName ? ` (${client.preferredName})` : ''}
                </span>

                {reviewStatus === 'INTAKE' && (
                    <span className="client-review-pill intake">
                        INTAKE
                    </span>
                )}

                {reviewStatus === 'ASSESS' && (
                    <span className="client-review-pill assess">
                        ASSESS
                    </span>
                )}
            </button>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <div className="clients-page">
            <section className="client-list-panel">
                <div className="page-header">
                    <div>
                        <h2>Clients</h2>
                        <p>Manage your clients.</p>
                    </div>

                    <button onClick={() => navigate(ROUTES.INTAKE_NEW)}>
                        + New Client
                    </button>
                </div>
                <div className="client-list">
                    {sortedClients.map(client =>
                        renderClientListItem(client)
                    )}
                </div>
            </section>
            <section className="client-profile-panel">
                <div className="empty-state">
                    <h2>Select a client</h2>
                    <p>Choose a client from the list to view their profile.</p>
                </div>
            </section>
        </div>
    );
}

export default ClientsPage;