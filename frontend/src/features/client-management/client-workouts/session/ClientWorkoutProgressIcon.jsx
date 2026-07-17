import {ThemeIcon} from '@mantine/core';
import {
    IconCheck,
    IconCircleDashedCheck,
    IconMinus
} from '@tabler/icons-react';

import {CLIENT_WORKOUT_PROGRESS_STATUS} from './client-workout-session-utils.js';

function ClientWorkoutProgressIcon({status, size = 24}) {

    const completed = status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED;
    const inProgress = status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS;

    return (
        <>
            {!inProgress && !completed ? (
                <IconCircleDashedCheck size={size} stroke={2} color='gray'/>
            ) : (
                <ThemeIcon
                    size={size}
                    radius="xl"
                    color={completed ? 'green' : 'yellow'}
                >
                    {completed
                        ? <IconCheck size={Math.round(size * 0.7)} stroke={4}/>
                        : <IconMinus size={Math.round(size * 0.7)} stroke={4}/>
                    }
                </ThemeIcon>
            )}
        </>
    );
}

export default ClientWorkoutProgressIcon;