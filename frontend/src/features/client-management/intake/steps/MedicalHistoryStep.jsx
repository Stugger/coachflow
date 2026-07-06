import {
    Alert,
    Stack,
    Textarea,
} from '@mantine/core';
import {IconMedicalCross} from '@tabler/icons-react';
import StepNavigation from '../StepNavigation.jsx';

function MedicalHistoryStep({form, isReviewEditing, onChange, onBack, onContinue}) {
    return (
        <form onSubmit={onContinue}>
            <Stack gap="md">
                {!isReviewEditing && (
                    <Alert
                        color="blue"
                        variant="light"
                        icon={<IconMedicalCross size={18}/>}
                    >
                        Add any relevant medical details, injuries, medications, or limitations. This step can be left blank.
                    </Alert>
                )}
                <Textarea
                    label="Medical conditions"
                    name="medicalConditions"
                    rows={3}
                    placeholder="Optional"
                    value={form.medicalConditions}
                    onChange={onChange}
                />

                <Textarea
                    label="Current medications"
                    name="currentMedications"
                    rows={3}
                    placeholder="Optional"
                    value={form.currentMedications}
                    onChange={onChange}
                />

                <Textarea
                    label="Past injuries or surgeries"
                    name="pastSurgeries"
                    rows={3}
                    placeholder="Optional"
                    value={form.pastSurgeries}
                    onChange={onChange}
                />

                <Textarea
                    label="Current injuries or physical limitations"
                    name="injuriesLimitations"
                    rows={3}
                    placeholder="Optional"
                    value={form.injuriesLimitations}
                    onChange={onChange}
                />

                <StepNavigation isReviewEditing={isReviewEditing} onBack={onBack}/>
            </Stack>
        </form>
    );
}

export default MedicalHistoryStep;
