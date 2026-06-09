import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {
    Badge,
    Button,
    Group,
    LoadingOverlay,
    Modal,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import { DateInput, DatePickerInput, TimeInput } from '@mantine/dates';
import {
    IconCalendar,
    IconCalendarEvent,
    IconClock,
    IconHistory,
    IconPlus,
    IconTrash,
    IconAlertTriangle,
} from '@tabler/icons-react';
import * as TimeUtils from '../utils/time-utils';

function AppointmentsPage({trainerId}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Route state
    // ------------------------------------------------------------------------------------------------------------------------

    const [searchParams, setSearchParams] = useSearchParams();

    const selectedAppointmentId = searchParams.get('selected');
    const reviewAppointmentId = searchParams.get('review');
    const routedAppointmentId = reviewAppointmentId || selectedAppointmentId;

    // ------------------------------------------------------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------------------------------------------------------

    const DEFAULT_DAYS_TO_SHOW = 7;
    const MAX_DAYS_TO_SHOW = 28;

    const DURATION_OPTIONS = [
        {value: '30', label: '30 minutes'},
        {value: '45', label: '45 minutes'},
        {value: '60', label: '1 hour'},
        {value: '90', label: '1.5 hours'},
        {value: '120', label: '2 hours'},
    ];

    const STATUS_OPTIONS = [
        {value: 'SCHEDULED', label: 'Scheduled'},
        {value: 'COMPLETED', label: 'Completed'},
        {value: 'MISSED', label: 'Missed'},
        {value: 'CANCELLED', label: 'Cancelled'},
    ];

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived route values
    // ------------------------------------------------------------------------------------------------------------------------

    const daysParam = Number(searchParams.get('days'));

    const daysToShow = Number.isInteger(daysParam)
        ? Math.min(Math.max(daysParam, DEFAULT_DAYS_TO_SHOW), MAX_DAYS_TO_SHOW)
        : DEFAULT_DAYS_TO_SHOW;

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [appointments, setAppointments] = useState([]);
    const [clients, setClients] = useState([]);

    const [appointmentsLoaded, setAppointmentsLoaded] = useState(false);
    const [clientsLoaded, setClientsLoaded] = useState(false);

    const loading = !appointmentsLoaded || !clientsLoaded;

    const [showCreateForm, setShowCreateForm] = useState(false);

    const [createForm, setCreateForm] = useState({
        trainerId: trainerId,
        clientId: '',
        title: '',
        date: '',
        startTime: '',
        durationMinutes: '60',
        notes: ''
    });

    const [editingAppointmentId, setEditingAppointmentId] = useState(null);

    const [editForm, setEditForm] = useState({
        clientId: '',
        title: '',
        date: '',
        startTime: '',
        durationMinutes: '60',
        status: 'SCHEDULED',
        notes: ''
    });

    const [createErrors, setCreateErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteAppointmentId, setDeleteAppointmentId] = useState(null);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived appointment lists
    // ------------------------------------------------------------------------------------------------------------------------

    const now = new Date();

    const needsReviewAppointments = appointments
        .filter(appointment =>
            appointment.status === 'SCHEDULED' && new Date(appointment.endTime) < now
        );

    const upcomingAppointments = appointments
        .filter(appointment =>
            new Date(appointment.endTime) >= now
        );

    const historyAppointments = appointments
        .filter(appointment =>
            appointment.status !== 'SCHEDULED' && new Date(appointment.endTime) < now
        )
        .sort((a, b) =>
            new Date(b.startTime) - new Date(a.startTime)
        );

    const clientOptions = clients.map(client => ({
        value: String(client.id),
        label: `${client.firstName} ${client.lastName}`,
    }));

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        loadAppointments();
        loadClients();
    }, []);

    useEffect(() => {
        if (!routedAppointmentId) {
            setEditingAppointmentId(null);
            setEditErrors({});
            return;
        }

        const appointment = appointments.find(appointment =>
            String(appointment.id) === routedAppointmentId
        );

        if (!appointment) {
            return;
        }

        if (String(editingAppointmentId) === routedAppointmentId) {
            return;
        }

        beginEditAppointment(appointment);
    }, [routedAppointmentId, appointments]);

    // ------------------------------------------------------------------------------------------------------------------------
    // API loading
    // ------------------------------------------------------------------------------------------------------------------------

    function loadAppointments() {
        setAppointmentsLoaded(false);
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/trainer/${trainerId}`)
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to load appointments');
                }

                return response.json();
            })
            .then(data => {
                setAppointments(Array.isArray(data) ? data : []);
            })
            .catch(error => {
                console.error('Error loading appointments:', error);
                setAppointments([]);
            })
            .finally(() => {
                setAppointmentsLoaded(true);
            });
    }

    function loadClients() {
        setClientsLoaded(false);
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/trainer/${trainerId}`)
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

    // ------------------------------------------------------------------------------------------------------------------------
    // Route/query param helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function setVisibleDays(nextDaysToShow) {
        const clampedDaysToShow = Math.min(
            Math.max(nextDaysToShow, DEFAULT_DAYS_TO_SHOW),
            MAX_DAYS_TO_SHOW
        );

        const nextSearchParams = new URLSearchParams(searchParams);

        if (clampedDaysToShow === DEFAULT_DAYS_TO_SHOW) {
            nextSearchParams.delete('days');
        } else {
            nextSearchParams.set('days', clampedDaysToShow);
        }

        setSearchParams(nextSearchParams);
    }

    function selectAppointment(appointment, review) {
        const nextSearchParams = new URLSearchParams(searchParams);

        nextSearchParams.delete('selected');
        nextSearchParams.delete('review');

        if (review) {
            nextSearchParams.set('review', appointment.id);
        } else {
            nextSearchParams.set('selected', appointment.id);
        }

        setSearchParams(nextSearchParams);
    }

    function clearSelectedAppointment() {
        const nextSearchParams = new URLSearchParams(searchParams);

        nextSearchParams.delete('selected');
        nextSearchParams.delete('review');

        setSearchParams(nextSearchParams);
        setEditingAppointmentId(null);
        setEditErrors({});
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Form helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function updateForm(event) {
        const {name, value} = event.target;

        setCreateForm({
            ...createForm,
            [name]: value
        });

        if (createErrors[name]) {
            const updatedErrors = {...createErrors};
            delete updatedErrors[name];
            setCreateErrors(updatedErrors);
        }
    }

    function updateEditForm(event) {
        const {name, value} = event.target;

        setEditForm({
            ...editForm,
            [name]: value
        });

        if (editErrors[name]) {
            const updatedErrors = {...editErrors};
            delete updatedErrors[name];
            setEditErrors(updatedErrors);
        }
    }

    function updateSelectForm(setForm, form, setErrors, errors, name, value) {
        setForm({
            ...form,
            [name]: value || '',
        });

        if (errors[name]) {
            const updatedErrors = {...errors};
            delete updatedErrors[name];
            setErrors(updatedErrors);
        }
    }

    function validateAppointmentForm(form) {
        const updatedErrors = {};

        if (!form.clientId) {
            updatedErrors.clientId = 'Client is required';
        }

        if (!form.date) {
            updatedErrors.date = 'Date is required';
        }

        if (!form.startTime) {
            updatedErrors.startTime = 'Start time is required';
        }

        if (form.status !== undefined && !form.status) {
            updatedErrors.status = 'Status is required';
        }

        return updatedErrors;
    }

    function resetCreateForm() {
        setCreateForm({
            trainerId: trainerId,
            clientId: '',
            title: '',
            date: '',
            startTime: '',
            durationMinutes: '60',
            notes: ''
        });

        setCreateErrors({});
        setShowCreateForm(false);
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Appointment CRUD
    // ------------------------------------------------------------------------------------------------------------------------

    function createAppointment(event) {
        event.preventDefault();

        const updatedErrors = validateAppointmentForm(createForm);

        if (Object.keys(updatedErrors).length > 0) {
            setCreateErrors(updatedErrors);
            return;
        }

        const startTime = `${createForm.date}T${createForm.startTime}:00`;
        const endTime = TimeUtils.addMinutesToLocalDateTime(
            createForm.date,
            createForm.startTime,
            createForm.durationMinutes
        );

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                trainerId: trainerId,
                clientId: Number(createForm.clientId),
                title: createForm.title.trim(),
                startTime: startTime,
                endTime: endTime,
                notes: createForm.notes.trim()
            })
        })
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to create appointment');
                }

                return response.json();
            })
            .then(() => {
                resetCreateForm();
                loadAppointments();
            })
            .catch(error => {
                console.error('Error creating appointment:', error);
                window.alert(`${error}`);
            });
    }

    function updateAppointment(event) {
        event.preventDefault();

        const updatedErrors = validateAppointmentForm(editForm);

        if (Object.keys(updatedErrors).length > 0) {
            setEditErrors(updatedErrors);
            return;
        }

        const startTime = `${editForm.date}T${editForm.startTime}:00`;
        const endTime = TimeUtils.addMinutesToLocalDateTime(
            editForm.date,
            editForm.startTime,
            editForm.durationMinutes
        );

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/${editingAppointmentId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                clientId: Number(editForm.clientId),
                title: editForm.title.trim(),
                startTime: startTime,
                endTime: endTime,
                status: editForm.status,
                notes: editForm.notes.trim()
            })
        })
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to update appointment');
                }

                return response.json();
            })
            .then(() => {
                clearSelectedAppointment();
                loadAppointments();
            })
            .catch(error => {
                console.error('Error updating appointment:', error);
                window.alert(`${error}`);
            });
    }

    function openDeleteModal(appointmentId) {
        setDeleteAppointmentId(appointmentId);
        setDeleteModalOpen(true);
    }

    function closeDeleteModal() {
        setDeleteAppointmentId(null);
        setDeleteModalOpen(false);
    }

    function deleteAppointment() {
        if (!deleteAppointmentId) {
            return;
        }

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/${deleteAppointmentId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete appointment');
                }

                closeDeleteModal();
                clearSelectedAppointment();
                loadAppointments();
            })
            .catch(error => {
                console.error('Error deleting appointment:', error);
                window.alert(`${error}\n\nTry refreshing the page.`);
            });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Appointment editing
    // ------------------------------------------------------------------------------------------------------------------------

    function beginEditAppointment(appointment) {
        const startDate = new Date(appointment.startTime);
        const endDate = new Date(appointment.endTime);

        const durationMinutes = Math.round((endDate - startDate) / 60000);

        setEditingAppointmentId(appointment.id);

        setEditForm({
            clientId: String(appointment.clientId),
            title: appointment.title || '',
            date: appointment.startTime.slice(0, 10),
            startTime: appointment.startTime.slice(11, 16),
            durationMinutes: String(durationMinutes),
            status: appointment.status,
            notes: appointment.notes || ''
        });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Appointment grouping
    // ------------------------------------------------------------------------------------------------------------------------

    function getUpcomingAppointmentsForDay(dayDate) {
        const dayKey = TimeUtils.getDateKeyFromDate(dayDate);

        return upcomingAppointments.filter(appointment =>
            TimeUtils.toDateKey(appointment.startTime) === dayKey
        );
    }

    function getVisibleDays() {
        const days = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let index = 0; index < daysToShow; index++) {
            const day = new Date(today);
            day.setDate(today.getDate() + index);
            days.push(day);
        }

        return days;
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function getStatusColor(status) {
        if (status === 'COMPLETED') {
            return 'green';
        }
        if (status === 'MISSED') {
            return 'yellow';
        }
        if (status === 'CANCELLED') {
            return 'red';
        }
        return 'blue';
    }

    function renderAppointmentForm({form, errors, onChange, onSubmit, includeStatus = false, submitLabel, onCancel, onDelete}) {
        return (
            <form onSubmit={onSubmit} onClick={(event) => event.stopPropagation()}>
                <Stack gap="md">
                    {includeStatus && (
                        <Select
                            label="Status"
                            value={form.status}
                            error={errors.status}
                            data={STATUS_OPTIONS}
                            onChange={(value) => updateSelectForm(
                                setEditForm,
                                editForm,
                                setEditErrors,
                                editErrors,
                                'status',
                                value
                            )}
                            required
                        />
                    )}

                    <Select
                        label="Client"
                        placeholder="Select client"
                        value={form.clientId}
                        error={errors.clientId}
                        data={clientOptions}
                        searchable
                        onChange={(value) => {
                            if (includeStatus) {
                                updateSelectForm(setEditForm, editForm, setEditErrors, editErrors, 'clientId', value);
                            } else {
                                updateSelectForm(setCreateForm, createForm, setCreateErrors, createErrors, 'clientId', value);
                            }
                        }}
                        required
                    />

                    <TextInput
                        label="Title"
                        name="title"
                        placeholder="e.g. Strength Session"
                        value={form.title}
                        onChange={onChange}
                    />

                    <SimpleGrid cols={{base: 1, sm: 3}}>
                        <DateInput
                            visibleFrom="sm"
                            label="Date"
                            name="date"
                            valueFormat="MM/DD/YYYY"
                            value={form.date || null}
                            error={errors.date}
                            maxDate={undefined}
                            rightSection={<IconCalendar size={18} stroke={1.8}/>}
                            onChange={(value) =>
                                onChange({
                                    target: {
                                        name: 'date',
                                        value: value || '',
                                    },
                                })
                            }
                            required
                        />
                        <DatePickerInput
                            hiddenFrom="sm"
                            label="Date"
                            name="date"
                            valueFormat="MM/DD/YYYY"
                            value={form.date || null}
                            error={errors.date}
                            required
                            dropdownType="modal"
                            rightSection={<IconCalendar size={18} stroke={1.8}/>}
                            onChange={(value) =>
                                onChange({
                                    target: {
                                        name: 'date',
                                        value: value || '',
                                    },
                                })
                            }
                        />

                        <TimeInput
                            label="Start Time"
                            name="startTime"
                            value={form.startTime}
                            error={errors.startTime}
                            rightSection={<IconClock size={18} stroke={1.8}/>}
                            onChange={onChange}
                            required
                        />

                        <Select
                            label="Duration"
                            value={form.durationMinutes}
                            data={DURATION_OPTIONS}
                            onChange={(value) => {
                                if (includeStatus) {
                                    updateSelectForm(setEditForm, editForm, setEditErrors, editErrors, 'durationMinutes', value);
                                } else {
                                    updateSelectForm(setCreateForm, createForm, setCreateErrors, createErrors, 'durationMinutes', value);
                                }
                            }}
                        />
                    </SimpleGrid>

                    <Textarea
                        label="Notes"
                        name="notes"
                        value={form.notes}
                        onChange={onChange}
                    />

                    <Group justify="space-between" wrap="nowrap" gap={5}>
                        <Group wrap="nowrap" gap={5}>
                            <Button
                                size="xs"
                                type="submit"
                            >
                                {submitLabel}
                            </Button>

                            <Button
                                size="xs"
                                type="button"
                                variant="default"
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                        </Group>

                        {onDelete && (
                            <Button
                                size="xs"
                                type="button"
                                color="red"
                                variant="light"
                                leftSection={<IconTrash size={16}/>}
                                onClick={onDelete}
                            >
                                Delete
                            </Button>
                        )}
                    </Group>
                </Stack>
            </form>
        );
    }

    function renderAppointmentCard(appointment, review) {
        const isEditing = String(editingAppointmentId) === String(appointment.id);

        return (
            <Paper
                key={appointment.id}
                withBorder
                radius="md"
                p="md"
                shadow={isEditing ? 'sm' : undefined}
                style={{cursor: isEditing ? 'default' : 'pointer'}}
                onClick={() => {
                    if (!isEditing) {
                        selectAppointment(appointment, review);
                    }
                }}
            >
                <Stack gap="xs">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Stack gap={2}>
                            <Text fw={700} lineClamp={1}>
                                {appointment.title || appointment.clientName}
                            </Text>

                            {appointment.title && (
                                <Text size="sm" c="dimmed">
                                    {appointment.clientName}
                                </Text>
                            )}
                        </Stack>

                        <Badge color={getStatusColor(appointment.status)} variant="light">
                            {appointment.status}
                        </Badge>
                    </Group>

                    <Group gap={6} wrap="nowrap">
                        <IconClock size={15} stroke={1.8}/>
                        <Text size="sm" c="dimmed">
                            {review && (
                                <>
                                    {TimeUtils.formatDisplayDate(appointment.startTime)} ·{' '}
                                </>
                            )}

                            {TimeUtils.formatDisplayTime(appointment.startTime)}
                            {' - '}
                            {TimeUtils.formatDisplayTime(appointment.endTime)}
                        </Text>
                    </Group>

                    {appointment.notes && (
                        <Text size="sm" c="dimmed">
                            {appointment.notes}
                        </Text>
                    )}

                    {isEditing && (
                        <Paper withBorder radius="md" p="md" mt="sm">
                            {renderAppointmentForm({
                                form: editForm,
                                errors: editErrors,
                                onChange: updateEditForm,
                                onSubmit: updateAppointment,
                                includeStatus: true,
                                submitLabel: 'Save',
                                onCancel: clearSelectedAppointment,
                                onDelete: () => openDeleteModal(appointment.id),
                            })}
                        </Paper>
                    )}
                </Stack>
            </Paper>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Stack pos="relative" gap="lg">
            <LoadingOverlay visible={loading} overlayProps={{blur: 2}}/>

            <Modal
                opened={deleteModalOpen}
                onClose={closeDeleteModal}
                title="Delete appointment?"
                centered
            >
                <Stack gap="md">
                    <Text c="dimmed">
                        This appointment will be permanently deleted. This cannot be undone.
                    </Text>

                    <Group justify="flex-end">
                        <Button variant="default" onClick={closeDeleteModal}>
                            Cancel
                        </Button>

                        <Button color="red" onClick={deleteAppointment}>
                            Delete Appointment
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <SimpleGrid cols={{base: 1, lg: 2}} spacing="lg">
                <Stack gap="lg">
                    <Paper withBorder radius="md" p="lg">
                        <Stack gap="md">
                            <Group justify="space-between" align="flex-start">
                                <Stack gap={4}>
                                    <Title order={3}>Schedule Appointment</Title>
                                    <Text size="sm" c="dimmed">
                                        Schedule an upcoming appointment.
                                    </Text>
                                </Stack>

                                {!showCreateForm && (
                                    <Button
                                        leftSection={<IconPlus size={16}/>}
                                        onClick={() => setShowCreateForm(true)}
                                    >
                                        Schedule
                                    </Button>
                                )}
                            </Group>

                            {showCreateForm && renderAppointmentForm({
                                form: createForm,
                                errors: createErrors,
                                onChange: updateForm,
                                onSubmit: createAppointment,
                                submitLabel: 'Add Appointment',
                                onCancel: () => setShowCreateForm(false),
                            })}
                        </Stack>
                    </Paper>

                    {needsReviewAppointments.length > 0 && (
                        <Paper withBorder radius="md" p="lg">
                            <Stack gap="md">
                                <Group gap="xs">
                                    <IconAlertTriangle size={18} />
                                    <Title order={3}>Needs Review</Title>
                                </Group>

                                <Text size="sm" c="dimmed">
                                    These appointments have passed but are still marked as scheduled.
                                </Text>

                                {needsReviewAppointments.map(appointment =>
                                    renderAppointmentCard(appointment, true)
                                )}
                            </Stack>
                        </Paper>
                    )}
                </Stack>

                <Stack gap="lg">
                    <Paper withBorder radius="md" p="lg">
                        <Stack gap="md">
                            <Group justify="space-between" align="flex-start">
                                <Stack gap={4}>
                                    <Group gap="xs">
                                        <IconCalendarEvent size={20}/>
                                        <Title order={3}>Upcoming Appointments</Title>
                                    </Group>

                                    {upcomingAppointments.length === 0 ? (
                                        <Text size="sm" c="dimmed">
                                            No upcoming appointments scheduled.
                                        </Text>
                                    ) : (
                                        <>
                                            <Text size="sm" c="dimmed">
                                                Total appointments: {upcomingAppointments.length}
                                            </Text>

                                            <Text size="sm" c="dimmed">
                                                Showing upcoming appointments for the next {daysToShow} days.
                                            </Text>
                                        </>
                                    )}
                                </Stack>
                            </Group>

                            {getVisibleDays().map(day => {
                                const dayAppointments = getUpcomingAppointmentsForDay(day);

                                return (
                                    <Stack key={TimeUtils.getDateKeyFromDate(day)} gap="xs">
                                        <Text fw={700}>
                                            {TimeUtils.formatDayHeading(day)}
                                        </Text>

                                        {dayAppointments.length === 0 && (
                                            <Paper withBorder radius="md" p="md">
                                                <Text size="sm" c="dimmed">
                                                    No appointments.
                                                </Text>
                                            </Paper>
                                        )}

                                        {dayAppointments.map(appointment =>
                                            renderAppointmentCard(appointment, false)
                                        )}
                                    </Stack>
                                );
                            })}

                            {daysToShow < MAX_DAYS_TO_SHOW && (
                                <Button
                                    variant="default"
                                    onClick={() => setVisibleDays(daysToShow + 7)}
                                >
                                    Load 7 More Days
                                </Button>
                            )}
                        </Stack>
                    </Paper>

                    <Paper withBorder radius="md" p="lg">
                        <Stack gap="md">
                            <Group gap="xs">
                                <IconHistory size={20}/>
                                <Title order={3}>Appointment History</Title>
                            </Group>

                            {historyAppointments.length === 0 ? (
                                <Text size="sm" c="dimmed">
                                    No appointment history yet.
                                </Text>
                            ) : (
                                <Text size="sm" c="dimmed">
                                    Below are your past appointments.
                                </Text>
                            )}

                            {historyAppointments.map(appointment =>
                                renderAppointmentCard(appointment, true)
                            )}
                        </Stack>
                    </Paper>
                </Stack>
            </SimpleGrid>
        </Stack>
    );
}

export default AppointmentsPage;
