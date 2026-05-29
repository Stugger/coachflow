import {useEffect, useState} from 'react';

function ClientsPage() {

    const [clients, setClients] = useState([]);

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
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create client');
                }
                return response.json();
            })
            .then(() => {
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
                <input name="firstName" placeholder="First name" value={form.firstName} onChange={updateForm}/>
                <input name="lastName" placeholder="Last name" value={form.lastName} onChange={updateForm}/>
                <input name="preferredName" placeholder="Preferred name" value={form.preferredName}
                       onChange={updateForm}/>
                <input name="email" placeholder="Email" value={form.email} onChange={updateForm}/>
                <input name="phone" placeholder="Phone" value={form.phone} onChange={updateForm}/>
                <input name="birthDate" type="date" value={form.birthDate} onChange={updateForm}/>
                <input name="goals" placeholder="Goals" value={form.goals} onChange={updateForm}/>
                <input name="limitations" placeholder="Limitations" value={form.limitations} onChange={updateForm}/>
                <input name="generalNotes" placeholder="General notes" value={form.generalNotes}
                       onChange={updateForm}/>

                <button type="submit">Create Client</button>
            </form>

            <h2>Clients</h2>

            {clients.map(client => (
                <div key={client.id}>
                    {client.preferredName || client.firstName} {client.lastName}
                </div>
            ))}
        </div>
    );
}

export default ClientsPage;