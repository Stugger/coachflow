import {ThemeIcon} from '@mantine/core';
import {IconCheck, IconMinus} from '@tabler/icons-react';

import {CLIENT_WORKOUT_PROGRESS_STATUS} from './client-workout-session-utils.js';

function ClientWorkoutProgressIcon({status, size = 24}) {
    const completed = status === CLIENT_WORKOUT_PROGRESS_STATUS.COMPLETED;
    const inProgress = status === CLIENT_WORKOUT_PROGRESS_STATUS.IN_PROGRESS;

    return (
        <ThemeIcon
            size={size}
            radius="xl"
            variant="light"
            color={completed ? 'green' : inProgress ? 'yellow' : 'gray'}
        >
            {inProgress
                ? <IconMinus size={15} stroke={3}/>
                : <IconCheck size={15} stroke={3}/>
            }
        </ThemeIcon>
    );
}

export default ClientWorkoutProgressIcon;