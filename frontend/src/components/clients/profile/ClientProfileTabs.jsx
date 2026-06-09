import {Scroller, Paper, Tabs} from '@mantine/core';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {ROUTES} from '../../../constants/routes';

function ClientProfileTabs() {
    const navigate = useNavigate();
    const location = useLocation();
    const {clientId} = useParams();

    function getActiveTab() {
        if (location.pathname.endsWith('/programs')) {
            return 'programs';
        }
        if (location.pathname.endsWith('/records')) {
            return 'records';
        }
        if (location.pathname.endsWith('/habits')) {
            return 'habits';
        }
        if (location.pathname.endsWith('/measurements')) {
            return 'measurements';
        }
        return 'history';
    }

    function changeTab(value) {
        if (value === 'history') {
            navigate(ROUTES.clientHistory(clientId));
        }
        if (value === 'programs') {
            navigate(ROUTES.clientPrograms(clientId));
        }
        if (value === 'records') {
            navigate(ROUTES.clientRecords(clientId));
        }
        if (value === 'habits') {
            navigate(ROUTES.clientHabits(clientId));
        }
        if (value === 'measurements') {
            navigate(ROUTES.clientMeasurements(clientId));
        }
    }

    return (
        <Paper withBorder radius="md" p="sm" style={{ borderRadius: '1rem 1rem 0 0' }}>
            <Tabs
                value={getActiveTab()}
                onChange={changeTab}
                variant="default"
                radius="md"
            >
                <Scroller scrollAmount={120}>
                    <Tabs.List pt="xs" style={{ flexWrap: 'nowrap' }}>
                        <Tabs.Tab value="history">History</Tabs.Tab>
                        <Tabs.Tab value="programs">Programs</Tabs.Tab>
                        <Tabs.Tab value="records">Records</Tabs.Tab>
                        <Tabs.Tab value="habits">Habits</Tabs.Tab>
                        <Tabs.Tab value="measurements">Measurements</Tabs.Tab>
                    </Tabs.List>
                </Scroller>
            </Tabs>
        </Paper>
    );
}

export default ClientProfileTabs;