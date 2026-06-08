import {
    Alert,
    Divider,
    Paper,
    SegmentedControl,
    Stack,
    Text,
    Textarea,
} from '@mantine/core';
import {IconAlertCircle} from '@tabler/icons-react';
import StepNavigation from '../StepNavigation';

// ------------------------------------------------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------------------------------------------------

const PARQ_QUESTIONS = [
    {
        field: 'heartCondition',
        label: 'Has your doctor ever said that you have a heart condition?',
    },
    {
        field: 'chestPainDuringActivity',
        label: 'Do you feel pain in your chest during physical activity?',
    },
    {
        field: 'chestPainAtRest',
        label: 'Have you experienced chest pain at rest during the last month?',
    },
    {
        field: 'dizzinessOrLossOfBalance',
        label: 'Do you lose balance because of dizziness or lose consciousness?',
    },
    {
        field: 'boneOrJointProblem',
        label: 'Do you have a bone or joint problem that could be made worse by exercise?',
    },
    {
        field: 'bloodPressureMedication',
        label: 'Are you currently prescribed medication for blood pressure or a heart condition?',
    },
    {
        field: 'otherMedicalReason',
        label: 'Is there any other reason you should not participate in physical activity?',
    },
];

// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyParqForm() {
    return {
        heartCondition: null,
        chestPainDuringActivity: null,
        chestPainAtRest: null,
        dizzinessOrLossOfBalance: null,
        boneOrJointProblem: null,
        bloodPressureMedication: null,
        otherMedicalReason: null,
        additionalNotes: '',
    };
}

export function validateParqForm(form) {
    const errors = {};

    Object.entries(form).forEach(([key, value]) => {
        if (key === 'additionalNotes') {
            return;
        }

        if (value === null) {
            errors[key] = 'Required';
        }
    });

    if (form.otherMedicalReason && !form.additionalNotes.trim()) {
        errors.additionalNotes = 'Explanation required';
    }

    return errors;
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

function ParqStep({form, errors, updateField, onChange, onBack, onContinue}) {

    const hasErrors = PARQ_QUESTIONS.some(question => errors[question.field]) || Boolean(errors.additionalNotes);

    function renderParqQuestion(question) {
        const value = form[question.field];

        return (
            <Paper
                key={question.field}
                p="md"
                radius="md"
                withBorder
                style={{
                    borderColor: errors[question.field]
                        ? 'var(--mantine-color-red-6)'
                        : undefined,
                }}
            >
                <Stack gap="sm">
                    <Text fw={500}>
                        {question.label}
                    </Text>

                    <SegmentedControl
                        value={value === null ? '' : String(value)}
                        onChange={(value) => updateField(question.field, value === 'true')}
                        color="blue"
                        data={[
                            {label: 'Yes', value: 'true'},
                            {label: 'No', value: 'false'},
                        ]}
                        fullWidth
                    />

                    {errors[question.field] && (
                        <Text c="red" size="sm">
                            Please answer this question
                        </Text>
                    )}

                    {question.field === 'otherMedicalReason' && form.otherMedicalReason && (
                        <>
                            <Divider/>

                            <Textarea
                                label="Please explain"
                                name="additionalNotes"
                                required
                                rows={4}
                                value={form.additionalNotes}
                                onChange={onChange}
                                error={errors.additionalNotes}
                            />
                        </>
                    )}
                </Stack>
            </Paper>
        );
    }

    return (
        <form onSubmit={onContinue}>
            <Stack gap="md">
                <Alert
                    color={hasErrors ? 'red' : 'blue'}
                    variant="light"
                    icon={<IconAlertCircle size={18}/>}
                >
                    {hasErrors
                        ? 'Please fix the highlighted PAR-Q answers before continuing.'
                        : 'Please answer each PAR-Q question before continuing.'}
                </Alert>

                {PARQ_QUESTIONS.map(renderParqQuestion)}

                <StepNavigation
                    onBack={onBack}
                />
            </Stack>
        </form>
    );
}

export default ParqStep;