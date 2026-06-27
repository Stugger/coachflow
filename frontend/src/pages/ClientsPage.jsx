import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiFetch} from '../utils/api-client.js';
import {
    Badge,
    Button,
    Group,
    LoadingOverlay,
    Paper,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Table,
    Text,
    Title,
    Box,
    Tooltip,
} from '@mantine/core';
import {
    IconPlus,
} from '@tabler/icons-react';

import {ROUTES} from '../constants/routes';
import ClientCard from '../components/clients/ClientCard';
import ClientMobileRow from '../components/clients/ClientMobileRow';
import ClientTableRow from '../components/clients/ClientTableRow';

function ClientsPage() {

    // ------------------------------------------------------------------------------------------------------------------------
    // Route state
    // ------------------------------------------------------------------------------------------------------------------------

    const navigate = useNavigate();

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [clients, setClients] = useState([]);
    const [intakes, setIntakes] = useState([]);

    const [clientsLoaded, setClientsLoaded] = useState(false);
    const [intakesLoaded, setIntakesLoaded] = useState(false);

    const loading = !clientsLoaded || !intakesLoaded;

    // ------------------------------------------------------------------------------------------------------------------------
    // Stored state
    // ------------------------------------------------------------------------------------------------------------------------

    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('clients_view_mode') || 'cards';
    });

    const [clientFilter, setClientFilter] = useState(() => {
        return localStorage.getItem('clients_filter') || 'active';
    });

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived clients
    // ------------------------------------------------------------------------------------------------------------------------

    const sortedClients = [...clients].sort((a, b) => {
        const aStatus = getClientReviewStatus(a.id);
        const bStatus = getClientReviewStatus(b.id);
        const getPriority = (status) => {
            if (status === 'INTAKE') {
                return 0;
            }
            if (status === 'ASSESS') {
                return 1;
            }
            return 2;
        };
        return getPriority(aStatus) - getPriority(bStatus);
    });

    const visibleClients = sortedClients.filter(client => {
        if (clientFilter === 'archived') {
            return client.archived;
        }

        return !client.archived;
    });

    const activeClientCount = clients.filter(client => !client.archived).length;
    const archivedClientCount = clients.filter(client => client.archived).length;

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        loadClients();
        loadIntakes();
    }, []);

    // ------------------------------------------------------------------------------------------------------------------------
    // API loading
    // ------------------------------------------------------------------------------------------------------------------------

    function loadClients() {
        setClientsLoaded(false);
        apiFetch('/api/clients')
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to load clients');
                }

                return response.json();
            })
            .then(data => {
                setClients(Array.isArray(data) ? data : []);
            })
            .catch(error => {
                console.error('Error loading clients:', error);
                setClients([]);
            })
            .finally(() => {
                setClientsLoaded(true);
            });
    }

    function loadIntakes() {
        setIntakesLoaded(false);
        apiFetch('/api/client-intakes')
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to load intake drafts');
                }

                return response.json();
            })
            .then(intakes => {
                setIntakes(intakes);
            })
            .catch(error => {
                console.error('Error loading intake drafts:', error);
                setIntakes([]);
            })
            .finally(() => {
                setIntakesLoaded(true);
            });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Route/query param helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function selectClient(client) {
        navigate(ROUTES.clientProfile(client.id));
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function changeViewMode(value) {
        setViewMode(value);
        localStorage.setItem('clients_view_mode', value);
    }

    function changeClientFilter(value) {
        setClientFilter(value);
        localStorage.setItem('clients_filter', value);
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Utility
    // ------------------------------------------------------------------------------------------------------------------------

    function getIncompleteIntakeForClient(clientId) {
        return intakes.find(intake =>
            String(intake.clientId) === String(clientId)
            && intake.status !== 'COMPLETED'
        );
    }

    function getCompletedIntakeForClient(clientId) {
        return intakes.find(intake =>
            String(intake.clientId) === String(clientId)
            && intake.status === 'COMPLETED'
        );
    }

    function hasInitialAssessment(clientId) {
        //TODO, if the client does not have any assessments in database, then that indicates they need an initial assessment
        //and if they have 1 assessment but it is incomplete then that indicates their initial assessment is incomplete
        return false;
    }

    function getClientReviewStatus(clientId) {
        if (getIncompleteIntakeForClient(clientId)) {
            return 'INTAKE';
        }
        if (getCompletedIntakeForClient(clientId) && !hasInitialAssessment(clientId)) {
            return 'ASSESS';
        }
        return null;
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderEmptyState() {
        return (
            <Paper withBorder radius="md" p="xl">
                <Stack align="center" gap="xs">
                    <Title order={4}>No clients found</Title>
                    <Text c="dimmed" ta="center">
                        {clientFilter === 'archived'
                            ? 'Archived clients will appear here.'
                            : 'Create your first client to get started.'}
                    </Text>

                    {clientFilter === 'active' && (
                        <Button leftSection={<IconPlus size={16}/>} onClick={() => navigate(ROUTES.INTAKE_NEW)}>
                            New Client
                        </Button>
                    )}
                </Stack>
            </Paper>
        );
    }

    function renderClientCards() {
        return (
            <SimpleGrid cols={{base: 1, sm: 2, lg: 3, xl: 4}}>
                {visibleClients.map(client => (
                    <ClientCard
                        key={client.id}
                        client={client}
                        reviewStatus={getClientReviewStatus(client.id)}
                        onClick={() => selectClient(client)}
                    />
                ))}
            </SimpleGrid>
        );
    }

    function renderClientList() {
        return (
            <>
                {/* Mobile */}
                <Box hiddenFrom="sm">
                    <Table verticalSpacing="sm" highlightOnHover stickyHeader style={{tableLayout: 'fixed', width: '100%'}}>
                        <Table.Tbody>
                            {visibleClients.map(client => (
                                <ClientMobileRow
                                    key={client.id}
                                    client={client}
                                    reviewStatus={getClientReviewStatus(client.id)}
                                    onClick={() => selectClient(client)}
                                />
                            ))}
                        </Table.Tbody>
                    </Table>
                </Box>

                {/* Desktop */}
                <Box visibleFrom="sm">
                    <Table.ScrollContainer minWidth={"48rem"}>
                        <Table verticalSpacing="sm" highlightOnHover stickyHeader>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w={"30%"}>Client</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Phone</Table.Th>
                                    <Table.Th>Email</Table.Th>
                                    <Table.Th w={"5%"}/>
                                </Table.Tr>
                            </Table.Thead>

                            <Table.Tbody>
                                {visibleClients.map(client => (
                                    <ClientTableRow
                                        key={client.id}
                                        client={client}
                                        reviewStatus={getClientReviewStatus(client.id)}
                                        onClick={() => selectClient(client)}
                                    />
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Box>
            </>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Stack gap="md" pos="relative">
            <LoadingOverlay visible={loading} overlayProps={{blur: 2}}/>

            <Stack gap={2}>
                <Group justify="space-between" align="flex-start">
                    <Title order={1}>Clients</Title>
                    <Button leftSection={<IconPlus size={16}/>} onClick={() => navigate(ROUTES.INTAKE_NEW)}>
                        New Client
                    </Button>
                </Group>
                <Text c="dimmed" size="sm">
                    Manage your clients. Select a client to view their profile.
                </Text>
            </Stack>

            <Paper pos="relative" p="md" radius="md" withBorder>
                <Stack>
                    <Stack gap="sm">
                        <Group>
                            <SegmentedControl
                                radius="lg"
                                size="xs"
                                w={200}
                                data={[
                                    {
                                        value: 'active',
                                        label: (
                                            <Tooltip label="Show active clients" position="top" withArrow arrowSize={6}>
                                                <Text size="xs" fw={600}>Active ({activeClientCount})</Text>
                                            </Tooltip>
                                        ),
                                    },
                                    {
                                        value: 'archived',
                                        label: (
                                            <Tooltip label="Show archived clients" position="top" withArrow arrowSize={6}>
                                                <Text size="xs" fw={600}>Archived ({archivedClientCount})</Text>
                                            </Tooltip>
                                        ),
                                    },
                                ]}
                                value={clientFilter}
                                onChange={changeClientFilter}
                            />
                        </Group>
                        <SegmentedControl
                            data={[
                                {label: 'Cards', value: 'cards'},
                                {label: 'List', value: 'list'},
                            ]}
                            value={viewMode}
                            onChange={changeViewMode}
                        />
                    </Stack>
                    {!loading && visibleClients.length === 0 && renderEmptyState()}
                    {!loading && visibleClients.length > 0 && viewMode === 'cards' && renderClientCards()}
                    {!loading && visibleClients.length > 0 && viewMode === 'list' && renderClientList()}
                </Stack>
            </Paper>
        </Stack>
    );
}

export default ClientsPage;