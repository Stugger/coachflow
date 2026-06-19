import {
    Modal,
    Paper,
    Stack,
    Text,
} from '@mantine/core';

function ExercisePickerModal({opened, exercises, onClose, onAdd}) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Add Exercise"
            centered
        >
            <Stack gap="xs">
                {exercises.map(exercise => (
                    <Paper
                        key={exercise.id}
                        withBorder
                        radius="md"
                        p="sm"
                        style={{cursor: 'pointer'}}
                        onClick={() => onAdd(exercise)}
                    >
                        <Text fw={700}>{exercise.name}</Text>
                        {exercise.details && (
                            <Text size="sm" c="dimmed" lineClamp={2}>
                                {exercise.details}
                            </Text>
                        )}
                    </Paper>
                ))}
            </Stack>
        </Modal>
    );
}

export default ExercisePickerModal;