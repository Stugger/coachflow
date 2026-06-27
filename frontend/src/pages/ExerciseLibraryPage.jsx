import {useEffect, useMemo, useState} from 'react';
import {apiFetch} from "../utils/api-client.js";
import {
    Alert,
    Button,
    Drawer,
    Group,
    LoadingOverlay,
    Modal,
    Paper,
    SegmentedControl,
    Stack,
    Switch,
    Text,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {
    IconAlertCircle,
    IconPlus,
    IconSearch,
} from '@tabler/icons-react';

import ExerciseForm from '../components/exercises/ExerciseForm';
import ExerciseViewer from '../components/exercises/ExerciseViewer';
import ExerciseFilters from '../components/exercises/ExerciseFilters';
import ExerciseListRow from '../components/exercises/ExerciseListRow';

import * as ExerciseMetadataUtils from '../utils/exercise-metadata-utils';

import {
    EQUIPMENT_OPTIONS,
    EXERCISE_DIFFICULTY_OPTIONS,
    EXERCISE_TAG_OPTIONS,
    MUSCLE_OPTIONS,
} from '../constants/exercises';


const emptyForm = {
    name: '',
    details: '',
    thumbnailUrl: '',
    demoVideoUrl: '',
    ...ExerciseMetadataUtils.emptyExerciseMetadata,
};

const emptyFilters = {
    equipment: [],
    primaryMuscles: [],
    tags: [],
    difficulty: [],
};

const FORM_MODE = {
    CREATE: 'CREATE',
    EDIT: 'EDIT',
    VIEW: 'VIEW',
};

function ExerciseLibraryPage({trainerId}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const isMobile = useMediaQuery('(max-width: 48em)');

    const [exercises, setExercises] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const [modalOpen, setModalOpen] = useState(false);
    const [formMode, setFormMode] = useState(FORM_MODE.CREATE);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [editingExercise, setEditingExercise] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const [searchText, setSearchText] = useState('');
    const [scope, setScope] = useState('ALL');
    const [filters, setFilters] = useState(emptyFilters);

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [detailedView, setDetailedView] = useState(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const filteredExercises = useMemo(() => {
        return exercises
            .filter(exercise => matchesScope(exercise))
            .filter(exercise => matchesSearch(exercise))
            .filter(exercise => matchesFilters(exercise))
            .sort(sortExercises);
    }, [exercises, searchText, scope, filters]);

    const hasActiveFilters =
        searchText.trim().length > 0 ||
        scope !== 'ALL' ||
        filters.equipment.length > 0 ||
        filters.primaryMuscles.length > 0 ||
        filters.tags.length > 0 ||
        filters.difficulty.length > 0;

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        loadExercises();
    }, []);

    // ------------------------------------------------------------------------------------------------------------------------
    // API
    // ------------------------------------------------------------------------------------------------------------------------

    function loadExercises() {
        setLoaded(false);

        apiFetch(`/api/exercises/trainer/${trainerId}`)
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to load exercises');
                }

                return response.json();
            })
            .then(exercises => setExercises(exercises))
            .catch(error => {
                console.error('Error loading exercises:', error);
                setMessage('Failed to load exercises.');
            })
            .finally(() => setLoaded(true));
    }

    function saveExercise(event) {
        event.preventDefault();

        setMessage('');
        setErrors({});

        const payload = normalizeForm();
        const url = editingExercise
            ? `/api/exercises/${editingExercise.id}`
            : `/api/exercises`;

        apiFetch(url, {
            method: editingExercise ? 'PUT' : 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
        })
            .then(async response => {
                if (!response.ok) {
                    const errorBody = await response.json();
                    handleBadResponse(errorBody);
                    throw new Error(errorBody.message || 'Failed to save exercise');
                }

                return response.json();
            })
            .then(() => {
                closeModal();
                loadExercises();
            })
            .catch(error => console.error('Error saving exercise:', error));
    }

    function archiveExercise(exercise) {
        if (!exercise) {
            return;
        }

        const confirmed = window.confirm(`Archive "${exercise.name}"?`);

        if (!confirmed) {
            return;
        }

        setMessage('');

        apiFetch(`/api/exercises/${exercise.id}?trainerId=${trainerId}`, {
            method: 'DELETE',
        })
            .then(async response => {
                if (!response.ok) {
                    const errorBody = await response.json();
                    setMessage(errorBody.message || 'Failed to archive exercise');
                    throw new Error(errorBody.message || 'Failed to archive exercise');
                }

                if (modalOpen) {
                    closeModal();
                }
                loadExercises();
            })
            .catch(error => console.error('Error archiving exercise:', error));
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Filter helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function updateFilter(name, value) {
        setFilters(previousFilters => ({
            ...previousFilters,
            [name]: value,
        }));
    }

    function clearFilters() {
        setSearchText('');
        setScope('ALL');
        setFilters(emptyFilters);
    }

    function matchesScope(exercise) {
        if (scope === 'MINE') {
            return exercise.visibility === 'TRAINER';
        }

        if (scope === 'GLOBAL') {
            return exercise.visibility === 'GLOBAL';
        }

        return true;
    }

    function matchesSearch(exercise) {
        const normalizedSearch = searchText.trim().toLowerCase();

        if (!normalizedSearch) {
            return true;
        }

        const metadata = ExerciseMetadataUtils.parseExerciseMetadataJson(exercise.metadataJson);

        const searchableValues = [
            exercise.name,
            exercise.visibility,
            findOptionLabel(EXERCISE_DIFFICULTY_OPTIONS, metadata.difficulty),
            ...metadata.equipment.map(value => findOptionLabel(EQUIPMENT_OPTIONS, value)),
            ...metadata.primaryMuscles.map(value => findOptionLabel(MUSCLE_OPTIONS, value)),
            ...metadata.secondaryMuscles.map(value => findOptionLabel(MUSCLE_OPTIONS, value)),
            ...metadata.tags.map(value => findOptionLabel(EXERCISE_TAG_OPTIONS, value)),
        ];

        return searchableValues
            .filter(Boolean)
            .some(value => value.toLowerCase().includes(normalizedSearch));
    }

    function matchesFilters(exercise) {
        const metadata = ExerciseMetadataUtils.parseExerciseMetadataJson(exercise.metadataJson);

        if (filters.equipment.length > 0 && !filters.equipment.some(value => metadata.equipment.includes(value))) {
            return false;
        }

        if (filters.primaryMuscles.length > 0 && !filters.primaryMuscles.some(value => metadata.primaryMuscles.includes(value))) {
            return false;
        }

        if (filters.tags.length > 0 && !filters.tags.some(value => metadata.tags.includes(value))) {
            return false;
        }

        if (filters.difficulty.length > 0 && !filters.difficulty.some(value => metadata.difficulty === value)) {
            return false;
        }

        return true;
    }

    function sortExercises(first, second) {
        const firstIsMine = first.visibility === 'TRAINER';
        const secondIsMine = second.visibility === 'TRAINER';

        if (firstIsMine !== secondIsMine) {
            return firstIsMine ? -1 : 1;
        }

        return first.name.localeCompare(second.name);
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Form helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function buildFormFromExercise(exercise) {
        const metadata = ExerciseMetadataUtils.parseExerciseMetadataJson(exercise.metadataJson);

        return {
            name: exercise.name || '',
            details: exercise.details || '',
            thumbnailUrl: exercise.thumbnailUrl || '',
            demoVideoUrl: exercise.demoVideoUrl || '',
            ...metadata,
        };
    }

    function openViewExercise(exercise) {
        setFormMode(FORM_MODE.VIEW);
        setSelectedExercise(exercise);
        setEditingExercise(null);
        setErrors({});
        setMessage('');
        setModalOpen(true);
    }

    function openCreateModal() {
        setFormMode(FORM_MODE.CREATE);
        setSelectedExercise(null);
        setEditingExercise(null);
        setForm(emptyForm);
        setErrors({});
        setMessage('');
        setModalOpen(true);
    }

    function openEditModal(exercise) {
        setFormMode(FORM_MODE.EDIT);
        setSelectedExercise(exercise);
        setEditingExercise(exercise);
        setForm(buildFormFromExercise(exercise));
        setErrors({});
        setMessage('');
        setModalOpen(true);
    }

    function openCopyModal(exercise) {
        setFormMode(FORM_MODE.CREATE);
        setSelectedExercise(exercise);
        setEditingExercise(null);
        setForm(buildFormFromExercise(exercise));
        setErrors({});
        setMessage('');
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setFormMode(FORM_MODE.CREATE);
        setSelectedExercise(null);
        setEditingExercise(null);
        setForm(emptyForm);
        setErrors({});
    }

    function updateForm(event) {
        const {name, value} = event.target;
        updateFormValue(name, value);
    }

    function updateFormValue(name, value) {
        setForm(previousForm => ({
            ...previousForm,
            [name]: value,
        }));

        if (errors[name]) {
            const updatedErrors = {...errors};
            delete updatedErrors[name];
            setErrors(updatedErrors);
        }
    }

    function normalizeForm() {
        return {
            trainerId,
            name: form.name.trim(),
            details: form.details.trim() || null,
            thumbnailUrl: form.thumbnailUrl.trim() || null,
            demoVideoUrl: form.demoVideoUrl.trim() || null,
            metadataJson: buildMetadataJson(),
        };
    }

    function buildMetadataJson() {
        const metadata = {
            equipment: form.equipment,
            primaryMuscles: form.primaryMuscles,
            secondaryMuscles: form.secondaryMuscles,
            difficulty: form.difficulty || null,
            tags: form.tags,
            defaultTrackingFields: form.defaultTrackingFields,
        };

        const hasMetadata =
            metadata.equipment.length > 0 ||
            metadata.primaryMuscles.length > 0 ||
            metadata.secondaryMuscles.length > 0 ||
            metadata.difficulty !== null ||
            metadata.tags.length > 0 ||
            metadata.defaultTrackingFields.length > 0;

        return hasMetadata ? JSON.stringify(metadata) : null;
    }

    function handleBadResponse(errorBody) {
        if (errorBody.fieldErrors) {
            setErrors(errorBody.fieldErrors);
        }

        if (errorBody.message) {
            setMessage(errorBody.message);
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Metadata display helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function findOptionLabel(options, value) {
        return options.find(option => option.value === value)?.label || value;
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderMessage() {
        if (!message) {
            return null;
        }

        return (
            <Alert color="red" icon={<IconAlertCircle size={18}/>} variant="light">
                {message}
            </Alert>
        );
    }

    function renderExerciseRow(exercise) {
        return (
            <ExerciseListRow
                key={exercise.id}
                exercise={exercise}
                detailedView={detailedView}
                metadata={ExerciseMetadataUtils.parseExerciseMetadataJson(exercise.metadataJson)}
                isMobile={isMobile}
                onView={openViewExercise}
                onCopy={openCopyModal}
                onEdit={openEditModal}
                onArchive={archiveExercise}
            />
        );
    }

    function renderExerciseList() {
        if (!loaded) {
            return null;
        }

        if (exercises.length === 0) {
            return (
                <Paper withBorder p="xl" radius="md">
                    <Stack gap="xs" ta="center">
                        <Text fw={700}>No exercises yet</Text>
                        <Text size="sm" c="dimmed">
                            Create your first exercise to start building the library foundation.
                        </Text>
                    </Stack>
                </Paper>
            );
        }

        if (filteredExercises.length === 0) {
            return (
                <Paper withBorder p="xl" radius="md">
                    <Stack gap="xs" ta="center">
                        <Text fw={700}>No exercises found</Text>
                        <Text size="sm" c="dimmed">
                            Try changing your search or clearing the active filters.
                        </Text>
                    </Stack>
                </Paper>
            );
        }

        return (
            <Stack gap="sm">
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        Showing {filteredExercises.length} of {exercises.length} exercises
                    </Text>
                </Group>

                <Stack gap="xs">
                    {filteredExercises.map(renderExerciseRow)}
                </Stack>
            </Stack>
        );
    }

    function renderFormModal() {
        const title = formMode === FORM_MODE.VIEW
            ? 'Exercise'
            : formMode === FORM_MODE.EDIT
                ? 'Edit exercise'
                : 'New exercise';

        const content = formMode === FORM_MODE.VIEW ? (
            <ExerciseViewer
                exercise={selectedExercise}
                onClose={closeModal}
                onCopy={() => openCopyModal(selectedExercise)}
                onEdit={() => openEditModal(selectedExercise)}
                onArchive={() => archiveExercise(selectedExercise)}
            />
        ) : (
            <ExerciseForm
                form={form}
                errors={errors}
                onChange={updateForm}
                onValueChange={updateFormValue}
                onSubmit={saveExercise}
                isEditing={!!editingExercise}
                onCancel={closeModal}
            />
        );

        if (isMobile) {
            return (
                <Drawer
                    opened={modalOpen}
                    onClose={closeModal}
                    title={title}
                    position="bottom"
                    size="100%"
                    closeOnClickOutside={formMode === FORM_MODE.VIEW}
                    closeOnEscape={formMode === FORM_MODE.VIEW}
                    styles={{
                        title: {fontSize: '1.2rem'},
                        body: {
                            paddingBottom: '2rem',
                        },
                    }}
                >
                    {content}
                </Drawer>
            );
        }

        return (
            <Modal
                opened={modalOpen}
                onClose={closeModal}
                title={title}
                centered
                size="48rem"
                closeOnClickOutside={formMode === FORM_MODE.VIEW}
                closeOnEscape={formMode === FORM_MODE.VIEW}
                styles={{
                    title: {fontSize: '1.2rem'},
                }}
            >
                {content}
            </Modal>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Stack gap="md" pos="relative">
            <LoadingOverlay visible={!loaded && exercises.length === 0} overlayProps={{blur: 2}}/>

            <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                    <Title order={1}>Exercise Library</Title>
                    <Text c="dimmed" size="sm">
                        Manage reusable exercises. Global exercises can be copied, which you can then edit directly as your own.
                    </Text>
                </Stack>

                <Button leftSection={<IconPlus size={16}/>} onClick={openCreateModal}>
                    New Exercise
                </Button>
            </Group>

            {renderMessage()}

            <Paper withBorder p="md" radius="md">
                <Stack gap="md">
                    <Group justify="space-between" align="flex-end">
                        <TextInput
                            style={{flex: 1}}
                            label="Search"
                            placeholder="Search by name, details, muscle, equipment, tag..."
                            leftSection={<IconSearch size={16}/>}
                            value={searchText}
                            onChange={event => setSearchText(event.target.value)}
                        />

                        <SegmentedControl
                            value={scope}
                            onChange={setScope}
                            data={[
                                {
                                    value: 'ALL',
                                    label: (
                                        <Tooltip label="Show all exercises" position="top" withArrow arrowSize={6}>
                                            <Text size="sm" fw={600}>All</Text>
                                        </Tooltip>
                                    ),
                                },
                                {
                                    value: 'MINE',
                                    label: (
                                        <Tooltip label="Show my exercises" position="top" withArrow arrowSize={6}>
                                            <Text size="sm" fw={600}>Mine</Text>
                                        </Tooltip>
                                    ),
                                },
                                {
                                    value: 'GLOBAL',
                                    label: (
                                        <Tooltip label="Show global exercises" position="top" withArrow arrowSize={6}>
                                            <Text size="sm" fw={600}>Global</Text>
                                        </Tooltip>
                                    ),
                                },
                            ]}
                        />
                    </Group>

                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                            {loaded ? `${filteredExercises.length} of ${exercises.length} exercises` : 'Loading exercises...'}
                        </Text>

                        <Switch
                            label="Detailed view"
                            checked={detailedView}
                            onChange={event => setDetailedView(event.currentTarget.checked)}
                        />
                    </Group>
                </Stack>
            </Paper>

            <ExerciseFilters
                filters={filters}
                filtersOpen={filtersOpen}
                hasActiveFilters={hasActiveFilters}
                onToggleFilters={() => setFiltersOpen(previous => !previous)}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
            />

            {renderExerciseList()}

            {modalOpen && renderFormModal()}
        </Stack>
    );
}

export default ExerciseLibraryPage;