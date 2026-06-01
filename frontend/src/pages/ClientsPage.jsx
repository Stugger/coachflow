import {useEffect, useRef, useState} from 'react';
import * as PhoneUtils from '../utils/phone-utils';
import * as TextUtils from '../utils/text-utils';

function ClientsPage({trainerId}) {

    const [clients, setClients] = useState([]);

    const [createForm, setCreateForm] = useState(createEmptyClientForm(trainerId));
    const [createErrors, setErrors] = useState({});

    const [selectedClient, setSelectedClient] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editErrors, setEditErrors] = useState({});

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingDetails, setEditingDetails] = useState(false);

    const clientProfileRef = useRef(null);

    function loadClients() {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/trainer/${trainerId}`)
            .then(response => response.json())
            .then(data => setClients(data))
            .catch(error => console.error('Error loading clients:', error));
    }

    useEffect(() => {
        loadClients();
    }, []);

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
        setTimeout(() => {
            clientProfileRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 200);
    }

    function createClient(event) {
        event.preventDefault();

        const createPhone = PhoneUtils.splitPhone(createForm.phone);

        if (PhoneUtils.isPartialPhone(createPhone.area, createPhone.prefix, createPhone.line)) {
            setErrors({
                ...createErrors,
                phone: 'Phone number must be complete'
            });
            return;
        }

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(normalizeForm(createForm))
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
                document.activeElement?.blur(); //close mobile keyboard
                setErrors({});
                setShowCreateForm(false);
                setCreateForm(createEmptyClientForm(trainerId));

                loadClients();

                setTimeout(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 200);
            })
            .catch(error => console.error('Error creating client:', error));
    }

    function updateClient(event) {
        event.preventDefault();

        const editPhone = PhoneUtils.splitPhone(editForm.phone);

        if (PhoneUtils.isPartialPhone(editPhone.area, editPhone.prefix, editPhone.line)) {
            setEditErrors({
                ...editErrors,
                phone: 'Phone number must be complete'
            });
            return;
        }

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/${selectedClient.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(normalizeForm(editForm))
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
                setSelectedClient(updatedClient);
                setEditErrors({});
                setEditingDetails(false);

                loadClients();

                setTimeout(() => {
                    clientProfileRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 200);
            })
            .catch(error => console.error('Error updating client:', error));
    }

    function updatePhone(form, setForm, errors, setErrors, part, value) {
        const numericValue = PhoneUtils.digitsOnly(value);

        const phone = PhoneUtils.splitPhone(form.phone);

        const updatedPhone = {
            ...phone,
            [part]: numericValue
        };

        setForm({
            ...form,
            phone: PhoneUtils.formatPhone(updatedPhone.area, updatedPhone.prefix, updatedPhone.line)
        });

        if (errors.phone) {
            const updatedErrors = {...errors};
            delete updatedErrors.phone;
            setErrors(updatedErrors);
        }
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
                            <div className="form-field">
                                <label>First Name</label>
                                <input name="firstName"
                                       className={createErrors.firstName ? 'input-error' : ''}
                                       value={createForm.firstName}
                                       onChange={updateCreateForm}
                                />
                            </div>
                            {createErrors.firstName && <div className="field-error"> * {createErrors.firstName}</div>}
                            <div className="form-field">
                                <label>Last Name</label>
                                <input name="lastName"
                                       className={createErrors.lastName ? 'input-error' : ''}
                                       value={createForm.lastName}
                                       onChange={updateCreateForm}
                                />
                                {createErrors.lastName && <div className="field-error"> * {createErrors.lastName}</div>}
                            </div>
                            <div className="form-field">
                                <label>Preferred Name</label>
                                <input name="preferredName"
                                       value={createForm.preferredName}
                                       onChange={updateCreateForm}
                                />
                            </div>
                            <div className="form-field">
                                <label>Phone</label>
                                <div className="phone-input-group">
                                    <span>(</span>
                                    <input
                                        inputMode="numeric"
                                        maxLength={3}
                                        value={PhoneUtils.splitPhone(createForm.phone).area}
                                        onChange={(event) => updatePhone(createForm, setCreateForm, createErrors, setErrors, 'area', event.target.value)}
                                    />
                                    <span>)</span>
                                    <input
                                        inputMode="numeric"
                                        maxLength={3}
                                        value={PhoneUtils.splitPhone(createForm.phone).prefix}
                                        onChange={(event) => updatePhone(createForm, setCreateForm, createErrors, setErrors, 'prefix', event.target.value)}
                                    />
                                    <span>-</span>
                                    <input
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={PhoneUtils.splitPhone(createForm.phone).line}
                                        onChange={(event) => updatePhone(createForm, setCreateForm, createErrors, setErrors, 'line', event.target.value)}
                                    />
                                </div>
                                {createErrors.phone && <div className="field-error">* {createErrors.phone}</div>}
                            </div>
                            <div className="form-field">
                                <label>Email</label>
                                <input name="email"
                                       className={createErrors.email ? 'input-error' : ''}
                                       value={createForm.email}
                                       onChange={updateCreateForm}
                                />
                                {createErrors.email && <div className="field-error"> * {createErrors.email}</div>}
                            </div>
                            <div className="form-field">
                                <label>Birth Date</label>
                                <input name="birthDate"
                                       type="date"
                                       value={createForm.birthDate}
                                       onChange={updateCreateForm}
                                />
                            </div>
                            <div className="form-field">
                                <label>Goals</label>
                                <textarea name="goals"
                                       value={createForm.goals}
                                       onChange={updateCreateForm}
                                />
                            </div>
                            <div className="form-field">
                                <label>Limitations</label>
                                <textarea name="limitations"
                                       value={createForm.limitations}
                                       onChange={updateCreateForm}
                                />
                            </div>
                            <div className="form-field">
                                <label>General Notes</label>
                                <textarea name="generalNotes"
                                       value={createForm.generalNotes}
                                       onChange={updateCreateForm}
                                />
                            </div>
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

            <section className="client-profile-panel" ref={clientProfileRef}>
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
                                    <span>{selectedClient.phone || 'No phone'}</span>
                                    <span>{selectedClient.email || 'No email'}</span>
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
                                        <div className="form-field">
                                            <label>First Name</label>
                                            <input name="firstName"
                                                   className={editErrors.firstName ? 'input-error' : ''}
                                                   value={editForm.firstName}
                                                   onChange={updateEditForm}
                                            />
                                        </div>
                                        {editErrors.firstName && <div className="field-error"> * {editErrors.firstName}</div>}
                                        <div className="form-field">
                                            <label>Last Name</label>
                                            <input name="lastName"
                                                   className={editErrors.lastName ? 'input-error' : ''}
                                                   value={editForm.lastName}
                                                   onChange={updateEditForm}
                                            />
                                        </div>
                                        {editErrors.lastName && <div className="field-error"> * {editErrors.lastName}</div>}
                                        <div className="form-field">
                                            <label>Preferred Name</label>
                                            <input name="preferredName"
                                                   value={editForm.preferredName}
                                                   onChange={updateEditForm}
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>Phone</label>
                                            <div className="phone-input-group">
                                                <span>(</span>
                                                <input
                                                    inputMode="numeric"
                                                    maxLength={3}
                                                    value={PhoneUtils.splitPhone(editForm.phone).area}
                                                    onChange={(event) => updatePhone(editForm, setEditForm, editErrors, setEditErrors, 'area', event.target.value)}
                                                />
                                                <span>)</span>
                                                <input
                                                    inputMode="numeric"
                                                    maxLength={3}
                                                    value={PhoneUtils.splitPhone(editForm.phone).prefix}
                                                    onChange={(event) => updatePhone(editForm, setEditForm, editErrors, setEditErrors, 'prefix', event.target.value)}
                                                />
                                                <span>-</span>
                                                <input
                                                    inputMode="numeric"
                                                    maxLength={4}
                                                    value={PhoneUtils.splitPhone(editForm.phone).line}
                                                    onChange={(event) => updatePhone(editForm, setEditForm, editErrors, setEditErrors, 'line', event.target.value)}
                                                />
                                            </div>
                                            {editErrors.phone && <div className="field-error">* {editErrors.phone}</div>}
                                        </div>
                                        <div className="form-field">
                                            <label>Email</label>
                                            <input name="email"
                                                   className={editErrors.email ? 'input-error' : ''}
                                                   value={editForm.email}
                                                   onChange={updateEditForm}
                                            />
                                            {editErrors.email && <div className="field-error"> * {editErrors.email}</div>}
                                        </div>
                                        <div className="form-field">
                                            <label>Birth Date</label>
                                            <input name="birthDate"
                                                   type="date"
                                                   value={editForm.birthDate}
                                                   onChange={updateEditForm}
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>Goals</label>
                                            <textarea name="goals"
                                                   value={editForm.goals}
                                                   onChange={updateEditForm}
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>Limitations</label>
                                            <textarea name="limitations"
                                                   value={editForm.limitations}
                                                   onChange={updateEditForm}
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>General Notes</label>
                                            <textarea name="generalNotes"
                                                   value={editForm.generalNotes}
                                                   onChange={updateEditForm}
                                            />
                                        </div>
                                        <button type="submit">Save Changes</button>
                                    </form>
                                </div>
                            )}

                            <div className="profile-card-grid">
                                <div className="profile-card">
                                    <h3>Upcoming Sessions</h3>
                                    <p>No sessions scheduled yet.</p>
                                    <button disabled>+ Schedule Session (Coming Soon)</button>
                                </div>

                                <div className="profile-card">
                                    <h3>Current Workout Plan</h3>
                                    <p>No workout plan assigned yet.</p>
                                    <button disabled>+ Create Workout Plan (Coming Soon)</button>
                                </div>

                                <div className="profile-card">
                                    <h3>Recent Notes</h3>
                                    <p>No notes yet.</p>
                                    <button disabled>+ Add Note (Coming Soon)</button>
                                </div>
                            </div>

                            {!editingDetails && (
                                <div className="profile-card">
                                    <h3>Details</h3>
                                    <p>
                                        <strong>Goals</strong>
                                        <small className="multiline-text">{selectedClient.goals || 'None'}</small>
                                    </p>
                                    <p>
                                        <strong>Limitations</strong>
                                        <small className="multiline-text">{selectedClient.limitations || 'None'}</small>
                                    </p>
                                    <p>
                                        <strong>General Notes</strong>
                                        <small className="multiline-text">{selectedClient.generalNotes || 'None'}</small>
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>
        </div>
    );

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

    function normalizeForm(form) {
        return {
            ...form,
            firstName: TextUtils.normalizeName(form.firstName),
            lastName: TextUtils.normalizeName(form.lastName),
            preferredName: TextUtils.normalizeName(form.preferredName),
            email: TextUtils.normalizeEmail(form.email),
            phone: form.phone.trim(),
            goals: form.goals.trim(),
            limitations: form.limitations.trim(),
            generalNotes: form.generalNotes.trim()
        };
    }

}

export default ClientsPage;