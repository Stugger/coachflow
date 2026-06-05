export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    CLIENTS: "/clients",
    APPOINTMENTS: "/appointments",
    INTAKE_NEW: "/intake",
    INTAKE_BY_ID: "/intake/:intakeId",
    intake: (intakeId) => `/intake/${intakeId}`,
};