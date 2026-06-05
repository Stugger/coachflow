import './styles/global.css';
import './styles/app-shell.css';
import './styles/auth.css';
import './styles/clients.css';
import './styles/intake.css';
import './styles/appointments.css';
import {useState} from 'react';
import {Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {MOBILE_BREAKPOINT} from './constants/layout';
import {ROUTES} from './constants/routes';
import AuthPage from './pages/AuthPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ClientsPage from './pages/ClientsPage';
import ClientIntakePage from './pages/ClientIntakePage';

function App() {

    // ------------------------------------------------------------------------------------------------------------------------
    // Route state
    // ------------------------------------------------------------------------------------------------------------------------

    const navigate = useNavigate();
    const location = useLocation();

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [auth, setAuth] = useState(() => {
        const savedAuth = localStorage.getItem('coachflow_auth');
        return savedAuth ? JSON.parse(savedAuth) : null;
    });

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function handleAuthSuccess(authResponse) {
        setAuth(authResponse);
        localStorage.setItem('coachflow_auth', JSON.stringify(authResponse));
        navigate(ROUTES.HOME, {replace: true});
    }

    function logout() {
        setAuth(null);
        localStorage.removeItem('coachflow_auth');
        navigate(ROUTES.LOGIN, {replace: true});
    }

    function navigateTo(path) {
        navigate(path);

        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            setSidebarOpen(false);
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Utility
    // ------------------------------------------------------------------------------------------------------------------------

    function getPageTitle() {
        let pageTitle = 'Dashboard';

        if (location.pathname.startsWith(ROUTES.APPOINTMENTS)) {
            pageTitle = 'Appointments';
        } else if (location.pathname.startsWith(ROUTES.CLIENTS)) {
            pageTitle = 'Clients';
        }

        return window.innerWidth > MOBILE_BREAKPOINT
            ? `CoachFlow · ${pageTitle}`
            : pageTitle;
    }

    function isActive(path) {
        if (path === ROUTES.HOME) {
            return location.pathname === ROUTES.HOME;
        }

        return location.pathname.startsWith(path);
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Auth routes
    // ------------------------------------------------------------------------------------------------------------------------

    if (!auth) {
        return (
            <Routes>
                <Route path={ROUTES.LOGIN} element={<AuthPage onAuthSuccess={handleAuthSuccess}/>}/>
                <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace/>}/>
            </Routes>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Intake routes
    // ------------------------------------------------------------------------------------------------------------------------

    if (location.pathname.startsWith('/intake')) {
        return (
            <Routes>
                <Route path={ROUTES.INTAKE_NEW} element={<ClientIntakePage trainerId={auth.trainer.id}/>}/>
                <Route path={ROUTES.INTAKE_BY_ID} element={<ClientIntakePage trainerId={auth.trainer.id}/>}/>
                <Route path="*" element={<Navigate to={ROUTES.HOME} replace/>}/>
            </Routes>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

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

                <button className={`sidebar-button ${isActive(ROUTES.HOME) ? 'active' : ''}`} onClick={() => navigateTo(ROUTES.HOME)}>
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Dashboard</span>
                </button>

                <button className={`sidebar-button ${isActive(ROUTES.APPOINTMENTS) ? 'active' : ''}`} onClick={() => navigateTo(ROUTES.APPOINTMENTS)}>
                    <span className="nav-icon">🗓️</span>
                    <span className="nav-label">Appointments</span>
                </button>

                <button className={`sidebar-button ${isActive(ROUTES.CLIENTS) ? 'active' : ''}`} onClick={() => navigateTo(ROUTES.CLIENTS)}>
                    <span className="nav-icon">👥</span>
                    <span className="nav-label">Clients</span>
                </button>

                <button className="sidebar-button" onClick={logout}>
                    <span className="nav-icon">🚪</span>
                    <span className="nav-label">Logout</span>
                </button>
            </aside>

            <main className="content">
                <Routes>
                    <Route path={ROUTES.HOME} element={<DashboardPage/>}/>
                    <Route path={ROUTES.APPOINTMENTS} element={<AppointmentsPage trainerId={auth.trainer.id}/>}/>
                    <Route path={ROUTES.CLIENTS} element={<ClientsPage trainerId={auth.trainer.id}/>}/>
                    <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.HOME} replace/>}/>
                    <Route path="*" element={<Navigate to={ROUTES.HOME} replace/>}/>
                </Routes>
            </main>
        </div>
    );
}

function DashboardPage() {
    return (
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
    );
}

export default App;