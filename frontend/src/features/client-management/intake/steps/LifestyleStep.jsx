import {
    Alert,
    Select,
    Stack,
    Textarea,
    TextInput,
} from '@mantine/core';
import {IconHeartRateMonitor} from '@tabler/icons-react';
import StepNavigation from '../StepNavigation.jsx';
import {
    AVERAGE_SLEEP_OPTIONS,
    DAILY_ACTIVITY_LEVEL_OPTIONS,
    STRESS_LEVEL_OPTIONS,
} from '../intake-step-options.js';

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
                    data={DAILY_ACTIVITY_LEVEL_OPTIONS}
                />

                <Select
                    label="Average sleep"
                    placeholder="Select average sleep"
                    value={form.averageSleep}
                    error={errors.averageSleep}
                    required
                    onChange={(value) => updateSelect('averageSleep', value)}
                    data={AVERAGE_SLEEP_OPTIONS}
                />

                <Select
                    label="Stress level"
                    placeholder="Select stress level"
                    value={form.stressLevel}
                    error={errors.stressLevel}
                    required
                    onChange={(value) => updateSelect('stressLevel', value)}
                    data={STRESS_LEVEL_OPTIONS}
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

                <StepNavigation onBack={onBack}/>
            </Stack>
        </form>
    );
}

export default LifestyleStep;
