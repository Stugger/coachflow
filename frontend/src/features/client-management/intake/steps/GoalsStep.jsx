import {
    Alert,
    Checkbox,
    Group,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Divider,
} from '@mantine/core';
import {IconTargetArrow} from '@tabler/icons-react';
import StepNavigation from "../StepNavigation.jsx";

// ------------------------------------------------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------------------------------------------------

const GOAL_OPTIONS = [
    ['LOSE_WEIGHT', 'Lose weight'],
    ['BUILD_MUSCLE', 'Build muscle'],
    ['GET_STRONGER', 'Get stronger'],
    ['IMPROVE_ENDURANCE', 'Improve endurance'],
    ['IMPROVE_MOBILITY', 'Improve mobility / flexibility'],
    ['IMPROVE_HEALTH', 'Improve overall health'],
    ['SPORT_PERFORMANCE', 'Improve sports performance'],
    ['INCREASE_CONFIDENCE', 'Increase confidence in the gym'],
    ['OTHER', 'Other'],
];

// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyGoalsForm() {
    return {
        objectives: [],
        otherGoal: '',
        successDescription: '',
    };
}

export function validateGoalsForm(form) {
    const errors = {};

    if (form.objectives.length === 0) {
        errors.objectives = 'Select at least one goal';
    }

    if (form.objectives.includes('OTHER') && !form.otherGoal.trim()) {
        errors.otherGoal = 'Please describe your other goal';
    }

    return errors;
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

function GoalsStep({form, errors, updateObjective, onChange, onBack, onContinue}) {
    return (
        <form onSubmit={onContinue}>
            <Stack gap="md">
                <Alert
                    color={errors.objectives ? 'red' : 'blue'}
                    variant="light"
                    icon={<IconTargetArrow size={18}/>}
                >
                    Select one or more goals.
                </Alert>

                <Stack gap="xs">
                    <Stack gap={0}>
                        <Text size="sm" fw={600}>
                            What are your primary fitness objectives?
                        </Text>
                        <Text size="sm" c="dimmed" fw={400}>
                            Select all that apply.
                        </Text>
                    </Stack>

                    <SimpleGrid cols={{base: 1, sm: 2}}>
                        {GOAL_OPTIONS.map(([value, label]) => {
                            const checked = form.objectives.includes(value);

                            return (
                                <Checkbox.Card
                                    key={value}
                                    radius="md"
                                    checked={checked}
                                    onClick={() => updateObjective(value)}
                                    style={{
                                        border: 'none'
                                    }}
                                >
                                    <Group wrap="nowrap" align="center">
                                        <Checkbox.Indicator/>

                                        <Text size="sm" fw={500}>
                                            {label}
                                        </Text>
                                    </Group>
                                </Checkbox.Card>
                            );
                        })}
                    </SimpleGrid>

                    {errors.objectives && (
                        <Text c="red" size="sm">
                            {errors.objectives}
                        </Text>
                    )}
                </Stack>

                {form.objectives.includes('OTHER') && (
                    <Textarea
                        label="Describe your other goals"
                        name="otherGoal"
                        required
                        rows={3}
                        value={form.otherGoal}
                        onChange={onChange}
                        error={errors.otherGoal}
                    />
                )}

                <Divider />

                <Textarea
                    label="What would success look like to you?"
                    name="successDescription"
                    rows={3}
                    placeholder="Optional"
                    value={form.successDescription}
                    onChange={onChange}
                />

                <StepNavigation
                    onBack={onBack}
                />
            </Stack>
        </form>
    );
}

export default GoalsStep;