import {useEffect, useState} from 'react';

function ClientsPage({trainerId}) {

    const [clients, setClients] = useState([]);

    const [createForm, setCreateForm] = useState(createEmptyClientForm(trainerId));
    const [createErrors, setErrors] = useState({});

    const [selectedClient, setSelectedClient] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editErrors, setEditErrors] = useState({});

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingDetails, setEditingDetails] = useState(false);

    function loadClients() {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/trainer/${trainerId}`)
            .then(response => response.json())
            .then(data => setClients(data))
            .catch(error => console.error('Error loading clients:', error));
    }

    useEffect(() => {
        loadClients();
    }, []);

    function createEmptyClientForm(trainerId) {
        return {
            trainerId: trainerId,
            firstName: '',
            lastName: '',
            preferredName: '',
            email: '',
            phone: '',
            birthDate: '',
            goals: '',
            limitations: '',
            generalNotes: ''
        };
    }

    function toClientForm(client) {
        return {
            firstName: client.firstName || '',
            lastName: client.lastName || '',
            preferredName: client.preferredName || '',
            email: client.email || '',
            phone: client.phone || '',
            birthDate: client.birthDate || '',
            goals: client.goals || '',
            limitations: client.limitations || '',
            generalNotes: client.generalNotes || ''
        };
    }

    function updateCreateForm(event) {
        const {name, value} = event.target;

        setCreateForm({
            ...createForm,
            [name]: value
        });
        if (createErrors[name]) {
            const updatedErrors = {...createErrors};
            delete updatedErrors[name];
            setErrors(updatedErrors);
        }
    }

    function updateEditForm(event) {
        const {name, value} = event.target;

        setEditForm({
            ...editForm,
            [name]: value
        });

        if (editErrors[name]) {
            const updatedErrors = {...editErrors};
            delete updatedErrors[name];
            setEditErrors(updatedErrors);
        }
    }

    function selectClient(client) {
        setSelectedClient(client);
        setEditErrors({});
        setEditingDetails(false);
        setEditForm(toClientForm(client));
    }


    function createClient(event) {
        event.preventDefault();

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createForm)
        })
            .then(async response => {
                if (!response.ok) {
                    const errorBody = await response.json();

                    if (errorBody.fieldErrors) {
                        setErrors(errorBody.fieldErrors);
                    }

                    throw new Error(errorBody.message || 'Failed to create client');
                }
                return response.json();
            })
            .then(() => {
                setErrors({});
                setShowCreateForm(false);
                setCreateForm(createEmptyClientForm(trainerId));

                loadClients();
            })
            .catch(error => console.error('Error creating client:', error));
    }

    function updateClient(event) {
        event.preventDefault();

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/${selectedClient.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(editForm)
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
                setSelectedClient(updatedClient);
                setEditErrors({});
                loadClients();
            })
            .catch(error => console.error('Error updating client:', error));
    }

    return (
        <div className="clients-page">
            <section className="client-list-panel">
                <div className="page-header">
                    <div>
                        <p>Manage your clients.</p>
                    </div>

                    <button
                        className="add-client-button"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? 'Cancel' : '+ Add Client'}
                    </button>
                </div>

                {showCreateForm && (
                    <section className="client-form-panel">
                        <h3>Add Client</h3>

                        <form onSubmit={createClient} className="client-form">
                            {createErrors.trainerId && <div className="field-error"> * {createErrors.trainerId}</div>}
                            <input name="firstName"
                                   className={createErrors.firstName ? 'input-error' : ''}
                                   placeholder="First name"
                                   value={createForm.firstName}
                                   onChange={updateCreateForm}
                            />
                            {createErrors.firstName && <div className="field-error"> * {createErrors.firstName}</div>}
                            <input name="lastName"
                                   className={createErrors.lastName ? 'input-error' : ''}
                                   placeholder="Last name"
                                   value={createForm.lastName}
                                   onChange={updateCreateForm}
                            />
                            {createErrors.lastName && <div className="field-error"> * {createErrors.lastName}</div>}
                            <input name="preferredName"
                                   placeholder="Preferred name"
                                   value={createForm.preferredName}
                                   onChange={updateCreateForm}
                            />
                            <input name="email"
                                   className={createErrors.email ? 'input-error' : ''}
                                   placeholder="Email"
                                   value={createForm.email}
                                   onChange={updateCreateForm}
                            />
                            {createErrors.email && <div className="field-error"> * {createErrors.email}</div>}
                            <input name="phone"
                                   placeholder="Phone"
                                   value={createForm.phone}
                                   onChange={updateCreateForm}
                            />
                            <input name="birthDate"
                                   type="date"
                                   value={createForm.birthDate}
                                   onChange={updateCreateForm}
                            />
                            <input name="goals"
                                   placeholder="Goals"
                                   value={createForm.goals}
                                   onChange={updateCreateForm}
                            />
                            <input name="limitations"
                                   placeholder="Limitations"
                                   value={createForm.limitations}
                                   onChange={updateCreateForm}
                            />
                            <input name="generalNotes"
                                   placeholder="General notes"
                                   value={createForm.generalNotes}
                                   onChange={updateCreateForm}
                            />

                            <button type="submit">Create Client</button>
                        </form>
                    </section>
                )}

                <div className="client-list">
                    {clients.map(client => (
                        <button
                            key={client.id}
                            className="client-list-item"
                            onClick={() => selectClient(client)}
                        >
                            {client.firstName} {client.lastName}
                            {client.preferredName ? ` (${client.preferredName})` : ''}
                        </button>
                    ))}
                </div>
            </section>

            <section className="client-profile-panel">
                {!selectedClient && (
                    <div className="empty-state">
                        <h2>Select a client</h2>
                        <p>Choose a client from the list to view their profile.</p>
                    </div>
                )}

                {selectedClient && (
                    <>
                        <div className="client-profile-header">
                            <div>
                                <h2>
                                    {selectedClient.firstName} {selectedClient.lastName}
                                    {selectedClient.preferredName ? ` (${selectedClient.preferredName})` : ''}
                                </h2>
                                <p className="client-contact-info">
                                    <span>{selectedClient.email || 'No email'}</span>
                                    <span>{selectedClient.phone || 'No phone'}</span>
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
                                <div className="profile-card">
                                    <h3>Edit Details</h3>
                                    <form onSubmit={updateClient} className="client-form">
                                        <input name="firstName"
                                               className={editErrors.firstName ? 'input-error' : ''}
                                               placeholder="First name"
                                               value={editForm.firstName}
                                               onChange={updateEditForm}
                                        />
                                        {editErrors.firstName && <div className="field-error"> * {editErrors.firstName}</div>}
                                        <input name="lastName"
                                               className={editErrors.lastName ? 'input-error' : ''}
                                               placeholder="Last name"
                                               value={editForm.lastName}
                                               onChange={updateEditForm}
                                        />
                                        {editErrors.lastName && <div className="field-error"> * {editErrors.lastName}</div>}
                                        <input name="preferredName"
                                               placeholder="Preferred name"
                                               value={editForm.preferredName}
                                               onChange={updateEditForm}
                                        />
                                        <input name="email"
                                               className={editErrors.email ? 'input-error' : ''}
                                               placeholder="Email"
                                               value={editForm.email}
                                               onChange={updateEditForm}
                                        />
                                        {editErrors.email && <div className="field-error"> * {editErrors.email}</div>}
                                        <input name="phone"
                                               placeholder="Phone"
                                               value={editForm.phone}
                                               onChange={updateEditForm}
                                        />
                                        <input name="birthDate"
                                               type="date"
                                               value={editForm.birthDate}
                                               onChange={updateEditForm}
                                        />
                                        <textarea name="goals"
                                               placeholder="Goals"
                                               value={editForm.goals}
                                               onChange={updateEditForm}
                                        />
                                        <textarea name="limitations"
                                               placeholder="Limitations"
                                               value={editForm.limitations}
                                               onChange={updateEditForm}
                                        />
                                        <textarea name="generalNotes"
                                               placeholder="General notes"
                                               value={editForm.generalNotes}
                                               onChange={updateEditForm}
                                        />

                                        <button type="submit">Save Changes</button>
                                    </form>
                                </div>
                            )}

                            <div className="profile-card-grid">
                                <div className="profile-card">
                                    <h3>Upcoming Sessions</h3>
                                    <p>No sessions scheduled yet.</p>
                                    <button>+ Schedule Session</button>
                                </div>

                                <div className="profile-card">
                                    <h3>Current Workout Plan</h3>
                                    <p>No workout plan assigned yet.</p>
                                    <button>+ Create Workout Plan</button>
                                </div>

                                <div className="profile-card">
                                    <h3>Recent Notes</h3>
                                    <p>No notes yet.</p>
                                    <button>+ Add Note</button>
                                </div>
                            </div>

                            {!editingDetails && (
                                <div className="profile-card">
                                    <h3>Details</h3>
                                    <p><strong>Goals:</strong> {selectedClient.goals || 'None'}</p>
                                    <p><strong>Limitations:</strong> {selectedClient.limitations || 'None'}</p>
                                    <p><strong>General Notes:</strong> {selectedClient.generalNotes || 'None'}</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>
        </div>
    );

}

export default ClientsPage;