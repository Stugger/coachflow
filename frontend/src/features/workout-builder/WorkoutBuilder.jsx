import {Paper, Stack, Text} from '@mantine/core';

function WorkoutBuilder({draft, exercises, onChange}) {
    return (
        <Paper withBorder radius="md" p="md">
            <Stack gap="xs">
                <Text fw={800}>Workout Builder</Text>
                <Text size="sm" c="dimmed">
                    TODO - sections, exercises, stacks, tracking fields, sets, and rest periods.
                </Text>
            </Stack>
        </Paper>
    );
}

export default WorkoutBuilder;