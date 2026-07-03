import {useEffect, useMemo, useState} from 'react';
import {
    Alert,
    Box,
    LoadingOverlay,
    Modal,
    ScrollArea,
    Stack,
    Text,
    TextInput,
    UnstyledButton,
} from '@mantine/core';
import {
    IconAlertCircle,
    IconClipboardList,
    IconSearch,
} from '@tabler/icons-react';

import {apiGetWorkoutTemplates} from './workout-template-api';

function WorkoutTemplatePicker({opened, onClose, onSelect}) {

    const [templates, setTemplates] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [message, setMessage] = useState('');
    const [searchText, setSearchText] = useState('');

    const filteredTemplates = useMemo(() => {
        const search = searchText.trim().toLowerCase();

        if (!search) {
            return templates;
        }

        return templates.filter(template => {
            const values = [
                template.name,
                ...(template.exerciseNames ?? []),
            ];

            return values.some(value =>
                value?.toLowerCase().includes(search)
            );
        });
    }, [templates, searchText]);

    useEffect(() => {
        if (!opened) {
            setSearchText('');
            return;
        }

        setLoaded(false);
        setMessage('');

        apiGetWorkoutTemplates()
            .then(setTemplates)
            .catch(error => {
                console.error('Failed to load workout templates:', error);
                setMessage(error.message || 'Failed to load workout templates.');
            })
            .finally(() => {
                setLoaded(true);
            });
    }, [opened]);

    return (
        <Modal.Root
            opened={opened}
            onClose={onClose}
            centered
            size="lg"
            styles={{
                content: {
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'min(42rem, calc(100dvh - 2rem))',
                },
                body: {
                    flex: 1,
                    minHeight: 0,
                },
            }}
        >
            <Modal.Overlay />

            <Modal.Content style={{borderRadius: '1rem'}}>
                <Modal.Header
                    style={{
                        flexShrink: 0,
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                    }}
                >
                    <Modal.Title style={{flex: 1, minWidth: 0}}>
                        <Stack gap={0}>
                            <Text fw={600}>Choose Workout Template</Text>
                            <Text size="xs" c="dimmed">
                                Start the assessment with a detached copy.
                            </Text>
                        </Stack>
                    </Modal.Title>

                    <Modal.CloseButton />
                </Modal.Header>

                <Modal.Body
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        padding: 0,
                        backgroundColor: 'var(--color-background)',
                    }}
                >
                    <LoadingOverlay visible={!loaded} overlayProps={{blur: 2}} />

                    <Box
                        p="sm"
                        style={{
                            flexShrink: 0,
                            borderBottom: '1px solid var(--color-border)',
                        }}
                    >
                        <Stack gap="xs">
                            <TextInput
                                placeholder="Search workouts or exercises..."
                                leftSection={<IconSearch size={16}/>}
                                value={searchText}
                                onChange={event => setSearchText(event.currentTarget.value)}
                            />

                            <Text size="sm" c="dimmed">
                                {filteredTemplates.length} workout{filteredTemplates.length === 1 ? '' : 's'}
                            </Text>
                        </Stack>
                    </Box>

                    {message ? (
                        <Alert
                            color="red"
                            icon={<IconAlertCircle size={16}/>}
                            m="sm"
                        >
                            {message}
                        </Alert>
                    ) : (
                        <ScrollArea style={{flex: 1, minHeight: 0}}>
                            <Stack gap="xs" p="sm">
                                {filteredTemplates.map(template => (
                                    <TemplatePickerCard
                                        key={template.id}
                                        template={template}
                                        onClick={() => onSelect(template)}
                                    />
                                ))}

                                {loaded && filteredTemplates.length === 0 && (
                                    <Stack align="center" py="xl" gap={4}>
                                        <IconClipboardList size={24} />
                                        <Text fw={600}>No workouts found</Text>
                                        <Text size="sm" c="dimmed">
                                            Try a different search.
                                        </Text>
                                    </Stack>
                                )}
                            </Stack>
                        </ScrollArea>
                    )}
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
}

function TemplatePickerCard({template, onClick}) {
    return (
        <UnstyledButton
            onClick={onClick}
            style={{width: '100%', textAlign: 'left'}}
        >
            <Box
                className="interactive-card subtle"
                p="md"
                style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--mantine-radius-md)',
                    backgroundColor: 'var(--color-surface)',
                }}
            >
                <Stack gap={4}>
                    <Text fw={700} lineClamp={1}>
                        {template.name || 'Unnamed workout'}
                    </Text>

                    <Text size="sm" c="dimmed" lineClamp={3}>
                        {(template.exerciseNames ?? []).length
                            ? template.exerciseNames.join(' / ')
                            : 'No exercises added yet'
                        }
                    </Text>

                    <Text size="xs" c="dimmed" mt={2}>
                        {template.exerciseCount} exercise{template.exerciseCount === 1 ? '' : 's'}
                        {' · '}
                        {formatUpdatedAt(template.updatedAt)}
                    </Text>
                </Stack>
            </Box>
        </UnstyledButton>
    );
}

function formatUpdatedAt(value) {
    if (!value) {
        return '—';
    }

    const updatedAt = new Date(value);

    if (Number.isNaN(updatedAt.getTime())) {
        return '—';
    }

    const elapsedMinutes = Math.floor(
        Math.max(0, Date.now() - updatedAt.getTime()) / 60000,
    );

    if (elapsedMinutes < 1) {
        return 'Just now';
    }

    if (elapsedMinutes < 60) {
        return `${elapsedMinutes}m ago`;
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);

    if (elapsedHours < 24) {
        return `${elapsedHours}h ago`;
    }

    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedDays < 7) {
        return `${elapsedDays}d ago`;
    }

    return updatedAt.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: updatedAt.getFullYear() === new Date().getFullYear()
            ? undefined
            : 'numeric',
    });
}

export default WorkoutTemplatePicker;