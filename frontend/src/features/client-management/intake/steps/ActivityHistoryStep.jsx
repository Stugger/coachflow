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
import {IconBarbell} from '@tabler/icons-react';
import StepNavigation from '../StepNavigation.jsx';
import {
    ACTIVITY_LEVEL_OPTIONS,
    YES_NO_OPTIONS,
} from '../intake-step-options.js';

function ActivityHistoryStep({form, errors, updateTrainer, onChange, onBack, onContinue}) {
    const hasErrors = Object.keys(errors).length > 0;

    return (
        <form onSubmit={onContinue}>
            <Stack gap="md">
                <Alert
                    color={hasErrors ? 'red' : 'blue'}
                    variant="light"
                    icon={<IconBarbell size={18}/>}
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
                            onChange={(value) => updateTrainer(value === 'true')}
                            data={YES_NO_OPTIONS}
                            fullWidth
                        />

                        {errors.previousTrainer && (
                            <Text c="red" size="sm">
                                {errors.previousTrainer}
                            </Text>
                        )}

                        {form.previousTrainer && (
                            <>
                                <Divider/>

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
                    data={ACTIVITY_LEVEL_OPTIONS}
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

                <StepNavigation onBack={onBack}/>
            </Stack>
        </form>
    );
}

export default ActivityHistoryStep;