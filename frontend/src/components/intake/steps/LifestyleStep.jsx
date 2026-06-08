import {
    Alert,
    Select,
    Stack,
    Textarea,
    TextInput,
} from '@mantine/core';
import {IconHeartRateMonitor} from '@tabler/icons-react';
import StepNavigation from "../StepNavigation.jsx";

// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyLifestyleForm() {
    return {
        occupation: '',
        dailyActivityLevel: '',
        averageSleep: '',
        stressLevel: '',
        stressSources: '',
        additionalNotes: '',
    };
}

export function validateLifestyleForm(form) {
    const errors = {};

    if (!form.dailyActivityLevel) {
        errors.dailyActivityLevel = 'Daily activity level is required';
    }

    if (!form.averageSleep) {
        errors.averageSleep = 'Average sleep is required';
    }

    if (!form.stressLevel) {
        errors.stressLevel = 'Stress level is required';
    }

    return errors;
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

function LifestyleStep({form, errors, onChange, onBack, onContinue}) {

    const hasErrors = Object.keys(errors).length > 0;

    function showStressSources() {
        return form.stressLevel === 'MODERATE'
            || form.stressLevel === 'HIGH'
            || form.stressLevel === 'VERY_HIGH';
    }

    function updateSelect(name, value) {
        onChange({
            target: {
                name,
                value: value || '',
            },
        });
    }

    return (
        <form onSubmit={onContinue}>
            <Stack gap="md">
                <Alert
                    color={hasErrors ? 'red' : 'blue'}
                    variant="light"
                    icon={<IconHeartRateMonitor size={18}/>}
                >
                    {hasErrors
                        ? 'Please complete the required lifestyle fields before continuing.'
                        : 'Tell us about your daily lifestyle, sleep, stress, and activity level.'}
                </Alert>

                <TextInput
                    label="Occupation"
                    name="occupation"
                    placeholder="Optional"
                    value={form.occupation}
                    onChange={onChange}
                />

                <Select
                    label="Daily activity level"
                    placeholder="Select daily activity level"
                    value={form.dailyActivityLevel}
                    error={errors.dailyActivityLevel}
                    required
                    onChange={(value) => updateSelect('dailyActivityLevel', value)}
                    data={[
                        {value: 'MOSTLY_SITTING', label: 'Mostly sitting'},
                        {value: 'MOSTLY_STANDING', label: 'Mostly standing'},
                        {value: 'MODERATELY_ACTIVE', label: 'Moderately active'},
                        {value: 'HIGHLY_ACTIVE', label: 'Highly active'},
                    ]}
                />

                <Select
                    label="Average sleep"
                    placeholder="Select average sleep"
                    value={form.averageSleep}
                    error={errors.averageSleep}
                    required
                    onChange={(value) => updateSelect('averageSleep', value)}
                    data={[
                        {value: 'LESS_THAN_5', label: 'Less than 5 hours'},
                        {value: 'FIVE_TO_SIX', label: '5-6 hours'},
                        {value: 'SIX_TO_SEVEN', label: '6-7 hours'},
                        {value: 'SEVEN_TO_EIGHT', label: '7-8 hours'},
                        {value: 'MORE_THAN_8', label: '8+ hours'},
                    ]}
                />

                <Select
                    label="Stress level"
                    placeholder="Select stress level"
                    value={form.stressLevel}
                    error={errors.stressLevel}
                    required
                    onChange={(value) => updateSelect('stressLevel', value)}
                    data={[
                        {value: 'LOW', label: 'Low'},
                        {value: 'MODERATE', label: 'Moderate'},
                        {value: 'HIGH', label: 'High'},
                        {value: 'VERY_HIGH', label: 'Very High'},
                    ]}
                />

                {showStressSources() && (
                    <Textarea
                        label="What are your main sources of stress?"
                        name="stressSources"
                        rows={3}
                        placeholder="Optional"
                        value={form.stressSources}
                        onChange={onChange}
                    />
                )}

                <Textarea
                    label="Additional lifestyle notes"
                    name="additionalNotes"
                    rows={3}
                    placeholder="Optional"
                    value={form.additionalNotes}
                    onChange={onChange}
                />

                <StepNavigation
                    onBack={onBack}
                />
            </Stack>
        </form>
    );
}

export default LifestyleStep;