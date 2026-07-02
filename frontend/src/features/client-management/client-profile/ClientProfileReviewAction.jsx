import {
    Button,
    Group,
    Paper,
    Stack,
    Text,
} from '@mantine/core';

function ClientProfileReviewAction({color, icon, title, description, actionLabel, onAction, loading = false}) {
    return (
        <Paper
            withBorder
            radius="md"
            p="lg"
            style={{
                borderLeft: `6px solid var(--mantine-color-${color}-6)`,
            }}
        >
            <Group justify="space-between" align="center" wrap="wrap">
                <Stack gap={2}>
                    <Group gap={6}>
                        {icon}
                        <Text fw={700}>{title}</Text>
                    </Group>

                    <Text size="sm" c="dimmed">
                        {description}
                    </Text>
                </Stack>

                <Button
                    variant='light'
                    loading={loading}
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            </Group>
        </Paper>
    );
}

export default ClientProfileReviewAction;