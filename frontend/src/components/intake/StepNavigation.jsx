import {Button, Group} from '@mantine/core';

function StepNavigation({onBack, submitLabel = 'Save & Continue'}) {
    return (
        <Group justify="space-between" mt="sm">
            <Button
                type="button"
                variant="default"
                onClick={onBack}
            >
                Go Back
            </Button>

            <Button type="submit">
                {submitLabel}
            </Button>
        </Group>
    );
}

export default StepNavigation;