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
} from '@mantine/core';
import {
    IconArrowLeft,
    IconDotsVertical,
    IconLogout2,
} from '@tabler/icons-react';

import {ROUTES} from '../../../../constants/routes.js';
import {WORKOUT_ITEM_TYPE} from '../../../workout-builder/workout-builder-constants.js';

import ClientWorkoutProgressIcon from './ClientWorkoutProgressIcon.jsx';
import ClientWorkoutDirectExerciseView from './ClientWorkoutDirectExerciseView.jsx';
import ClientWorkoutStackView from './ClientWorkoutStackView.jsx';

import {
    createClientWorkoutResultIndex,
    findClientWorkoutSessionItem,
} from './client-workout-session-utils.js';

function ClientWorkoutSessionItemView({workout, results, itemId, onExitWorkout, onResultSaved}) {

    const navigate = useNavigate();
    const location = useLocation();

    const resultIndex = useMemo(() => createClientWorkoutResultIndex(results), [results]);

    const itemContext = useMemo(
        () => findClientWorkoutSessionItem(workout, itemId, resultIndex),
        [workout, itemId, resultIndex],
    );

    function returnToOverview() {
        navigate(`${ROUTES.clientWorkoutSession(workout.id)}${location.search}`, {
            state: location.state,
        });
    }

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
                            color="red"
                            leftSection={<IconLogout2 size={16}/>}
                            onClick={onExitWorkout}
                        >
                            Exit workout
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            <Paper
                radius={0}
                pb="xs"
                style={{borderBottom: '1px solid var(--color-border)'}}
            >
                <Stack gap={2} px={{base: 'xs', sm: 0}}>
                    <Text size="sm" c="dimmed">
                        {section.name?.trim() || `Section ${section.position}`}
                    </Text>

                    <Group justify="space-between" align="center" wrap="nowrap">
                        <Title order={2}>
                            {item.displayName}
                        </Title>

                        <ClientWorkoutProgressIcon
                            status={item.progress.status}
                            size={30}
                        />
                    </Group>

                    <Text size="sm" c="dimmed">
                        {item.progress.completedUnitCount} of{' '}{item.progress.totalUnitCount}{' '}{getUnitLabel(item.progress)} complete
                    </Text>
                </Stack>
            </Paper>

            {item.itemType === WORKOUT_ITEM_TYPE.EXERCISE ? (
                <ClientWorkoutDirectExerciseView
                    key={item.id}
                    workoutId={workout.id}
                    item={item}
                    resultIndex={resultIndex}
                    onResultSaved={onResultSaved}
                />
            ) : (
                <ClientWorkoutStackView
                    key={item.id}
                    workoutId={workout.id}
                    item={item}
                    resultIndex={resultIndex}
                    onResultSaved={onResultSaved}
                />
            )}
        </Stack>
    );
}

function getUnitLabel(progress) {
    return progress.totalUnitCount === 1 ? progress.unitLabel : `${progress.unitLabel}s`;
}

export default ClientWorkoutSessionItemView;