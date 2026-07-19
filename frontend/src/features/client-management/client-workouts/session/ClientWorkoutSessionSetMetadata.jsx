import {
    Badge,
    Group,
} from '@mantine/core';

import {WORKOUT_SET_TYPE_OPTIONS} from '../../../workout-builder/workout-builder-constants.js';

function ClientWorkoutSessionSetMetadata({setType, eachSide}) {

    const setTypeOption = WORKOUT_SET_TYPE_OPTIONS.find(option => option.value === setType);

    return (
        <Group gap={4} wrap="wrap">
            <Badge size="xs" variant="light" color={setTypeOption?.color ?? 'gray'}>
                {setTypeOption?.label ?? setType}
            </Badge>

            {eachSide && (
                <Badge size="xs" variant="outline" color="gray">
                    Each side
                </Badge>
            )}
        </Group>
    );
}

export default ClientWorkoutSessionSetMetadata;