// ------------------------------------------------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------------------------------------------------

const GOAL_OPTIONS = [
    ['LOSE_WEIGHT', 'Lose weight'],
    ['BUILD_MUSCLE', 'Build muscle'],
    ['GET_STRONGER', 'Get stronger'],
    ['IMPROVE_ENDURANCE', 'Improve endurance'],
    ['IMPROVE_MOBILITY', 'Improve mobility / flexibility'],
    ['IMPROVE_HEALTH', 'Improve overall health'],
    ['SPORT_PERFORMANCE', 'Improve sports performance'],
    ['INCREASE_CONFIDENCE', 'Increase confidence in the gym'],
    ['OTHER', 'Other']
];

// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyGoalsForm() {
    return {
        objectives: [],
        otherGoal: '',
        successDescription: ''
    };
}

export function validateGoalsForm(form) {
    const errors = {};

    if (form.objectives.length === 0) {
        errors.objectives = 'Select at least one goal';
    }

    if (form.objectives.includes('OTHER') && !form.otherGoal.trim()) {
        errors.otherGoal = 'Please describe your other goal';
    }

    return errors;
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

function GoalsStep({form, errors, updateObjective, onChange, onBack, onContinue}) {

    return (
        <form onSubmit={onContinue}>
            <div className="form-field">
                <label>What are your fitness objectives? Select all that apply.</label>

                <div className={`multi-option-grid ${errors.objectives ? 'error' : ''}`}>
                    {GOAL_OPTIONS.map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            className={`multi-option ${form.objectives.includes(value) ? 'selected' : ''}`}
                            onClick={() => updateObjective(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {errors.objectives && (
                    <div className="field-error vertical-gap-sm">
                        * {errors.objectives}
                    </div>
                )}
            </div>

            {form.objectives.includes('OTHER') && (
                <div className="form-field vertical-gap-md">
                    <label>Describe your other goal(s):</label>
                    <textarea
                        className={errors.otherGoal ? 'input-error' : ''}
                        name="otherGoal"
                        rows="3"
                        value={form.otherGoal}
                        onChange={onChange}
                    />
                    {errors.otherGoal && (
                        <div className="field-error">
                            * {errors.otherGoal}
                        </div>
                    )}
                </div>
            )}

            <div className="section-divider spaced" />
            <div className="form-field">
                <label>What would success look like to you?</label>
                <textarea
                    name="successDescription"
                    rows="3"
                    placeholder="Optional"
                    value={form.successDescription}
                    onChange={onChange}
                />
            </div>

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

export default GoalsStep;