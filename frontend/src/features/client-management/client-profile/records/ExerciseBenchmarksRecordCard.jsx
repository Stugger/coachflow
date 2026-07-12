import {useCallback, useEffect, useMemo, useState} from 'react';
import {
    useComputedColorScheme,
    ActionIcon,
    Alert,
    Avatar,
    Badge,
    Box,
    Button,
    Collapse,
    Divider,
    Drawer,
    Group,
    Loader,
    Menu,
    Modal,
    Paper,
    Stack,
    Text,
    ThemeIcon,
    UnstyledButton,
} from '@mantine/core';
import {
    IconAlertCircle,
    IconChevronDown,
    IconChevronUp,
    IconDotsVertical,
    IconEdit,
    IconHistory,
    IconPhoto,
    IconPlus,
    IconTrash,
    IconTrophy,
} from '@tabler/icons-react';

import {
    apiCreateClientExerciseBenchmark,
    apiDeleteClientExerciseBenchmark,
    apiGetClientExerciseBenchmarkHistory,
    apiUpdateClientExerciseBenchmark,
} from '../../benchmarks/client-exercise-benchmarks-api.js';

import {
    formatExerciseBenchmarkValue,
    getAvailableExerciseBenchmarkDefinitions,
    getExerciseBenchmarkBasisLabel,
    getExerciseBenchmarkDefinition,
} from '../../benchmarks/exercise-benchmark-definitions.js';

import {apiGetExercises} from '../../../exercises/exercises-api.js';
import ExercisePickerModal from '../../../exercises/picker/ExercisePickerModal.jsx';
import ExerciseViewer from '../../../exercises/components/ExerciseViewer.jsx';
import ExerciseBenchmarkForm from '../../benchmarks/components/ExerciseBenchmarkForm.jsx';

import {useIsSmallScreen} from '../../../../hooks/useIsSmallScreen.js';
import {resolveMediaUrl} from '../../../../utils/media-url-utils.js';
import {formatDisplayLongDate} from '../../../../utils/time-utils.js';

// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

function groupBenchmarksByExercise(benchmarks) {
    const groups = new Map();

    for (const benchmark of benchmarks) {
        const exerciseId = benchmark.exercise.id;
        const group = groups.get(exerciseId) ?? {
            exercise: benchmark.exercise,
            benchmarks: [],
        };

        group.benchmarks.push(benchmark);
        groups.set(exerciseId, group);
    }

    return Array.from(groups.values());
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

function ExerciseBenchmarksRecordCard({clientId, benchmarks = [], loaded, loadError, onReload}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Responsive state
    // ------------------------------------------------------------------------------------------------------------------------

    const isSmallScreen = useIsSmallScreen();
    const colorScheme = useComputedColorScheme('light');

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [actionError, setActionError] = useState('');

    const [eligibleExercises, setEligibleExercises] = useState(null);
    const [loadingExercises, setLoadingExercises] = useState(false);
    const [exercisePickerOpened, setExercisePickerOpened] = useState(false);

    const [selectedExercise, setSelectedExercise] = useState(null);
    const [selectedBenchmarkType, setSelectedBenchmarkType] = useState(null);
    const [editingBenchmark, setEditingBenchmark] = useState(null);
    const [benchmarkFormOpened, setBenchmarkFormOpened] = useState(false);

    const [expandedHistoryExerciseIds, setExpandedHistoryExerciseIds] = useState(new Set());
    const [historyByExerciseId, setHistoryByExerciseId] = useState({});
    const [historyLoadingExerciseIds, setHistoryLoadingExerciseIds] = useState(new Set());
    const [historyErrors, setHistoryErrors] = useState({});

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [viewerExercise, setViewerExercise] = useState(null);

    const benchmarkGroups = useMemo(
        () => groupBenchmarksByExercise(benchmarks),
        [benchmarks],
    );

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects & Callbacks
    // ------------------------------------------------------------------------------------------------------------------------

    const loadExerciseHistory = useCallback((exerciseId) => {
        setHistoryLoadingExerciseIds(current => {
            const next = new Set(current);
            next.add(exerciseId);
            return next;
        });
        setHistoryErrors(current => ({
            ...current,
            [exerciseId]: '',
        }));

        return apiGetClientExerciseBenchmarkHistory(clientId, {
            exerciseIds: [exerciseId],
        })
            .then(history => {
                setHistoryByExerciseId(current => ({
                    ...current,
                    [exerciseId]: history ?? [],
                }));
            })
            .catch(error => {
                console.error('Failed to load exercise benchmark history:', error);
                setHistoryErrors(current => ({
                    ...current,
                    [exerciseId]: error.message || 'Failed to load benchmark history.',
                }));
            })
            .finally(() => {
                setHistoryLoadingExerciseIds(current => {
                    const next = new Set(current);
                    next.delete(exerciseId);
                    return next;
                });
            });
    }, [clientId]);

    useEffect(() => {
        setEligibleExercises(null);
        setExpandedHistoryExerciseIds(new Set());
        setHistoryByExerciseId({});
        setHistoryErrors({});
    }, [clientId]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    async function openExercisePicker() {
        setActionError('');

        if (eligibleExercises !== null) {
            setExercisePickerOpened(true);
            return;
        }

        setLoadingExercises(true);

        try {
            const exercises = await apiGetExercises();
            const eligible = (exercises ?? []).filter(
                exercise => getAvailableExerciseBenchmarkDefinitions(exercise).length > 0
            );

            setEligibleExercises(eligible);
            setExercisePickerOpened(true);
        } catch (error) {
            console.error('Failed to load exercises for benchmarks:', error);
            setActionError(error.message || 'Failed to load exercises.');
        } finally {
            setLoadingExercises(false);
        }
    }

    function selectExercise(exercise) {
        const definitions = getAvailableExerciseBenchmarkDefinitions(exercise);

        setExercisePickerOpened(false);
        setSelectedExercise(exercise);
        setSelectedBenchmarkType(definitions[0]?.type ?? null);
        setEditingBenchmark(null);
        setBenchmarkFormOpened(true);
    }

    function recordBenchmark(exercise, benchmarkType = null) {
        setSelectedExercise(exercise);
        setSelectedBenchmarkType(benchmarkType);
        setEditingBenchmark(null);
        setBenchmarkFormOpened(true);
    }

    function editBenchmark(benchmark) {
        setSelectedExercise(benchmark.exercise);
        setSelectedBenchmarkType(benchmark.benchmarkType);
        setEditingBenchmark(benchmark);
        setBenchmarkFormOpened(true);
    }

    function closeBenchmarkForm() {
        setBenchmarkFormOpened(false);
        setSelectedExercise(null);
        setSelectedBenchmarkType(null);
        setEditingBenchmark(null);
    }

    async function saveBenchmark(payload) {
        const exerciseId = selectedExercise.id;

        if (editingBenchmark) {
            await apiUpdateClientExerciseBenchmark(
                clientId,
                editingBenchmark.id,
                payload,
            );
        } else {
            await apiCreateClientExerciseBenchmark(clientId, payload);
        }

        await onReload?.(false);

        if (Object.hasOwn(historyByExerciseId, exerciseId)) {
            await loadExerciseHistory(exerciseId);
        }

        closeBenchmarkForm();
    }

    async function deleteBenchmark() {
        if (!deleteTarget) {
            return;
        }

        const exerciseId = deleteTarget.exercise.id;

        setDeleting(true);
        setActionError('');

        try {
            await apiDeleteClientExerciseBenchmark(clientId, deleteTarget.id);
            setDeleteTarget(null);
            await onReload?.(false);

            if (Object.hasOwn(historyByExerciseId, exerciseId)) {
                await loadExerciseHistory(exerciseId);
            }
        } catch (error) {
            console.error('Failed to delete exercise benchmark:', error);
            setActionError(error.message || 'Failed to delete the exercise benchmark.');
        } finally {
            setDeleting(false);
        }
    }

    function toggleHistory(exerciseId) {
        const expanding = !expandedHistoryExerciseIds.has(exerciseId);

        setExpandedHistoryExerciseIds(current => {
            const next = new Set(current);

            if (expanding) {
                next.add(exerciseId);
            } else {
                next.delete(exerciseId);
            }

            return next;
        });

        if (expanding && !Object.hasOwn(historyByExerciseId, exerciseId)) {
            loadExerciseHistory(exerciseId);
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderBenchmarkActions(benchmark, includeRecordAction) {
        const canRecordAnother = includeRecordAction
            && getAvailableExerciseBenchmarkDefinitions(benchmark.exercise)
                .some(definition => definition.type === benchmark.benchmarkType);

        return (
            <Menu shadow="md" position="bottom-end" transitionProps={{duration: 0}}>
                <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" aria-label="Benchmark options">
                        <IconDotsVertical size={18}/>
                    </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                    {canRecordAnother && (
                        <Menu.Item
                            leftSection={<IconPlus size={15}/>}
                            onClick={() => recordBenchmark(
                                benchmark.exercise,
                                benchmark.benchmarkType,
                            )}
                        >
                            Record new result
                        </Menu.Item>
                    )}

                    <Menu.Item
                        leftSection={<IconEdit size={15}/>}
                        onClick={() => editBenchmark(benchmark)}
                    >
                        Edit record
                    </Menu.Item>

                    <Menu.Divider/>

                    <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={15}/>}
                        onClick={() => setDeleteTarget(benchmark)}
                    >
                        Delete record
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        );
    }

    function renderBenchmarkRecord(benchmark, {current = false, badge = true} = {}) {
        const definition = getExerciseBenchmarkDefinition(benchmark.benchmarkType);

        return (
            <Group
                key={benchmark.id}
                justify="space-between"
                wrap="nowrap"
                gap="sm"
                py="xs"
            >
                <Stack gap={2} style={{minWidth: 0}}>
                    <Group gap="xs">
                        <Text size="sm" fw={700}>
                            {definition?.shortLabel ?? benchmark.benchmarkType}
                        </Text>
                        <Text size="sm" fw={600}>
                            {formatExerciseBenchmarkValue(benchmark)}
                        </Text>
                        {current && badge && (
                            <Badge size="xs" variant="light" color="blue">
                                Current
                            </Badge>
                        )}
                    </Group>

                    <Text size="xs" c="dimmed">
                        {formatDisplayLongDate(benchmark.achievedAt)}
                        {' · '}
                        {getExerciseBenchmarkBasisLabel(benchmark.basis)}
                        {benchmark.notes?.trim() ? ` · ${benchmark.notes.trim()}` : ''}
                    </Text>
                </Stack>

                {renderBenchmarkActions(benchmark, current)}
            </Group>
        );
    }

    function renderHistory(group) {
        const exerciseId = group.exercise.id;
        const expanded = expandedHistoryExerciseIds.has(exerciseId);
        const loading = historyLoadingExerciseIds.has(exerciseId);
        const history = historyByExerciseId[exerciseId] ?? [];
        const error = historyErrors[exerciseId];
        const currentIds = new Set(group.benchmarks.map(benchmark => benchmark.id));

        return (
            <Collapse expanded={expanded}>
                <Divider mb="sm" size={2} color={'var(--color-border)'}/>

                <Stack gap={4}>
                    <Group gap={6}>
                        <IconHistory size={16}/>
                        <Text size="sm" fw={700} mb={2}>
                            History
                        </Text>
                    </Group>

                    {loading && (
                        <Group gap="sm" py="sm">
                            <Loader size="sm"/>
                            <Text size="sm" c="dimmed">
                                Loading benchmark history…
                            </Text>
                        </Group>
                    )}

                    {error && (
                        <Alert color="red" icon={<IconAlertCircle size={16}/>}> 
                            {error}
                        </Alert>
                    )}

                    {!loading && !error && history.length === 0 && (
                        <Text size="sm" c="dimmed" py="xs">
                            No benchmark history is available.
                        </Text>
                    )}

                    {!loading && !error && history.map((benchmark, index) => (
                        <Box
                            key={benchmark.id}
                            style={{
                                borderBottom: index === history.length - 1 ? 'none' : '1px solid var(--color-border)',
                            }}
                        >
                            {renderBenchmarkRecord(benchmark, {
                                current: currentIds.has(benchmark.id),
                            })}
                        </Box>
                    ))}
                </Stack>
            </Collapse>
        );
    }

    function renderExerciseGroup(group) {
        const expanded = expandedHistoryExerciseIds.has(group.exercise.id);

        return (
            <Paper
                key={group.exercise.id}
                withBorder
                radius="md"
                p="sm"
                bg={colorScheme === 'light' ? "#fcfdfe" : "#252525"}
                style={{borderColor: 'var(--color-border)'}}
            >
                <Stack gap="xs">
                    <Group justify="space-between" wrap="nowrap">
                        <UnstyledButton
                            onClick={() => setViewerExercise(group.exercise)}
                            style={{minWidth: 0, flex: 1}}
                        >
                            <Group wrap="nowrap">
                                <Avatar
                                    src={resolveMediaUrl(group.exercise.thumbnailUrl)}
                                    alt={group.exercise.name}
                                    size={isSmallScreen ? 40 : 52}
                                    radius="sm"
                                >
                                    <IconPhoto size={20}/>
                                </Avatar>

                                <Stack gap={2} style={{minWidth: 0}}>
                                    <Text fw={700} truncate="end">
                                        {group.exercise.name}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        View exercise details
                                    </Text>
                                </Stack>
                            </Group>
                        </UnstyledButton>

                        <Button
                            variant="subtle"
                            color="gray"
                            size="xs"
                            rightSection={expanded
                                ? <IconChevronUp size={15}/>
                                : <IconChevronDown size={15}/>
                            }
                            onClick={() => toggleHistory(group.exercise.id)}
                            styles={{
                                section: isSmallScreen ? { marginInlineStart: '0' } : undefined
                            }}
                        >
                            {isSmallScreen ? <IconHistory size={18}/> : 'History'}
                        </Button>
                    </Group>

                    <Box
                        px="xs"
                        bg={colorScheme === 'light' ? '#ffffff' : '#222222'}
                        style={{
                            borderLeft: `3px solid ${colorScheme === 'light' ? 'var(--color-border)' : '#363636'}`,
                            borderTopRightRadius: 'var(--mantine-radius-md)',
                            borderBottomRightRadius: 'var(--mantine-radius-md)',
                        }}
                    >
                        {group.benchmarks.map(benchmark => (
                            <Box
                                key={benchmark.id}
                            >
                                {renderBenchmarkRecord(benchmark, {current: true, badge: false})}
                            </Box>
                        ))}
                    </Box>

                    {renderHistory(group)}
                </Stack>
            </Paper>
        );
    }

    function renderExerciseViewer() {
        if (!viewerExercise) {
            return null;
        }

        const content = (
            <ExerciseViewer
                exercise={viewerExercise}
                onClose={() => setViewerExercise(null)}
            />
        );

        if (isSmallScreen) {
            return (
                <Drawer
                    opened
                    onClose={() => setViewerExercise(null)}
                    title="Exercise"
                    position="bottom"
                    size="100%"
                    zIndex={300}
                    styles={{
                        title: {fontSize: '1.2rem'},
                        body: {paddingBottom: '2rem'},
                    }}
                >
                    {content}
                </Drawer>
            );
        }

        return (
            <Modal
                opened
                onClose={() => setViewerExercise(null)}
                title="Exercise"
                centered
                size="48rem"
                zIndex={300}
                styles={{title: {fontSize: '1.2rem'}}}
            >
                {content}
            </Modal>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Conditional return
    // ------------------------------------------------------------------------------------------------------------------------

    if (!loaded) {
        return (
            <Group gap="sm">
                <Loader size="sm"/>
                <Text size="sm" c="dimmed">
                    Loading exercise benchmarks…
                </Text>
            </Group>
        );
    }

    if (loadError) {
        return (
            <Alert color="red" icon={<IconAlertCircle size={16}/>}> 
                {loadError}
            </Alert>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            {renderExerciseViewer()}

            <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                    <Stack gap={2} style={{minWidth: 0}}>
                        <Text size="sm" c="dimmed">
                            Record current exercise benchmarks and review reassessment history.
                        </Text>
                    </Stack>

                    <Button
                        size="sm"
                        leftSection={<IconPlus size={16}/>}
                        loading={loadingExercises}
                        onClick={openExercisePicker}
                    >
                        Record Benchmark
                    </Button>
                </Group>

                {actionError && (
                    <Alert
                        color="red"
                        icon={<IconAlertCircle size={16}/>}
                        withCloseButton
                        onClose={() => setActionError('')}
                    >
                        {actionError}
                    </Alert>
                )}

                {benchmarkGroups.length === 0 ? (
                    <Paper withBorder radius="md" p="xl">
                        <Stack gap="xs" align="center" ta="center">
                            <ThemeIcon size="xl" radius="xl" variant="light" color="blue">
                                <IconTrophy size={22}/>
                            </ThemeIcon>
                            <Text fw={700}>No benchmarks recorded</Text>
                            <Text size="sm" c="dimmed" maw="28rem">
                                Record an exercise benchmark to use it for planning and future progress comparisons.
                            </Text>
                        </Stack>
                    </Paper>
                ) : (
                    <Stack gap="md">
                        {benchmarkGroups.map(renderExerciseGroup)}
                    </Stack>
                )}
            </Stack>

            {!benchmarkFormOpened && (
                <ExercisePickerModal
                    opened={exercisePickerOpened}
                    exercises={eligibleExercises ?? []}
                    title="Choose exercise"
                    description={`Only exercises that support ${isSmallScreen ? 'benchmarks' : 'at least one benchmark'} are shown.`}
                    emptyTitle="No benchmark-compatible exercises found"
                    emptyMessage="Add the required default tracking fields to an exercise to enable benchmarks."
                    countLabel={count => `${count} benchmark-compatible exercise${count === 1 ? '' : 's'}`}
                    onClose={() => setExercisePickerOpened(false)}
                    onAdd={selectExercise}
                />
            )}

            {selectedExercise && (
                <ExerciseBenchmarkForm
                    opened={benchmarkFormOpened}
                    exercise={selectedExercise}
                    benchmark={editingBenchmark}
                    initialBenchmarkType={selectedBenchmarkType}
                    onClose={closeBenchmarkForm}
                    onSubmit={saveBenchmark}
                />
            )}

            <Modal
                opened={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title="Delete benchmark record?"
                centered
            >
                <Stack gap="lg">
                    <Text size="sm" c="dimmed">
                        This permanently removes the selected benchmark record. If it is the current value, the previous result will become current.
                    </Text>

                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            disabled={deleting}
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>

                        <Button
                            color="red"
                            loading={deleting}
                            onClick={deleteBenchmark}
                        >
                            Delete record
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}

export default ExerciseBenchmarksRecordCard;
