import {useEffect, useState} from 'react';

function ClientsPage({trainerId}) {

    const [clients, setClients] = useState([]);

    const [createForm, setCreateForm] = useState(createEmptyClientForm(trainerId));
    const [createErrors, setErrors] = useState({});

    const [selectedClient, setSelectedClient] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editErrors, setEditErrors] = useState({});

    function loadClients() {
        fetch('http://localhost:8080/api/clients')
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
        setEditForm(toClientForm(client));
    }


    function createClient(event) {
        event.preventDefault();

        fetch('http://localhost:8080/api/clients', {
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
                setCreateForm(createEmptyClientForm(trainerId));

                loadClients();
            })
            .catch(error => console.error('Error creating client:', error));
    }

    function updateClient(event) {
        event.preventDefault();

        fetch(`http://localhost:8080/api/clients/${selectedClient.id}`, {
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
            <section className="client-form-panel">
                <h2>Create Client</h2>

                <form onSubmit={createClient} className="client-form">
                    <input name="firstName"
                           className={createErrors.firstName ? 'input-error' : ''}
                           placeholder="First name"
                           value={createForm.firstName}
                           onChange={updateCreateForm}
                    />
                    <input name="lastName"
                           className={createErrors.lastName ? 'input-error' : ''}
                           placeholder="Last name"
                           value={createForm.lastName}
                           onChange={updateCreateForm}
                    />
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

                    {createErrors.trainerId && <div className="field-error"> * {createErrors.trainerId}</div>}
                    {createErrors.firstName && <div className="field-error"> * {createErrors.firstName}</div>}
                    {createErrors.lastName && <div className="field-error"> * {createErrors.lastName}</div>}
                    {createErrors.email && <div className="field-error"> * {createErrors.email}</div>}
                </form>
            </section>

            <section className="client-main-panel">
                <h2>Clients</h2>

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

                {selectedClient && editForm && (
                    <div className="client-details">
                        <h2>Edit Client</h2>

                        <form onSubmit={updateClient} className="client-form">
                            <input name="firstName"
                                   className={editErrors.firstName ? 'input-error' : ''}
                                   placeholder="First name"
                                   value={editForm.firstName}
                                   onChange={updateEditForm}
                            />
                            <input name="lastName"
                                   className={editErrors.lastName ? 'input-error' : ''}
                                   placeholder="Last name"
                                   value={editForm.lastName}
                                   onChange={updateEditForm}
                            />
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
                            <input name="goals"
                                   placeholder="Goals"
                                   value={editForm.goals}
                                   onChange={updateEditForm}
                            />
                            <input name="limitations"
                                   placeholder="Limitations"
                                   value={editForm.limitations}
                                   onChange={updateEditForm}
                            />
                            <input name="generalNotes"
                                   placeholder="General notes"
                                   value={editForm.generalNotes}
                                   onChange={updateEditForm}
                            />

                            <button type="submit">Save Changes</button>

                            {editErrors.firstName && <div className="field-error"> * {editErrors.firstName}</div>}
                            {editErrors.lastName && <div className="field-error"> * {editErrors.lastName}</div>}
                            {editErrors.email && <div className="field-error"> * {editErrors.email}</div>}
                        </form>
                    </div>
                )}
            </section>
        </div>
    );
}

export default ClientsPage;