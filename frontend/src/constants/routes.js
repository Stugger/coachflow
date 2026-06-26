export const ROUTES = {

    HOME: "/",
    LOGIN: "/login",

    /* Client Intake */

    INTAKE_NEW: "/intake",
    INTAKE_BY_ID: "/intake/:intakeId",
    intake: (intakeId) => `/intake/${intakeId}`,

    /* Client */

    CLIENTS: "/clients",
    CLIENT_BY_ID: '/clients/:clientId',
    CLIENT_HISTORY: '/clients/:clientId/history',
    CLIENT_PROGRAMS: '/clients/:clientId/programs',
    CLIENT_RECORDS: '/clients/:clientId/records',
    CLIENT_HABITS: '/clients/:clientId/habits',
    CLIENT_MEASUREMENTS: '/clients/:clientId/measurements',

    clientProfile: (clientId) => `/clients/${clientId}/history`,
    clientHistory: (clientId) => `/clients/${clientId}/history`,
    clientPrograms: (clientId) => `/clients/${clientId}/programs`,
    clientRecords: (clientId) => `/clients/${clientId}/records`,
    clientHabits: (clientId) => `/clients/${clientId}/habits`,
    clientMeasurements: (clientId) => `/clients/${clientId}/measurements`,

    /* Exercise Library */

    EXERCISES: "/exercises",

    /* Workout Library */

    WORKOUT_TEMPLATES: "/workout-templates",

    workoutLibraryNew: () => "/workout-templates?editor=new",
    workoutLibraryEdit: (templateId) => `/workout-templates?editor=edit&templateId=${templateId}`,
    workoutLibraryCopy: (templateId) => `/workout-templates?editor=copy&templateId=${templateId}`,

    /* Appointment */

    APPOINTMENTS: "/appointments",

};