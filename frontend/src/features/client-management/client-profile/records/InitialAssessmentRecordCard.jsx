import {
    Alert,
    Button,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
} from '@mantine/core';
import {
    IconEdit,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';

function InitialAssessmentRecordCard({workout, loaded, error, deleting, onCreate, onEdit, onDelete}) {

    if (!loaded) {
        return (
            <Group gap="sm">
                <Loader size="sm"/>
                <Text size="sm" c="dimmed">
                    Loading initial assessment…
                </Text>
            </Group>
        );
    }

    if (error) {
        return (
            <Alert color="red">
                {error}
            </Alert>
        );
    }

    if (!workout) {
        return (
            <Stack gap="sm">
                <Text size="sm" c="dimmed">
                    Create an assessment workout plan before the client's first assessment.
                </Text>

                <Group>
                    <Button
                        leftSection={<IconPlus size={16}/>}
                        onClick={onCreate}
                    >
                        Set Up Assessment
                    </Button>
                </Group>
            </Stack>
        );
    }

    const summary = getWorkoutSummary(workout);

    return (
        <Stack gap="md">
            <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                    <Text fw={700}>
                        {workout.name}
                    </Text>

                    <Text size="sm" c="dimmed">
                        {summary.exerciseCount} exercise{summary.exerciseCount === 1 ? '' : 's'}
                        {' · '}
                        {summary.sectionCount} section{summary.sectionCount === 1 ? '' : 's'}
                    </Text>

                    {workout.description && (
                        <Text size="sm" c="dimmed">
                            {workout.description}
                        </Text>
                    )}
                </Stack>
            </Group>

            {summary.sections.length > 0 && (
                <Stack gap="xs">
                    {summary.sections.map(section => (
                        <Paper
                            key={section.key}
                            withBorder
                            radius="sm"
                            p="sm"
                        >
                            <Stack gap={4}>
                                <Text size="sm" fw={600}>
                                    {section.name}
                                </Text>

                                {section.items.map(item => (
                                    <Text
                                        key={item.key}
                                        size="sm"
                                        c="dimmed"
                                    >
                                        {item.label}
                                    </Text>
                                ))}
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}

            <Group>
                <Button
                    leftSection={<IconEdit size={16}/>}
                    onClick={() => onEdit(workout.id)}
                >
                    Edit
                </Button>

                <Button
                    variant="light"
                    color="red"
                    leftSection={<IconTrash size={16}/>}
                    loading={deleting}
                    onClick={onDelete}
                >
                    Delete
                </Button>
            </Group>
        </Stack>
    );
}

function getWorkoutSummary(workout) {
    const sections = workout.sections ?? [];

    return {
        sectionCount: sections.length,
        exerciseCount: sections.reduce((count, section) => {
            return count + (section.items ?? []).reduce((sectionCount, item) => {
                return sectionCount + (item.exercise
                        ? 1
                        : item.itemExercises?.length ?? 0
                );
            }, 0);
        }, 0),
        sections: sections.map((section, sectionIndex) => ({
            key: section.id ?? `section-${sectionIndex}`,
            name: section.name?.trim() || formatLabel(section.sectionType),
            items: (section.items ?? []).map((item, itemIndex) => ({
                key: item.id ?? `item-${itemIndex}`,
                label: getItemLabel(item),
            })),
        })),
    };
}

function getItemLabel(item) {
    if (item.exercise) {
        return item.name?.trim() || item.exercise.name;
    }

    const exercises = (item.itemExercises ?? [])
        .map(itemExercise => itemExercise.name?.trim() || itemExercise.exercise?.name)
        .filter(Boolean)
        .join(' + ');

    return `${formatLabel(item.itemType)}: ${exercises}`;
}

function formatLabel(value) {
    return String(value ?? '')
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default InitialAssessmentRecordCard;