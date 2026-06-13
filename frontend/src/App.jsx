import './styles/global.css';
import './styles/app-shell.css';
import './styles/clients.css';

import {useState} from 'react';
import {Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';

import {ROUTES} from './constants/routes';

import AuthPage from './pages/AuthPage';
import ClientIntakePage from './pages/ClientIntakePage';
import ClientsPage from './pages/ClientsPage';
import ClientProfilePage from './pages/ClientProfilePage';
import AppointmentsPage from './pages/AppointmentsPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';

import AppShell from './components/AppShell';

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
    // App routes
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Routes>
            <Route element={<AppShell auth={auth} onLogout={logout}/>}>
                <Route path={ROUTES.HOME} element={<DashboardPage/>}/>

                <Route path={ROUTES.CLIENTS} element={<ClientsPage trainerId={auth.trainer.id}/>}/>
                <Route path={ROUTES.CLIENT_BY_ID} element={<ClientProfilePage trainerId={auth.trainer.id}/>}/>
                <Route path={ROUTES.CLIENT_HISTORY} element={<ClientProfilePage trainerId={auth.trainer.id}/>}/>
                <Route path={ROUTES.CLIENT_PROGRAMS} element={<ClientProfilePage trainerId={auth.trainer.id}/>}/>
                <Route path={ROUTES.CLIENT_RECORDS} element={<ClientProfilePage trainerId={auth.trainer.id}/>}/>
                <Route path={ROUTES.CLIENT_HABITS} element={<ClientProfilePage trainerId={auth.trainer.id}/>}/>
                <Route path={ROUTES.CLIENT_MEASUREMENTS} element={<ClientProfilePage trainerId={auth.trainer.id}/>}/>

                <Route path={ROUTES.EXERCISES} element={<ExerciseLibraryPage trainerId={auth.trainer.id}/>}/>
                <Route path={ROUTES.APPOINTMENTS} element={<AppointmentsPage trainerId={auth.trainer.id}/>}/>

                <Route path="*" element={<Navigate to={ROUTES.HOME} replace/>}/>
            </Route>
        </Routes>
    );
}

// ------------------------------------------------------------------------------------------------------------------------
// Temp Dashboard page - TODO
// ------------------------------------------------------------------------------------------------------------------------

function DashboardPage() {
    return (
        <div className="dashboard-page">
            <h1>Dashboard</h1>
            <p>Under Construction</p>
        </div>
    );
}

export default App;