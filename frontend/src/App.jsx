import './App.css';
import {useState} from 'react';
import ClientsPage from './pages/ClientsPage';
import AuthPage from './pages/AuthPage';

function App() {

    const [auth, setAuth] = useState(() => {
        const savedAuth = localStorage.getItem('coachflow_auth');
        return savedAuth ? JSON.parse(savedAuth) : null;
    });

    const [page, setPage] = useState('clients');

    function handleAuthSuccess(authResponse) {
        setAuth(authResponse);
        localStorage.setItem('coachflow_auth', JSON.stringify(authResponse));
    }

    function logout() {
        setAuth(null);
        localStorage.removeItem('coachflow_auth');
    }

    if (!auth) {
        return <AuthPage onAuthSuccess={handleAuthSuccess}/>;
    }

    return (
        <div className="app">
            <aside className="sidebar">
                <h2>CoachFlow</h2>

                <p>{auth.trainer.firstName} {auth.trainer.lastName}</p>

                <button className="sidebar-button" onClick={() => setPage('dashboard')}>
                    Dashboard
                </button>

                <button className="sidebar-button" onClick={() => setPage('clients')}>
                    Clients
                </button>

                <button className="sidebar-button" onClick={logout}>
                    Logout
                </button>
            </aside>

            <main className="content">
                {page === 'dashboard' && (
                    <div>
                        <h2>Dashboard</h2>
                    </div>
                )}

                {page === 'clients' && (
                    <ClientsPage trainerId={auth.trainer.id}/>
                )}
            </main>
        </div>
    );
}

export default App;