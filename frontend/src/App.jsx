import './styles/global.css';
import './styles/app-shell.css';
import './styles/auth.css';
import './styles/clients.css';
import {useState} from 'react';
import ClientsPage from './pages/ClientsPage';
import AuthPage from './pages/AuthPage';
import {MOBILE_BREAKPOINT} from './constants/layout';

function App() {

    const [auth, setAuth] = useState(() => {
        const savedAuth = localStorage.getItem('coachflow_auth');
        return savedAuth ? JSON.parse(savedAuth) : null;
    });

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [page, setPage] = useState(() => {
        return localStorage.getItem('coachflow_page') || 'dashboard';
    });

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

    function navigate(page) {
        setPage(page);
        localStorage.setItem('coachflow_page', page);
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            setSidebarOpen(false);
        }
    }

    function getPageTitle() {
        let pageTitle = '';
        if (page === 'dashboard') {
            pageTitle = 'Dashboard';
        } else if (page === 'clients') {
            pageTitle = 'Clients';
        }
        return window.innerWidth > MOBILE_BREAKPOINT
            ? `CoachFlow · ${pageTitle}`
            : pageTitle;
    }

    return (
        <div className={`app ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
            <header className="app-header">
                <button className="hamburger-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    ☰
                </button>

                <h1>{getPageTitle()}</h1>
            </header>

            <aside className="sidebar">
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {auth.trainer.firstName.charAt(0).toUpperCase()}
                        {auth.trainer.lastName.charAt(0).toUpperCase()}
                    </div>

                    <span className="nav-label">
                        {auth.trainer.firstName} {auth.trainer.lastName}
                    </span>
                </div>

                <button className={`sidebar-button ${page === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('dashboard')}>
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Dashboard</span>
                </button>

                <button className={`sidebar-button ${page === 'clients' ? 'active' : ''}`} onClick={() => navigate('clients')}>
                    <span className="nav-icon">👥</span>
                    <span className="nav-label">Clients</span>
                </button>

                <button className="sidebar-button" onClick={logout}>
                    <span className="nav-icon">🚪</span>
                    <span className="nav-label">Logout</span>
                </button>
            </aside>

            <main className="content">
                {page === 'dashboard' && (
                    <div className="dashboard-page">
                        <section className="profile-card">
                            <h2>Under Construction</h2>
                            <p>
                                The Dashboard will become the main landing page for users after logging in.
                            </p>
                            <p>
                                Planned sections include upcoming sessions, today's schedule, recent client activity,
                                workout plan reminders, and quick actions.
                            </p>
                            <p>
                                What is included on this page will vary between trainers and clients, depending on which role is logged in.
                            </p>
                        </section>
                        <sectiion></sectiion>
                        <div className="profile-card-grid">
                            <div className="profile-card">
                                <h3>Upcoming Sessions</h3>
                                <p>Future sessions and calendar items will appear here.</p>
                                <button disabled>Coming Soon</button>
                            </div>

                            <div className="profile-card">
                                <h3>Recent Client Activity</h3>
                                <p>Recent notes, updates, and completed sessions will appear here.</p>
                                <button disabled>Coming Soon</button>
                            </div>

                            <div className="profile-card">
                                <h3>Quick Actions</h3>
                                <p>Fast shortcuts for adding clients, scheduling sessions, and creating plans.</p>
                                <button disabled>Coming Soon</button>
                            </div>
                        </div>
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