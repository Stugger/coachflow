import {Button, Group} from '@mantine/core';

function StepNavigation({onBack, isReviewEditing = false, submitLabel = 'Save & Continue'}) {
    return (
        <Group justify={isReviewEditing ? "flex-end" : "space-between"} mt="sm">
            {!isReviewEditing && (
                <Button
                    type="button"
                    variant="default"
                    onClick={onBack}
                >
                    Go Back
                </Button>
            )}

            <Button type="submit">
                {isReviewEditing ? 'Save & Return to Records' : submitLabel}
            </Button>
        </Group>
    );
}

export default StepNavigation;