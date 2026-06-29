import {
    Alert,
    Checkbox,
    Group,
    Select,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Divider,
} from '@mantine/core';
import {IconClipboardList} from '@tabler/icons-react';
import StepNavigation from "../StepNavigation.jsx";

// ------------------------------------------------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------------------------------------------------

const WORKOUT_DAY_OPTIONS = [
    ['MONDAY', 'Mon'],
    ['TUESDAY', 'Tue'],
    ['WEDNESDAY', 'Wed'],
    ['THURSDAY', 'Thu'],
    ['FRIDAY', 'Fri'],
    ['SATURDAY', 'Sat'],
    ['SUNDAY', 'Sun'],
];

const LEARNING_STYLE_OPTIONS = [
    ['VISUAL_DEMONSTRATION', 'Visual demonstration'],
    ['VERBAL_EXPLANATION', 'Verbal explanation'],
    ['HANDS_ON_CORRECTION', 'Hands-on correction'],
    ['WRITTEN_INSTRUCTIONS', 'Written instructions'],
    ['NOT_SURE', 'Not sure'],
];

// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyTrainingPreferencesForm() {
    return {
        daysPerWeek: '',
        workoutTimePreference: '',
        preferredWorkoutDays: [],
        learningStyles: [],
        exercisesToAvoid: '',
        additionalPreferences: '',
    };
}

export function validateTrainingPreferencesForm(form) {
    const errors = {};

    if (!form.daysPerWeek) {
        errors.daysPerWeek = 'Training days per week is required';
    }

    if (!form.workoutTimePreference) {
        errors.workoutTimePreference = 'Workout time preference is required';
    }

    return errors;
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

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

    function renderCheckboxCard(value, label, selected, onClick) {
        return (
            <Checkbox.Card
                key={value}
                radius="md"
                checked={selected}
                onClick={onClick}
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
                        : 'Tell us how this client prefers to train and learn.'}
                </Alert>

                <Select
                    label="How many days per week would you like to train?"
                    placeholder="Select days per week"
                    value={form.daysPerWeek}
                    error={errors.daysPerWeek}
                    required
                    onChange={(value) => updateSelect('daysPerWeek', value)}
                    data={[
                        {value: '1', label: '1 day'},
                        {value: '2', label: '2 days'},
                        {value: '3', label: '3 days'},
                        {value: '4', label: '4 days'},
                        {value: '5', label: '5 days'},
                        {value: '6', label: '6 days'},
                        {value: '7', label: '7 days'},
                    ]}
                />

                <Select
                    label="Preferred workout time"
                    placeholder="Select workout time"
                    value={form.workoutTimePreference}
                    error={errors.workoutTimePreference}
                    required
                    onChange={(value) => updateSelect('workoutTimePreference', value)}
                    data={[
                        {value: 'MORNING', label: 'Morning'},
                        {value: 'AFTERNOON', label: 'Afternoon'},
                        {value: 'EVENING', label: 'Evening'},
                        {value: 'FLEXIBLE', label: 'Flexible'},
                    ]}
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
                        {WORKOUT_DAY_OPTIONS.map(([value, label]) =>
                            renderCheckboxCard(
                                value,
                                label,
                                form.preferredWorkoutDays.includes(value),
                                () => updatePreferredWorkoutDay(value)
                            )
                        )}
                    </SimpleGrid>
                </Stack>

                <Divider />

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
                        {LEARNING_STYLE_OPTIONS.map(([value, label]) =>
                            renderCheckboxCard(
                                value,
                                label,
                                form.learningStyles.includes(value),
                                () => updateLearningStyle(value)
                            )
                        )}
                    </SimpleGrid>
                </Stack>

                <Divider />

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
                    submitLabel={"Complete Intake"}
                />
            </Stack>
        </form>
    );
}

export default TrainingPreferencesStep;