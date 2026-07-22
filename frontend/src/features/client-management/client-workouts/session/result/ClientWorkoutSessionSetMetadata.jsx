import {
    Badge,
    Group,
} from '@mantine/core';

import {WORKOUT_SET_TYPE, WORKOUT_SET_TYPE_OPTIONS} from '../../../../workout-builder/workout-builder-constants.js';

function ClientWorkoutSessionSetMetadata({setType, eachSide}) {

    const setTypeOption = WORKOUT_SET_TYPE_OPTIONS.find(option => option.value === setType);

    return (
        <Group gap={5} wrap="wrap">
            {setTypeOption?.value !== WORKOUT_SET_TYPE.STANDARD && (
                <Badge size="xs" mb={1} color={setTypeOption?.color ?? 'gray'}>
                    {setTypeOption?.label ?? setType}
                </Badge>
            )}

            {eachSide && (
                <Badge size="xs" mb={1} variant="outline" color="gray">
                    Each side
                </Badge>
            )}
        </Group>
    );
}

export default ClientWorkoutSessionSetMetadata;