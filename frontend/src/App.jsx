import './styles/global.css';
import './styles/app-shell.css';
import './styles/auth.css';
import './styles/clients.css';
import './styles/intake.css';
import './styles/appointments.css';
import {useState} from 'react';
import {MOBILE_BREAKPOINT} from './constants/layout';
import {Pages} from './constants/layout';
import AuthPage from './pages/AuthPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ClientsPage from './pages/ClientsPage';
import ClientIntakePage from './pages/ClientIntakePage';

function App() {

    /*-------------------------------------------------------------------------------------------------------------------------------------
        State
    --------------------------------------------------------------------------------------------------------------------------------------*/

    const [auth, setAuth] = useState(() => {
        const savedAuth = localStorage.getItem('coachflow_auth');
        return savedAuth ? JSON.parse(savedAuth) : null;
    });

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [page, setPage] = useState(() => {
        return localStorage.getItem('coachflow_page') || Pages.DASHBOARD;
    });

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Event Handlers
    --------------------------------------------------------------------------------------------------------------------------------------*/

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

    /*-------------------------------------------------------------------------------------------------------------------------------------
         Utility
     --------------------------------------------------------------------------------------------------------------------------------------*/

    function getPageTitle() {
        let pageTitle = '';
        if (page === Pages.DASHBOARD) {
            pageTitle = 'Dashboard';
        } else if (page === Pages.APPOINTMENTS) {
            pageTitle = 'Appointments';
        } else if (page === Pages.CLIENTS) {
            pageTitle = 'Clients';
        } else if (page === Pages.CLIENT_INTAKE) {
            pageTitle = 'Client Intake';
        }
        return window.innerWidth > MOBILE_BREAKPOINT
            ? `CoachFlow · ${pageTitle}`
            : pageTitle;
    }

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Main Return
    --------------------------------------------------------------------------------------------------------------------------------------*/

    return (
        <>
        {page !== Pages.CLIENT_INTAKE ? (
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

                    <button className={`sidebar-button ${page === Pages.DASHBOARD ? 'active' : ''}`} onClick={() => navigate(Pages.DASHBOARD)}>
                        <span className="nav-icon">🏠</span>
                        <span className="nav-label">Dashboard</span>
                    </button>

                    <button className={`sidebar-button ${page === Pages.APPOINTMENTS ? 'active' : ''}`} onClick={() => navigate(Pages.APPOINTMENTS)}>
                        <span className="nav-icon">🗓️</span>
                        <span className="nav-label">Appointments</span>
                    </button>

                    <button className={`sidebar-button ${page === Pages.CLIENTS ? 'active' : ''}`} onClick={() => navigate(Pages.CLIENTS)}>
                        <span className="nav-icon">👥</span>
                        <span className="nav-label">Clients</span>
                    </button>

                    <button className="sidebar-button" onClick={logout}>
                        <span className="nav-icon">🚪</span>
                        <span className="nav-label">Logout</span>
                    </button>
                </aside>

                <main className="content">
                    {page === Pages.DASHBOARD && (
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

                    {page === Pages.APPOINTMENTS && (
                        <AppointmentsPage trainerId={auth.trainer.id}/>
                    )}

                    {page === Pages.CLIENTS && (
                        <ClientsPage
                            trainerId={auth.trainer.id}
                            navigate={navigate} //to navigate to intake page TODO will likely be removed when routing exists
                        />
                    )}
                </main>
            </div>
            ) : (
            <ClientIntakePage
                trainerId={auth.trainer.id}
                navigate={navigate} //to return to clients page TODO will likely be removed when routing exists
            />
        )}
        </>
    );
}

export default App;