import './App.css'
import {useState} from 'react';
import ClientsPage from './pages/ClientsPage';

function App() {

    const [page, setPage] = useState('clients');

    return (
        <div className="app">

            <aside className="sidebar">
                <h2>CoachFlow</h2>

                <button onClick={() => setPage('dashboard')}>
                    Dashboard
                </button>

                <button onClick={() => setPage('clients')}>
                    Clients
                </button>
            </aside>

            <main className="content">

                {page === 'dashboard' && (
                    <div>
                        <h2>Dashboard</h2>
                    </div>
                )}

                {page === 'clients' && (
                    <ClientsPage />
                )}

            </main>
        </div>
    );
}

export default App;