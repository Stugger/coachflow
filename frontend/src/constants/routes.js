export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    CLIENTS: "/clients",
    selectedClient: (clientId) => `/clients?selected=${clientId}`,
    APPOINTMENTS: "/appointments",
    INTAKE_NEW: "/intake",
    INTAKE_BY_ID: "/intake/:intakeId",
    intake: (intakeId) => `/intake/${intakeId}`,
};