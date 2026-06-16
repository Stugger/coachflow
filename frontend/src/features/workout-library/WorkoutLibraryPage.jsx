import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ROUTES} from '../../constants/routes';
import {
    Alert,
    Button,
    Group,
    LoadingOverlay,
    Paper,
    ScrollArea,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import {IconAlertCircle, IconPlus, IconSearch} from '@tabler/icons-react';

import WorkoutTemplateListRow from './WorkoutTemplateListRow';

import {
    archiveWorkoutTemplate,
    getWorkoutTemplates,
} from './workout-template-api';

function WorkoutLibraryPage({trainerId}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Route state
    // ------------------------------------------------------------------------------------------------------------------------

    const navigate = useNavigate();

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [templates, setTemplates] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [message, setMessage] = useState('');
    const [searchText, setSearchText] = useState('');

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const filteredTemplates = useMemo(() => {
        const search = searchText.trim().toLowerCase();

        return templates
            .filter(template => !search || template.name?.toLowerCase().includes(search))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [templates, searchText]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        loadData();
    }, []);

    // ------------------------------------------------------------------------------------------------------------------------
    // API loading
    // ------------------------------------------------------------------------------------------------------------------------

    function loadData() {
        setLoaded(false);
        setMessage('');

        getWorkoutTemplates(trainerId)
            .then(setTemplates)
            .catch(error => {
                console.error('Failed to load workout library:', error);
                setMessage(error.message || 'Failed to load workout library.');
            })
            .finally(() => setLoaded(true));
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function newTemplate() {
        setMessage('');
        navigate(ROUTES.WORKOUT_TEMPLATE_NEW);
    }

    function editTemplate(template) {
        setMessage('');
        navigate(ROUTES.workoutTemplateEdit(template.id));
    }

    function copyTemplate(template) {
        setMessage('');
        navigate(ROUTES.workoutTemplateCopy(template.id));
    }

    function archiveTemplate(template) {
        const confirmed = window.confirm(`Archive "${template.name}"?`);

        if (!confirmed) {
            return;
        }

        archiveWorkoutTemplate(template.id, trainerId)
            .then(() => getWorkoutTemplates(trainerId))
            .then(setTemplates)
            .catch(error => {
                console.error('Failed to archive workout template:', error);
                setMessage(error.message || 'Failed to archive workout template.');
            });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Stack gap="md" pos="relative">
            <LoadingOverlay visible={!loaded}/>

            <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                    <Title order={1}>Workout Library</Title>
                    <Text c="dimmed" size="sm">
                        Build and manage reusable workouts with sections, exercises, and vertical stacks.
                    </Text>
                </Stack>

                <Button leftSection={<IconPlus size={16}/>} onClick={newTemplate}>
                    New Workout
                </Button>
            </Group>

            {message && (
                <Alert color="red" icon={<IconAlertCircle size={16}/>} onClose={() => setMessage('')} withCloseButton>
                    {message}
                </Alert>
            )}

            <Paper withBorder radius="md" p="md">
                <Stack gap="md">
                    <Group justify="space-between">
                        <Text fw={800}>Workouts</Text>
                        <Text size="sm" c="dimmed">{filteredTemplates.length} shown</Text>
                    </Group>

                    <TextInput
                        placeholder="Search workouts"
                        leftSection={<IconSearch size={16}/>}
                        value={searchText}
                        onChange={event => setSearchText(event.currentTarget.value)}
                    />

                    <ScrollArea h={{base: 340, lg: 640}} type="auto">
                        <Stack gap="xs">
                            {filteredTemplates.map(template => (
                                <WorkoutTemplateListRow
                                    key={template.id}
                                    template={template}
                                    onSelect={() => editTemplate(template)}
                                    onEdit={event => {
                                        event?.stopPropagation?.();
                                        editTemplate(template);
                                    }}
                                    onCopy={event => {
                                        event?.stopPropagation?.();
                                        copyTemplate(template);
                                    }}
                                    onArchive={event => {
                                        event?.stopPropagation?.();
                                        archiveTemplate(template);
                                    }}
                                />
                            ))}

                            {filteredTemplates.length === 0 && (
                                <Text size="sm" c="dimmed" ta="center" py="xl">
                                    No workouts found.
                                </Text>
                            )}
                        </Stack>
                    </ScrollArea>
                </Stack>
            </Paper>
        </Stack>
    );
}

export default WorkoutLibraryPage;
