import './styles/app-shell.css';
import './styles/global.css';
import './styles/input.css';

import {useCallback, useEffect, useState} from 'react';
import {matchPath, Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';

import {clearStoredAuth, getStoredAuth, saveAuth} from './utils/auth-storage.js';

import {API_UNAUTHORIZED_EVENT} from './utils/api-client.js';

import {ROUTES} from './constants/routes';

import AuthPage from './pages/AuthPage';
import ClientIntakePage from './features/client-management/intake/ClientIntakePage';
import ClientsPage from './features/client-management/client-list/ClientsPage';
import ClientProfilePage from './features/client-management/client-profile/ClientProfilePage';
import ClientWorkoutSessionPage from './features/client-management/client-workouts/session/ClientWorkoutSessionPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage';
import ExerciseLibraryPage from './features/exercises/library/ExerciseLibraryPage';
import WorkoutLibraryPage from './features/workout-library/WorkoutLibraryPage';

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

    const [auth, setAuth] = useState(getStoredAuth);

    // ------------------------------------------------------------------------------------------------------------------------
    // Auth event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function handleAuthSuccess(authResponse) {
        setAuth(authResponse);
        saveAuth(authResponse);
        navigate(ROUTES.HOME, {replace: true});
    }

    const logout = useCallback(() => {
        setAuth(null);
        clearStoredAuth();
        navigate(ROUTES.LOGIN, {replace: true});
    }, [navigate]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        window.addEventListener(API_UNAUTHORIZED_EVENT, logout);

        return () => {
            window.removeEventListener(API_UNAUTHORIZED_EVENT, logout);
        };
    }, [logout]);

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
                <Route path={ROUTES.INTAKE_NEW} element={<ClientIntakePage/>}/>
                <Route path={ROUTES.INTAKE_BY_ID} element={<ClientIntakePage/>}/>
                <Route path="*" element={<Navigate to={ROUTES.HOME} replace/>}/>
            </Routes>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Workout session routes
    // ------------------------------------------------------------------------------------------------------------------------

    const clientWorkoutSessionRoute = matchPath(
        {path: ROUTES.CLIENT_WORKOUT_SESSION, end: true},
        location.pathname,
    ) ?? matchPath(
        {path: ROUTES.CLIENT_WORKOUT_SESSION_ITEM, end: true},
        location.pathname,
    );

    if (clientWorkoutSessionRoute) {
        return (
            <Routes>
                <Route path={ROUTES.CLIENT_WORKOUT_SESSION} element={<ClientWorkoutSessionPage/>}/>
                <Route path={ROUTES.CLIENT_WORKOUT_SESSION_ITEM} element={<ClientWorkoutSessionPage/>}/>
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

                <Route path={ROUTES.CLIENTS} element={<ClientsPage/>}/>
                <Route path={ROUTES.CLIENT_BY_ID} element={<ClientProfilePage/>}/>
                <Route path={ROUTES.CLIENT_HISTORY} element={<ClientProfilePage/>}/>
                <Route path={ROUTES.CLIENT_PROGRAMS} element={<ClientProfilePage/>}/>
                <Route path={ROUTES.CLIENT_RECORDS} element={<ClientProfilePage/>}/>
                <Route path={ROUTES.CLIENT_HABITS} element={<ClientProfilePage/>}/>
                <Route path={ROUTES.CLIENT_MEASUREMENTS} element={<ClientProfilePage/>}/>

                <Route path={ROUTES.EXERCISES} element={<ExerciseLibraryPage/>}/>
                <Route path={ROUTES.WORKOUT_TEMPLATES} element={<WorkoutLibraryPage trainerId={auth.trainer.id}/>}/>

                <Route path={ROUTES.APPOINTMENTS} element={<AppointmentsPage/>}/>

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