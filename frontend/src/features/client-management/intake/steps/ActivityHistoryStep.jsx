import {
    Alert,
    Divider,
    Paper,
    SegmentedControl,
    Select,
    Stack,
    Text,
    Textarea,
} from '@mantine/core';
import { IconBarbell } from '@tabler/icons-react';
import StepNavigation from "../StepNavigation.jsx";

// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyActivityHistoryForm() {
    return {
        previousTrainer: null,
        previousTrainerExperience: '',
        activityLevel: '',
        currentRoutine: ''
    };
}

export function validateActivityHistoryForm(form) {
    const errors = {};

    if (form.previousTrainer === null) {
        errors.previousTrainer = 'Please answer this question';
    }

    if (!form.activityLevel) {
        errors.activityLevel = 'Current activity level is required';
    }

    return errors;
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

function ActivityHistoryStep({form, errors, updateTrainer, onChange, onBack, onContinue}) {

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <form onSubmit={onContinue}>
            <Stack gap="md">

                <Alert
                    color={hasErrors ? 'red' : 'blue'}
                    variant="light"
                    icon={<IconBarbell size={18} />}
                >
                    Tell us about your training experience and activity level.
                </Alert>

                <Paper
                    p="md"
                    radius="md"
                    withBorder
                    style={{
                        borderColor: errors.previousTrainer
                            ? 'var(--mantine-color-red-6)'
                            : undefined,
                    }}
                >
                    <Stack gap="sm">

                        <Text fw={500}>
                            Have you worked with a personal trainer before?
                        </Text>

                        <SegmentedControl
                            color="blue"
                            value={
                                form.previousTrainer === null
                                    ? ''
                                    : String(form.previousTrainer)
                            }
                            onChange={(value) =>
                                updateTrainer(value === 'true')
                            }
                            data={[
                                { label: 'Yes', value: 'true' },
                                { label: 'No', value: 'false' },
                            ]}
                            fullWidth
                        />

                        {errors.previousTrainer && (
                            <Text c="red" size="sm">
                                {errors.previousTrainer}
                            </Text>
                        )}

                        {form.previousTrainer && (
                            <>
                                <Divider />

                                <Textarea
                                    label="Describe your experience"
                                    name="previousTrainerExperience"
                                    rows={3}
                                    placeholder="Optional"
                                    value={form.previousTrainerExperience}
                                    onChange={onChange}
                                />
                            </>
                        )}

                    </Stack>
                </Paper>

                <Select
                    label="Current level of physical activity"
                    name="activityLevel"
                    placeholder="Select activity level"
                    value={form.activityLevel}
                    onChange={(value) =>
                        onChange({
                            target: {
                                name: 'activityLevel',
                                value: value || '',
                            },
                        })
                    }
                    error={errors.activityLevel}
                    data={[
                        { value: 'SEDENTARY', label: 'Sedentary' },
                        { value: 'LIGHTLY_ACTIVE', label: 'Lightly active' },
                        { value: 'MODERATELY_ACTIVE', label: 'Moderately active' },
                        { value: 'VERY_ACTIVE', label: 'Very active' },
                    ]}
                    required
                />

                <Textarea
                    label="Describe your current exercise routine"
                    name="currentRoutine"
                    rows={4}
                    placeholder="Optional"
                    value={form.currentRoutine}
                    onChange={onChange}
                />

                <StepNavigation
                    onBack={onBack}
                />

            </Stack>
        </form>
    );
}

export default ActivityHistoryStep;