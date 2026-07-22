import {useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    ActionIcon,
    Alert,
    Button,
    Group,
    Menu,
    Paper,
    Stack,
    Text,
    Title,
    useMantineColorScheme,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconArrowRight,
    IconDotsVertical,
    IconLogout2,
    IconSun,
    IconMoon,
    IconTrash,
} from '@tabler/icons-react';

import {ROUTES} from '../../../../../constants/routes.js';
import {WORKOUT_ITEM_TYPE} from '../../../../workout-builder/workout-builder-constants.js';

import ClientWorkoutProgressIcon from '../shared/ClientWorkoutProgressIcon.jsx';
import ClientWorkoutDirectExerciseView from './ClientWorkoutDirectExerciseView.jsx';
import ClientWorkoutStackView from './ClientWorkoutStackView.jsx';

import {
    CLIENT_WORKOUT_PROGRESS_STATUS,
    createClientWorkoutResultIndex,
    findClientWorkoutSessionItem,
    findNextIncompleteClientWorkoutSessionItem,
    findNextClientWorkoutSessionItem,
} from '../client-workout-session-utils.js';
import {ClientWorkoutLiveDurationBadge} from "../shared/ClientWorkoutSessionTiming.jsx";

function ClientWorkoutSessionItemView({workout, results, benchmarks, itemId, isSmallScreen, onExitWorkout, onAbandonWorkout, onOpenItem, onResultSaved}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Layout state
    // ------------------------------------------------------------------------------------------------------------------------

    const {colorScheme, toggleColorScheme} = useMantineColorScheme();

    // ------------------------------------------------------------------------------------------------------------------------
    // Router state
    // ------------------------------------------------------------------------------------------------------------------------

    const navigate = useNavigate();
    const location = useLocation();

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const recordMode = workout.status === 'COMPLETED';

    const resultIndex = useMemo(() => createClientWorkoutResultIndex(results), [results]);

    const itemContext = useMemo(
        () => findClientWorkoutSessionItem(workout, itemId, resultIndex),
        [workout, itemId, resultIndex],
    );

    const nextItemContext = useMemo(
        () => recordMode
            ? findNextClientWorkoutSessionItem(
                workout,
                itemId,
                resultIndex,
            )
            : findNextIncompleteClientWorkoutSessionItem(
                workout,
                itemId,
                resultIndex,
            ),
        [workout, itemId, resultIndex, recordMode],
    );

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function returnToOverview() {
        navigate(`${ROUTES.clientWorkoutSession(workout.id)}${location.search}`, {
            state: location.state,
        });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Conditional return
    // ------------------------------------------------------------------------------------------------------------------------

    if (!itemContext) {
        return (
            <Stack gap="md">
                <Button
                    variant="subtle"
                    w="fit-content"
                    leftSection={<IconArrowLeft size={16}/>}
                    onClick={returnToOverview}
                >
                    Back to Overview
                </Button>

                <Alert color="red">
                    Workout item not found.
                </Alert>
            </Stack>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    const {section, item} = itemContext;

    return (
        <Stack gap="sm">
            <Group justify="space-between" wrap="nowrap">
                <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={16}/>}
                    pl={{base: 'xs', sm: 0}}
                    pr="xs"
                    onClick={returnToOverview}
                >
                    Overview
                </Button>

                <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" aria-label="Workout options">
                            <IconDotsVertical size={18}/>
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconLogout2 size={16}/>}
                            onClick={onExitWorkout}
                        >
                            Exit workout
                        </Menu.Item>

                        <Menu.Divider/>

                        <Menu.Item
                            leftSection={colorScheme === 'dark'
                                ? <IconSun size={16}/>
                                : <IconMoon size={16}/>
                            }
                            onClick={toggleColorScheme}
                        >
                            {colorScheme === 'light' ? 'Dark mode' : 'Light mode'}
                        </Menu.Item>

                        {workout.status === 'IN_PROGRESS' && (
                            <>
                                <Menu.Divider/>

                                <Menu.Label>Danger zone</Menu.Label>

                                <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={16}/>}
                                    onClick={onAbandonWorkout}
                                >
                                    Abandon workout
                                </Menu.Item>
                            </>
                        )}
                    </Menu.Dropdown>
                </Menu>
            </Group>

            <Paper
                radius={0}
                pb="xs"
                style={{borderBottom: '1px solid var(--color-border)'}}
            >
                <Stack gap={2} px={{base: 'xs', sm: 0}}>
                    <Group justify="space-between" wrap="nowrap">
                        <Text size="sm" c="dimmed">
                            {section.name?.trim() || `Section ${section.position}`}
                        </Text>

                        {!recordMode && (
                            <ClientWorkoutLiveDurationBadge
                                startedAt={workout.startedAt}
                                subtle
                            />
                        )}
                    </Group>

                    <Group gap={4} justify="space-between" align="center" wrap="nowrap">
                        <Title order={2}>
                            {item.displayName}
                        </Title>

                        <ClientWorkoutProgressIcon
                            status={item.progress.status}
                            size={30}
                        />
                    </Group>

                    <Text size="sm" c="dimmed">
                        {item.progress.completedUnitCount} of{' '}{item.progress.totalUnitCount}{' '}{getUnitLabel(item.progress)} {recordMode ? 'completed' : 'complete'}
                    </Text>
                </Stack>
            </Paper>

            {item.itemType === WORKOUT_ITEM_TYPE.EXERCISE ? (
                <ClientWorkoutDirectExerciseView
                    key={item.id}
                    workoutId={workout.id}
                    item={item}
                    resultIndex={resultIndex}
                    benchmarks={benchmarks}
                    recordMode={recordMode}
                    colorScheme={colorScheme}
                    onResultSaved={onResultSaved}
                />
            ) : (
                <ClientWorkoutStackView
                    key={item.id}
                    workoutId={workout.id}
                    item={item}
                    resultIndex={resultIndex}
                    benchmarks={benchmarks}
                    recordMode={recordMode}
                    isSmallScreen={isSmallScreen}
                    colorScheme={colorScheme}
                    onResultSaved={onResultSaved}
                />
            )}
            {(recordMode || item.progress.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED) && (
                <Stack gap="xs" mt={isSmallScreen ? "sm" : "md"}>
                    {nextItemContext ? (
                        <>
                            <Button
                                fullWidth
                                size="md"
                                rightSection={<IconArrowRight size={18}/>}
                                onClick={() => onOpenItem(nextItemContext.item.id)}
                            >
                                <Text fw={600} truncate>
                                    Next: {nextItemContext.item.displayName}
                                </Text>
                            </Button>

                            <Button
                                variant="subtle"
                                color="gray"
                                onClick={returnToOverview}
                            >
                                Back to overview
                            </Button>
                        </>
                    ) : (
                        <Button
                            fullWidth
                            size="md"
                            variant="default"
                            leftSection={<IconArrowLeft size={18}/>}
                            onClick={returnToOverview}
                        >
                            Back to overview
                        </Button>
                    )}
                </Stack>
            )}
        </Stack>
    );
}

function getUnitLabel(progress) {
    return progress.totalUnitCount === 1 ? progress.unitLabel : `${progress.unitLabel}s`;
}

export default ClientWorkoutSessionItemView;