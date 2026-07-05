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
import StepNavigation from '../StepNavigation.jsx';
import {
    PARQ_QUESTIONS,
    YES_NO_OPTIONS,
} from '../intake-step-options.js';

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
                        onChange={(newValue) => updateField(question.field, newValue === 'true')}
                        color="blue"
                        data={YES_NO_OPTIONS}
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

                <StepNavigation onBack={onBack}/>
            </Stack>
        </form>
    );
}

export default ParqStep;
