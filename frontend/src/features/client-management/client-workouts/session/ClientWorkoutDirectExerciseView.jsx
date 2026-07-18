import {useState} from 'react';
import {
    Accordion,
    Badge,
    Group,
    Stack,
    Text,
} from '@mantine/core';

import {WORKOUT_SET_TYPE_OPTIONS} from '../../../workout-builder/workout-builder-constants.js';

import ClientWorkoutExerciseInformation from './ClientWorkoutExerciseInformation.jsx';
import ClientWorkoutProgressIcon from './ClientWorkoutProgressIcon.jsx';
import ClientWorkoutSessionSetEditor from './ClientWorkoutSessionSetEditor.jsx';
import {
    CLIENT_WORKOUT_PROGRESS_STATUS,
    getDirectExerciseSessionSets,
} from './client-workout-session-utils.js';

function ClientWorkoutDirectExerciseView({workoutId, item, resultIndex, onResultSaved}) {

    const {config, sets} = getDirectExerciseSessionSets(item, resultIndex);

    const firstIncompleteSet = sets.find(
        set => set.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED,
    ) ?? sets[0] ?? null;

    const [expandedSetKey, setExpandedSetKey] = useState(firstIncompleteSet?.setKey ?? null);

    function handleSetCompleted(setIndex) {
        const nextSet = sets
            .slice(setIndex + 1)
            .find(set => set.status !== CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED);

        if (nextSet) {
            setExpandedSetKey(nextSet.setKey);
        }
    }

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
                    <Accordion.Item
                        key={set.setKey}
                        value={set.setKey}
                        style={{
                            borderLeft: set.status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED
                                ? '3px solid var(--mantine-color-green-outline)'
                                : set.status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS
                                    ? '3px solid var(--mantine-color-yellow-outline)'
                                    : '3px solid gray',
                            boxShadow: expandedSetKey === String(set.setKey) ? "0px 3px 10px -1px rgba(0, 0, 0, 0.1), 0px 6px 20px -4px rgba(0, 0, 0, 0.05)" : undefined,
                        }}
                    >
                        <Accordion.Control icon={<ClientWorkoutProgressIcon status={set.status}/>}>
                            <Group justify="space-between" pr="sm" wrap="nowrap">
                                <Group gap="xs">
                                    <Text fw={700}>Set {set.number}</Text>
                                    <SetTypeBadge setType={set.setType}/>
                                </Group>

                                <Text size="sm" fw={600} c="dimmed">
                                    {getStatusLabel(set.status)}
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
                                onResultSaved={onResultSaved}
                                onCompleted={() => handleSetCompleted(index)}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>
        </Stack>
    );
}

function getStatusLabel(status) {
    if (status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED) {
        return 'Complete';
    }

    if (status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS) {
        return 'In progress';
    }

    return 'Not started';
}

function SetTypeBadge({setType}) {
    const option = WORKOUT_SET_TYPE_OPTIONS.find(option => option.value === setType);

    return (
        <Badge size="xs" variant="light" color={option?.color ?? 'gray'}>
            {option?.label ?? setType}
        </Badge>
    );
}

export default ClientWorkoutDirectExerciseView;