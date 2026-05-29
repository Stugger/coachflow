import {useEffect, useState} from 'react';

function ClientsPage() {

    const [clients, setClients] = useState([]);

    const [selectedClient, setSelectedClient] = useState(null);

    const [form, setForm] = useState({
        trainerId: 1,
        firstName: '',
        lastName: '',
        preferredName: '',
        email: '',
        phone: '',
        birthDate: '',
        goals: '',
        limitations: '',
        generalNotes: ''
    });

    const [errors, setErrors] = useState({});

    function loadClients() {
        fetch('http://localhost:8080/api/clients')
            .then(response => response.json())
            .then(data => setClients(data))
            .catch(error => console.error('Error loading clients:', error));
    }

    useEffect(() => {
        loadClients();
    }, []);

    function updateForm(event) {
        const {name, value} = event.target;

        setForm({
            ...form,
            [name]: value
        });
        if (errors[name]) {
            const updatedErrors = {...errors};
            delete updatedErrors[name];
            setErrors(updatedErrors);
        }
    }

    function createClient(event) {
        event.preventDefault();

        fetch('http://localhost:8080/api/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
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
                setForm({
                    trainerId: 1,
                    firstName: '',
                    lastName: '',
                    preferredName: '',
                    email: '',
                    phone: '',
                    birthDate: '',
                    goals: '',
                    limitations: '',
                    generalNotes: ''
                });

                loadClients();
            })
            .catch(error => console.error('Error creating client:', error));
    }

    return (
        <div>
            <h2>Create Client</h2>

            <form onSubmit={createClient}>
                {errors.trainerId && <div className="field-error">{errors.trainerId}</div>}
                <input name="firstName" className={errors.firstName ? 'input-error' : ''} placeholder="First name" value={form.firstName} onChange={updateForm}/>
                {errors.firstName && <div className="field-error">{errors.firstName}</div>}
                <input name="lastName" className={errors.lastName ? 'input-error' : ''} placeholder="Last name" value={form.lastName} onChange={updateForm}/>
                {errors.lastName && <div className="field-error">{errors.lastName}</div>}
                <input name="preferredName" placeholder="Preferred name" value={form.preferredName} onChange={updateForm}/>
                <input name="email" className={errors.email ? 'input-error' : ''} placeholder="Email" value={form.email} onChange={updateForm}/>
                {errors.email && <div className="field-error">{errors.email}</div>}
                <input name="phone" placeholder="Phone" value={form.phone} onChange={updateForm}/>
                <input name="birthDate" type="date" value={form.birthDate} onChange={updateForm}/>
                <input name="goals" placeholder="Goals" value={form.goals} onChange={updateForm}/>
                <input name="limitations" placeholder="Limitations" value={form.limitations} onChange={updateForm}/>
                <input name="generalNotes" placeholder="General notes" value={form.generalNotes} onChange={updateForm}/>

                <button type="submit">Create Client</button>
            </form>

            <h2>Clients</h2>

            {clients.map(client => (
                <div key={client.id}>
                    <button onClick={() => setSelectedClient(client)}>
                        {client.preferredName || client.firstName} {client.lastName}
                    </button>
                </div>
            ))}

            {selectedClient && (
                <div>
                    <h2>Client Details</h2>
                    <p>Name: {selectedClient.firstName} {selectedClient.lastName}</p>
                    <p>Email: {selectedClient.email}</p>
                    <p>Phone: {selectedClient.phone}</p>
                    <p>Goals: {selectedClient.goals}</p>
                    <p>Limitations: {selectedClient.limitations}</p>
                    <p>Notes: {selectedClient.generalNotes}</p>
                </div>
            )}
        </div>
    );
}

export default ClientsPage;