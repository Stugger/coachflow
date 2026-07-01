import {ROUTES} from '../../../constants/routes.js';

export const CLIENT_PROFILE_TABS = [
    {
        value: 'history',
        label: 'History',
        path: ROUTES.clientHistory,
    },
    {
        value: 'programs',
        label: 'Programs',
        path: ROUTES.clientPrograms,
    },
    {
        value: 'records',
        label: 'Records',
        path: ROUTES.clientRecords,
    },
    {
        value: 'habits',
        label: 'Habits',
        path: ROUTES.clientHabits,
    },
    {
        value: 'measurements',
        label: 'Measurements',
        path: ROUTES.clientMeasurements,
    },
];

export function getClientProfileActiveTab(pathname) {
    const routeSegment = pathname.split('/').at(-1);

    return CLIENT_PROFILE_TABS.some(tab => tab.value === routeSegment)
        ? routeSegment
        : 'history';
}

export function getClientProfileTabPath(clientId, tabValue) {
    const tab = CLIENT_PROFILE_TABS.find(tab => tab.value === tabValue);

    return tab?.path(clientId) ?? ROUTES.clientHistory(clientId);
}