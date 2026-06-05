import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
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
            });
    }

    function loadClients() {
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

    function deleteAppointment(appointmentId) {
        const confirmed = window.confirm('Delete this appointment?\n\nThis cannot be undone.');

        if (!confirmed) {
            return;
        }

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/${appointmentId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete appointment');
                }

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

    function renderAppointmentCard(appointment, review) {
        const isEditing = String(editingAppointmentId) === String(appointment.id);

        return (
            <div
                key={appointment.id}
                className={`appointment-list-item ${isEditing ? 'editing' : ''}`}
                onClick={() => {
                    if (!isEditing) {
                        selectAppointment(appointment, review);
                    }
                }}
            >
                <div className="appointment-list-header">
                    <strong>{appointment.title || appointment.clientName}</strong>
                    <span className={`appointment-status appointment-status-${appointment.status.toLowerCase()}`}>
                        {appointment.status}
                    </span>
                </div>

                {appointment.title && <p>{appointment.clientName}</p>}

                <p>
                    {review && (
                        <>
                            {TimeUtils.formatDisplayDate(appointment.startTime)} ·{' '}
                        </>
                    )}

                    {TimeUtils.formatDisplayTime(appointment.startTime)}
                    {' - '}
                    {TimeUtils.formatDisplayTime(appointment.endTime)}
                </p>

                {appointment.notes && <p>{appointment.notes}</p>}

                {isEditing && (
                    <form
                        className="client-form section-divider spaced"
                        onSubmit={updateAppointment}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="form-field">
                            <label>Status</label>
                            <select
                                name="status"
                                value={editForm.status}
                                onChange={updateEditForm}
                            >
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="MISSED">Missed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="section-divider spaced" />

                        <div className="form-field">
                            <label>Client</label>
                            <select
                                name="clientId"
                                className={editErrors.clientId ? 'input-error' : ''}
                                value={editForm.clientId}
                                onChange={updateEditForm}
                            >
                                <option value="">Select client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.firstName} {client.lastName}
                                    </option>
                                ))}
                            </select>
                            {editErrors.clientId && <div className="field-error">* {editErrors.clientId}</div>}
                        </div>

                        <div className="form-field">
                            <label>Title</label>
                            <input
                                name="title"
                                placeholder="e.g. Strength Session"
                                value={editForm.title}
                                onChange={updateEditForm}
                            />
                        </div>

                        <div className="form-field">
                            <label>Date</label>
                            <input
                                name="date"
                                type="date"
                                className={editErrors.date ? 'input-error' : ''}
                                value={editForm.date}
                                onChange={updateEditForm}
                            />
                            {editErrors.date && <div className="field-error">* {editErrors.date}</div>}
                        </div>

                        <div className="form-field">
                            <label>Start Time</label>
                            <input
                                name="startTime"
                                type="time"
                                className={editErrors.startTime ? 'input-error' : ''}
                                value={editForm.startTime}
                                onChange={updateEditForm}
                            />
                            {editErrors.startTime && <div className="field-error">* {editErrors.startTime}</div>}
                        </div>

                        <div className="form-field">
                            <label>Duration</label>
                            <select
                                name="durationMinutes"
                                value={editForm.durationMinutes}
                                onChange={updateEditForm}
                            >
                                <option value="30">30 minutes</option>
                                <option value="45">45 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="90">1.5 hours</option>
                                <option value="120">2 hours</option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label>Notes</label>
                            <textarea
                                name="notes"
                                value={editForm.notes}
                                onChange={updateEditForm}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit">
                                Save
                            </button>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => clearSelectedAppointment()}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="danger-button"
                                onClick={() => deleteAppointment(appointment.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <div className="appointments-page">
            <div className="appointments-left-column">
                <section className="profile-card">
                    <h3>Schedule Appointment</h3>

                    {!showCreateForm && (
                        <>
                            <p>Schedule an upcoming appointment.</p>

                            <button onClick={() => setShowCreateForm(true)}>
                                + Schedule Appointment
                            </button>
                        </>
                    )}

                    {showCreateForm && (
                        <form className="client-form" onSubmit={createAppointment}>
                            <div className="form-field">
                                <label>Client</label>
                                <select
                                    name="clientId"
                                    className={createErrors.clientId ? 'input-error' : ''}
                                    value={createForm.clientId}
                                    onChange={updateForm}
                                >
                                    <option value="">Select client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.firstName} {client.lastName}
                                        </option>
                                    ))}
                                </select>
                                {createErrors.clientId && <div className="field-error">* {createErrors.clientId}</div>}
                            </div>

                            <div className="form-field">
                                <label>Title</label>
                                <input
                                    name="title"
                                    placeholder="e.g. Strength Session"
                                    value={createForm.title}
                                    onChange={updateForm}
                                />
                            </div>

                            <div className="form-field">
                                <label>Date</label>
                                <input
                                    name="date"
                                    type="date"
                                    className={createErrors.date ? 'input-error' : ''}
                                    value={createForm.date}
                                    onChange={updateForm}
                                />
                                {createErrors.date && <div className="field-error">* {createErrors.date}</div>}
                            </div>

                            <div className="form-field">
                                <label>Start Time</label>
                                <input
                                    name="startTime"
                                    type="time"
                                    className={createErrors.startTime ? 'input-error' : ''}
                                    value={createForm.startTime}
                                    onChange={updateForm}
                                />
                                {createErrors.startTime && <div className="field-error">* {createErrors.startTime}</div>}
                            </div>

                            <div className="form-field">
                                <label>Duration</label>
                                <select
                                    name="durationMinutes"
                                    value={createForm.durationMinutes}
                                    onChange={updateForm}
                                >
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="90">1.5 hours</option>
                                    <option value="120">2 hours</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={createForm.notes}
                                    onChange={updateForm}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit">
                                    Add Appointment
                                </button>

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {needsReviewAppointments.length > 0 && (
                    <section className="profile-card">
                        <h3>Needs Review</h3>
                        <p>These appointments have passed but are still marked as scheduled.</p>

                        {needsReviewAppointments.map(appointment =>
                            renderAppointmentCard(appointment, true)
                        )}
                    </section>
                )}
            </div>

            <div className="appointments-right-column">
                <section className="profile-card">
                    <h3>Upcoming Appointments</h3>

                    {upcomingAppointments.length === 0 ? (
                        <p>No upcoming appointments scheduled.</p>
                    ) : (
                        <>
                            <small>Total appointments: {upcomingAppointments.length}</small>
                            <p>Below are your upcoming appointments for the next {daysToShow} days.</p>
                        </>
                    )}

                    <div className="section-divider" />

                    {getVisibleDays().map(day => {
                        const dayAppointments = getUpcomingAppointmentsForDay(day);

                        return (
                            <div key={TimeUtils.getDateKeyFromDate(day)} className="appointment-day-group">
                                <h4>{TimeUtils.formatDayHeading(day)}</h4>

                                {dayAppointments.length === 0 && (
                                    <div className="appointment-list-empty">
                                        <p>No appointments.</p>
                                    </div>
                                )}

                                {dayAppointments.map(appointment =>
                                    renderAppointmentCard(appointment, false)
                                )}
                            </div>
                        );
                    })}

                    {daysToShow < MAX_DAYS_TO_SHOW && (
                        <button
                            className="appointments-load-more-button secondary-button"
                            onClick={() => setVisibleDays(daysToShow + 7)}
                        >
                            Load 7 More Days
                        </button>
                    )}
                </section>

                <section className="profile-card">
                    <h3>Appointment History</h3>

                    {historyAppointments.length === 0 ? (
                        <p>No appointment history yet.</p>
                    ) : (
                        <p>Below are your past appointments.</p>
                    )}

                    {historyAppointments.map(appointment =>
                        renderAppointmentCard(appointment, true)
                    )}
                </section>
            </div>
        </div>
    );
}

export default AppointmentsPage;