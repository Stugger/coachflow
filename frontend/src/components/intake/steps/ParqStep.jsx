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
    }
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

    function renderParqQuestion(field, label) {
        return (
            <div
                key={field}
                className={`intake-question ${errors[field] ? 'error' : ''}`}
            >
                <label>{label}</label>
                <div className="intake-answer-group">
                    <label className="intake-answer">
                        <input
                            type="radio"
                            name={field}
                            checked={form[field] === true}
                            onChange={() => updateField(field, true)}
                        />
                        Yes
                    </label>

                    <label className="intake-answer">
                        <input
                            type="radio"
                            name={field}
                            checked={form[field] === false}
                            onChange={() => updateField(field, false)}
                        />
                        No
                    </label>
                </div>
                {errors[field] && (
                    <div className="field-error intake-error">
                        * Please answer this question
                    </div>
                )}
                {field === 'otherMedicalReason' && form.otherMedicalReason && (
                    <div className="form-field">
                        <div className="section-divider spaced" />
                        <label>Please explain:</label>
                        <textarea
                            className={errors.additionalNotes ? 'input-error' : ''}
                            name="additionalNotes"
                            rows="4"
                            value={form.additionalNotes}
                            onChange={onChange}
                        />
                    </div>
                )}
                {field === 'otherMedicalReason' && form.otherMedicalReason && errors.additionalNotes && (
                    <div className="field-error intake-error">
                        * {errors.additionalNotes}
                    </div>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={onContinue}>
            {PARQ_QUESTIONS.map(question =>
                renderParqQuestion(question.field, question.label)
            )}
            <div className="form-actions">
                <button
                    type="button"
                    className="secondary-button"
                    onClick={onBack}
                >
                    Go Back
                </button>

                <button type="submit">
                    Save & Continue
                </button>
            </div>
        </form>
    );
}

export default ParqStep;