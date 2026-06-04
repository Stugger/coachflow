import {useEffect, useRef, useState} from 'react';
import * as PhoneUtils from '../utils/phone-utils';
import * as TextUtils from '../utils/text-utils';

function ClientsPage({trainerId, navigate}) { //TODO added `navigate` to return to clients page (to be replaced with routing)


    /*-------------------------------------------------------------------------------------------------------------------------------------
        State
    --------------------------------------------------------------------------------------------------------------------------------------*/

    const [clients, setClients] = useState([]);

    const [selectedClient, setSelectedClient] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editErrors, setEditErrors] = useState({});

    const [editingDetails, setEditingDetails] = useState(false);

    const clientProfileRef = useRef(null);

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Effects
    --------------------------------------------------------------------------------------------------------------------------------------*/

    useEffect(() => {
        loadClients();
    }, []);

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Loading
    --------------------------------------------------------------------------------------------------------------------------------------*/

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

    /*-------------------------------------------------------------------------------------------------------------------------------------
        API Actions
    --------------------------------------------------------------------------------------------------------------------------------------*/

    function updateClient(event) {
        event.preventDefault();

        const updatedErrors = validateClientForm(editForm);

        if (Object.keys(updatedErrors).length > 0) {
            setEditErrors(updatedErrors);
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

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Event Handlers
    --------------------------------------------------------------------------------------------------------------------------------------*/

    function selectClient(client) {
        setSelectedClient(client);
        setEditErrors({});
        setEditingDetails(false);
        setEditForm({
            firstName: client.firstName || '',
            lastName: client.lastName || '',
            preferredName: client.preferredName || '',
            email: client.email || '',
            phone: client.phone || '',
            birthDate: client.birthDate || '',
            gender: client.gender || '',
        });
        setTimeout(() => {
            clientProfileRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 200);
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

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Validation
    --------------------------------------------------------------------------------------------------------------------------------------*/

    function validateClientForm(form) {
        const updatedErrors = {};
        if (!form.firstName.trim()) {
            updatedErrors.firstName = 'First name is required';
        }
        if (!form.lastName.trim()) {
            updatedErrors.lastName = 'Last name is required';
        }
        if (!form.birthDate) {
            updatedErrors.birthDate = 'Birth date is required';
        }
        if (!form.phone.trim()) {
            updatedErrors.phone = 'Phone number is required';
        } else {
            const phone = PhoneUtils.splitPhone(form.phone);

            if (PhoneUtils.isPartialPhone(phone.area, phone.prefix, phone.line)) {
                updatedErrors.phone = 'Phone number must be complete';
            }
        }
        return updatedErrors;
    }

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Utility
    --------------------------------------------------------------------------------------------------------------------------------------*/

    function normalizeForm(form) {
        return {
            ...form,
            firstName: TextUtils.normalizeName(form.firstName),
            lastName: TextUtils.normalizeName(form.lastName),
            preferredName: TextUtils.normalizeName(form.preferredName),
            email: TextUtils.normalizeEmail(form.email),
            phone: form.phone.trim(),
            gender: form.gender || null,
        };
    }

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Main Return
    --------------------------------------------------------------------------------------------------------------------------------------*/

    return (
        <div className="clients-page">
            <section className="client-list-panel">
                <div className="page-header">
                    <div>
                        <p>Manage your clients.</p>
                    </div>

                    <button onClick={() => navigate('intake')}>
                        + New Client
                    </button>
                </div>
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
                                                   placeholder={"Optional"}
                                                   value={editForm.preferredName}
                                                   onChange={updateEditForm}
                                            />
                                        </div>

                                        <div className="section-divider spaced" />

                                        <div className="form-field">
                                            <label>Phone</label>
                                            <input
                                                name="phone"
                                                inputMode="tel"
                                                placeholder="Digits only"
                                                className={editErrors.phone ? 'input-error' : ''}
                                                value={editForm.phone}
                                                onChange={(event) => {
                                                    setEditForm({
                                                        ...editForm,
                                                        phone: PhoneUtils.formatPhoneFromDigits(event.target.value)
                                                    });
                                                    if (editErrors.phone) {
                                                        const updatedErrors = {...editErrors};
                                                        delete updatedErrors.phone;
                                                        setEditErrors(updatedErrors);
                                                    }
                                                }}
                                            />
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

                                        <div className="section-divider spaced" />

                                        <div className="form-field">
                                            <label>Birth Date</label>
                                            <input name="birthDate"
                                                   className={editErrors.birthDate ? 'input-error' : ''}
                                                   type="date"
                                                   value={editForm.birthDate}
                                                   onChange={updateEditForm}
                                            />
                                            {editErrors.birthDate && <div className="field-error"> * {editErrors.birthDate}</div>}
                                        </div>
                                        <div className="form-field">
                                            <label>Gender</label>
                                            <select
                                                name="gender"
                                                value={editForm.gender}
                                                onChange={updateEditForm}
                                            >
                                                <option value="">Select gender</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="NON_BINARY">Non-binary</option>
                                                <option value="UNDISCLOSED">Prefer not to say</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit">Save Changes</button>
                                        </div>
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
                )}
            </section>
        </div>
    );
}

export default ClientsPage;