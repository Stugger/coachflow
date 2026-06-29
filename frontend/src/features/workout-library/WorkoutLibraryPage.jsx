import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {ROUTES} from '../../constants/routes';
import {
    Alert,
    Button,
    Group,
    LoadingOverlay,
    Paper,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from '@mantine/core';

import {useMediaQuery} from '@mantine/hooks';

import {IconAlertCircle, IconBarbell, IconClock, IconPlus, IconSearch, IconClipboardList} from '@tabler/icons-react';

import WorkoutTemplateListRow from './WorkoutTemplateListRow';
import WorkoutTemplateEditor from './WorkoutTemplateEditor';

import {
    apiArchiveWorkoutTemplate,
    apiGetWorkoutTemplates,
} from './workout-template-api';


function WorkoutLibraryPage({trainerId}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isMobile = useMediaQuery('(max-width: 48em)');

    // ------------------------------------------------------------------------------------------------------------------------
    // Route state
    // ------------------------------------------------------------------------------------------------------------------------

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const editorMode = searchParams.get('editor');
    const editorTemplateId = searchParams.get('templateId');

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

    const editorOpened = ['new', 'edit', 'copy'].includes(editorMode);

    const filteredTemplates = useMemo(() => {
        const search = searchText.trim().toLowerCase();

        if (!search) {
            return templates;
        }

        return templates.filter(template => {
            const searchableValues = [
                template.name,
                ...(template.exerciseNames ?? []),
            ];

            return searchableValues.some(value =>
                value?.toLowerCase().includes(search)
            );
        });
    }, [templates, searchText]);

    const mobileHeaderCellStyle = isMobile
        ? {
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            borderBottom: 0,
            fontSize: 0,
            lineHeight: 0,
            overflow: 'hidden',
        }
        : {};

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        loadData();
    }, []);

    // ------------------------------------------------------------------------------------------------------------------------
    // API loading
    // ------------------------------------------------------------------------------------------------------------------------

    function loadData({background = false} = {}) {
        if (!background) {
            setLoaded(false);
        }

        setMessage('');

        apiGetWorkoutTemplates()
            .then(setTemplates)
            .catch(error => {
                console.error('Failed to load workout library:', error);
                setMessage(error.message || 'Failed to load workout library.');
            })
            .finally(() => {
                if (!background) {
                    setLoaded(true);
                }
            });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Editor route helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function openNewEditor() {
        setMessage('');
        navigate(ROUTES.workoutLibraryNew());
    }

    function openEditEditor(template) {
        setMessage('');
        navigate(ROUTES.workoutLibraryEdit(template.id));
    }

    function openCopyEditor(template) {
        setMessage('');
        navigate(ROUTES.workoutLibraryCopy(template.id));
    }

    function closeEditor() {
        setSearchParams({});
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function handleEditorSaved(savedTemplate) {
        loadData({background: true});

        if (editorMode !== 'edit' || String(editorTemplateId) !== String(savedTemplate.id)) {
            navigate(
                ROUTES.workoutLibraryEdit(savedTemplate.id),
                {replace: true},
            );
        }
    }

    function archiveTemplate(template) {
        const confirmed = window.confirm(`Archive "${template.name}"?`);

        if (!confirmed) {
            return;
        }

        apiArchiveWorkoutTemplate(template.id)
            .then(() => apiGetWorkoutTemplates())
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
            <LoadingOverlay visible={!loaded && !editorOpened} overlayProps={{blur: 2}}/>

            {editorOpened && (
                <WorkoutTemplateEditor
                    opened={editorOpened}
                    mode={editorMode}
                    templateId={editorTemplateId}
                    trainerId={trainerId}
                    onClose={closeEditor}
                    onSaved={handleEditorSaved}
                />
            )}

            <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                    <Title order={1}>Workout Library</Title>
                    <Text c="dimmed" size="sm">
                        Build and manage reusable workouts with sections, exercises, and vertical stacks.
                    </Text>
                </Stack>

                <Button leftSection={<IconPlus size={16}/>} onClick={openNewEditor}>
                    New Workout
                </Button>
            </Group>

            {message && (
                <Alert color="red" icon={<IconAlertCircle size={16}/>} onClose={() => setMessage('')} withCloseButton>
                    {message}
                </Alert>
            )}

            <Paper
                withBorder
                radius="md"
                p='md'
                style={{overflow: 'hidden'}}
            >
                <Stack gap='md'>
                    <TextInput
                        placeholder="Search by workout or exercise name..."
                        label="Search"
                        leftSection={<IconSearch size={16}/>}
                        value={searchText}
                        onChange={event => setSearchText(event.currentTarget.value)}
                    />
                    <Text size="sm" c="dimmed">
                        {filteredTemplates.length} of {templates.length} workouts
                    </Text>
                </Stack>
            </Paper>

            <Text size="sm" c="dimmed">
                Showing {filteredTemplates.length} of {templates.length} workouts
            </Text>

            {templates.length === 0 ? (
                <Paper withBorder p="xl" radius="md">
                    <Stack gap="xs" align="center" ta="center">
                        <Text fw={700}>No workouts yet</Text>
                        <Text size="sm" c="dimmed" pb='0.5rem'>
                            Create your first workout to start building your library foundation.
                        </Text>
                        <Button leftSection={<IconPlus size={16}/>} onClick={openNewEditor}>
                            New Workout
                        </Button>
                    </Stack>
                </Paper>
            ) : (
                <Paper
                    withBorder
                    radius="md"
                    p={0}
                    style={{overflow: 'hidden'}}
                >
                    <Table
                        highlightOnHover={filteredTemplates.length > 0}
                        verticalSpacing="md"
                        horizontalSpacing="md"
                        mt={isMobile ? -1 : '0.25rem'}
                        style={{
                            width: '100%',
                            tableLayout: 'fixed',
                        }}
                    >
                        <Table.Thead>
                            <Table.Tr style={isMobile ? {height: 0} : undefined}>
                                <Table.Th
                                    style={{
                                        width: '50%',
                                        ...mobileHeaderCellStyle,
                                    }}
                                >
                                    {!isMobile && (
                                        <Group gap={4}>
                                            <IconClipboardList size={16} stroke={2.4}/>
                                            <Text size="sm" fw={600}>
                                                Workout
                                            </Text>
                                        </Group>
                                    )}
                                </Table.Th>

                                <Table.Th
                                    style={{
                                        display: isMobile ? 'none' : undefined,
                                        ...mobileHeaderCellStyle,
                                    }}
                                >
                                    <Group gap={5} justify="center">
                                        <IconBarbell size={18} stroke={1.8}/>
                                        <Text size="sm" fw={600}>
                                            Exercises
                                        </Text>
                                    </Group>
                                </Table.Th>

                                <Table.Th
                                    style={{
                                        display: isMobile ? 'none' : undefined,
                                        ...mobileHeaderCellStyle,
                                    }}
                                >
                                    <Group gap={4} justify="center">
                                        <IconClock size={16} stroke={2.4}/>
                                        <Text size="sm" fw={600}>
                                            Updated
                                        </Text>
                                    </Group>
                                </Table.Th>

                                <Table.Th
                                    style={{
                                        width: isMobile ? '2rem' : '4rem',
                                        ...mobileHeaderCellStyle,
                                    }}
                                />
                            </Table.Tr>
                        </Table.Thead>

                        <Table.Tbody>
                            {filteredTemplates.map(template => (
                                <WorkoutTemplateListRow
                                    key={template.id}
                                    template={template}
                                    onSelect={() => openEditEditor(template)}
                                    onEdit={() => openEditEditor(template)}
                                    onCopy={() => openCopyEditor(template)}
                                    onArchive={() => archiveTemplate(template)}
                                />
                            ))}

                            {filteredTemplates.length === 0 && (
                                <Table.Tr>
                                    <Table.Td colSpan={4}>
                                        <Text size="sm" c="dimmed" ta="center" py="xl">
                                            No workouts found.
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Paper>
            )}
        </Stack>
    );
}

export default WorkoutLibraryPage;