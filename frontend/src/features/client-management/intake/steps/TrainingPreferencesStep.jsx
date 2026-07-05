import {
    Alert,
    Checkbox,
    Divider,
    Group,
    Select,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
} from '@mantine/core';
import {IconClipboardList} from '@tabler/icons-react';
import StepNavigation from '../StepNavigation.jsx';
import {
    DAYS_PER_WEEK_OPTIONS,
    LEARNING_STYLE_OPTIONS,
    WORKOUT_DAY_OPTIONS,
    WORKOUT_TIME_PREFERENCE_OPTIONS,
} from '../intake-step-options.js';

function TrainingPreferencesStep({form, errors, updatePreferredWorkoutDay, updateLearningStyle, onChange, onBack, onContinue}) {

    const hasErrors = Object.keys(errors).length > 0;

    function updateSelect(name, value) {
        onChange({
            target: {
                name,
                value: value || '',
            },
        });
    }

    function renderCheckboxCard({value, label}, selected, onClick) {
        return (
            <Checkbox.Card
                key={value}
                radius="md"
                checked={selected}
                onClick={onClick}
                style={{border: 'none'}}
            >
                <Group wrap="nowrap" align="center">
                    <Checkbox.Indicator/>

                    <Text size="sm" fw={500}>
                        {label}
                    </Text>
                </Group>
            </Checkbox.Card>
        );
    }

    return (
        <form onSubmit={onContinue}>
            <Stack gap="md">
                <Alert
                    color={hasErrors ? 'red' : 'blue'}
                    variant="light"
                    icon={<IconClipboardList size={18}/>}
                >
                    {hasErrors
                        ? 'Please complete the required training preference fields before finishing.'
                        : 'Tell us how you prefer to train and learn.'}
                </Alert>

                <Select
                    label="How many days per week would you like to train?"
                    placeholder="Select days per week"
                    value={form.daysPerWeek}
                    error={errors.daysPerWeek}
                    required
                    onChange={(value) => updateSelect('daysPerWeek', value)}
                    data={DAYS_PER_WEEK_OPTIONS}
                />

                <Select
                    label="Preferred workout time"
                    placeholder="Select workout time"
                    value={form.workoutTimePreference}
                    error={errors.workoutTimePreference}
                    required
                    onChange={(value) => updateSelect('workoutTimePreference', value)}
                    data={WORKOUT_TIME_PREFERENCE_OPTIONS}
                />

                <Stack gap="xs">
                    <Stack gap={0}>
                        <Text size="sm" fw={600}>
                            Which days are you most available to train?
                        </Text>
                        <Text size="sm" c="dimmed" fw={400}>
                            Optional. Select all that apply.
                        </Text>
                    </Stack>
                    <SimpleGrid cols={{base: 2, sm: 4}}>
                        {WORKOUT_DAY_OPTIONS.map(option =>
                            renderCheckboxCard(
                                option,
                                form.preferredWorkoutDays.includes(option.value),
                                () => updatePreferredWorkoutDay(option.value),
                            )
                        )}
                    </SimpleGrid>
                </Stack>

                <Divider/>

                <Stack gap="xs">
                    <Stack gap={0}>
                        <Text size="sm" fw={600}>
                            How do you best learn new exercises?
                        </Text>
                        <Text size="sm" c="dimmed" fw={400}>
                            Optional. Select all that apply.
                        </Text>
                    </Stack>
                    <SimpleGrid cols={{base: 1, sm: 2}}>
                        {LEARNING_STYLE_OPTIONS.map(option =>
                            renderCheckboxCard(
                                option,
                                form.learningStyles.includes(option.value),
                                () => updateLearningStyle(option.value),
                            )
                        )}
                    </SimpleGrid>
                </Stack>

                <Divider/>

                <Textarea
                    label="Are there any specific exercises you would like to avoid?"
                    name="exercisesToAvoid"
                    rows={3}
                    placeholder="Optional"
                    value={form.exercisesToAvoid}
                    onChange={onChange}
                />

                <Textarea
                    label="Additional training preferences"
                    name="additionalPreferences"
                    rows={3}
                    placeholder="Optional"
                    value={form.additionalPreferences}
                    onChange={onChange}
                />

                <StepNavigation
                    onBack={onBack}
                    submitLabel="Complete Intake"
                />
            </Stack>
        </form>
    );
}

export default TrainingPreferencesStep;
