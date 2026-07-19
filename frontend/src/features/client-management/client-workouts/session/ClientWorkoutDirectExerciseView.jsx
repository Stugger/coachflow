import {Fragment, useState} from 'react';
import {
    Accordion,
    Box,
    Group,
    Stack,
    Text,
} from '@mantine/core';

import ClientWorkoutExerciseInformation from './ClientWorkoutExerciseInformation.jsx';
import ClientWorkoutProgressIcon from './ClientWorkoutProgressIcon.jsx';
import ClientWorkoutSessionSetMetadata from './ClientWorkoutSessionSetMetadata.jsx';
import ClientWorkoutSessionSetEditor from './ClientWorkoutSessionSetEditor.jsx';
import ClientWorkoutSessionRestTimer from './ClientWorkoutSessionRestTimer.jsx';

import {
    CLIENT_WORKOUT_PROGRESS_STATUS,
    getDirectExerciseSessionSets,
} from './client-workout-session-utils.js';

import {
    getSetRestSeconds,
} from './client-workout-set-result-utils.js';

function ClientWorkoutDirectExerciseView({workoutId, item, resultIndex, colorScheme, onResultSaved}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const {config, sets} = getDirectExerciseSessionSets(item, resultIndex);

    const firstIncompleteSet = sets.find(
        set => set.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
    ) ?? null;

    const [expandedSetKey, setExpandedSetKey] = useState(firstIncompleteSet?.setKey ?? null);

    const [activeRest, setActiveRest] = useState(null);

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function handleSetCompleted(setIndex) {
        const completedSet = sets[setIndex];
        const restSeconds = getSetRestSeconds(completedSet);

        setActiveRest(
            restSeconds
                ? {
                    sourceKey: completedSet.setKey,
                    durationSeconds: restSeconds,
                    startedAt: window.performance.now(),
                }
                : null
        );

        const nextSet = sets
            .slice(setIndex + 1)
            .find(set => set.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED);

        if (nextSet) {
            setExpandedSetKey(nextSet.setKey);
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Stack gap="md">
            <ClientWorkoutExerciseInformation exercise={item.exercise}/>

            <Accordion
                value={expandedSetKey}
                onChange={setExpandedSetKey}
                variant="separated"
                radius="md"
            >
                {sets.map((set, index) => (
                    <Fragment key={set.setKey}>
                        <Accordion.Item
                            value={set.setKey}
                            style={{
                                borderLeft: set.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
                                    ? '3px solid var(--mantine-color-green-outline)'
                                    : set.status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS
                                        ? '3px solid var(--mantine-color-yellow-outline)'
                                        : (colorScheme === 'light' ? '3px solid darkgray' : '3px solid gray'),
                                boxShadow: expandedSetKey === String(set.setKey) ? "0px 3px 10px -1px rgba(0, 0, 0, 0.1), 0px 6px 20px -4px rgba(0, 0, 0, 0.05)" : undefined,
                            }}
                        >
                            <Accordion.Control icon={<ClientWorkoutProgressIcon status={set.status}/>}>
                                <Group justify="space-between" pr="sm" wrap="nowrap">
                                    <Group gap={8} wrap="wrap">
                                        <Text fw={700}>Set {set.number}</Text>
                                        <ClientWorkoutSessionSetMetadata setType={set.setType} eachSide={config.eachSide}/>
                                    </Group>

                                    <Text size="sm" fw={600} c="dimmed">
                                        {set.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
                                            ? 'Complete'
                                            : set.status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS
                                                ? 'In progress'
                                                : 'Not started'
                                        }
                                    </Text>
                                </Group>
                            </Accordion.Control>

                            <Accordion.Panel>
                                <ClientWorkoutSessionSetEditor
                                    workoutId={workoutId}
                                    clientWorkoutItemId={item.id}
                                    config={config}
                                    set={set}
                                    result={set.result}
                                    completeLabel={index === sets.length - 1 ? 'Complete Exercise' : 'Complete & Next Set'}
                                    colorScheme={colorScheme}
                                    onResultSaved={onResultSaved}
                                    onCompleted={() => handleSetCompleted(index)}
                                />
                            </Accordion.Panel>
                        </Accordion.Item>

                        {activeRest?.sourceKey === set.setKey && (
                            <Box mt="md" mb="md">
                                <ClientWorkoutSessionRestTimer
                                    durationSeconds={activeRest.durationSeconds}
                                    startedAt={activeRest.startedAt}
                                    onFinished={() => setActiveRest(null)}
                                />
                            </Box>
                        )}
                    </Fragment>
                ))}
            </Accordion>
        </Stack>
    );
}

export default ClientWorkoutDirectExerciseView;