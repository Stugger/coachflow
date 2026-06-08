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
        additionalNotes: ''
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

    function showStressSources() {
        return form.stressLevel === 'MODERATE'
            || form.stressLevel === 'HIGH'
            || form.stressLevel === 'VERY_HIGH';
    }

    return (
        <form onSubmit={onContinue}>
            <div className="form-field">
                <label>Occupation</label>
                <input
                    name="occupation"
                    placeholder="Optional"
                    value={form.occupation}
                    onChange={onChange}
                />
            </div>

            <div className="form-field vertical-gap-md">
                <label>Daily activity level</label>
                <select
                    name="dailyActivityLevel"
                    className={errors.dailyActivityLevel ? 'input-error' : ''}
                    value={form.dailyActivityLevel}
                    onChange={onChange}
                >
                    <option value="">Select daily activity level</option>
                    <option value="MOSTLY_SITTING">Mostly sitting</option>
                    <option value="MOSTLY_STANDING">Mostly standing</option>
                    <option value="MODERATELY_ACTIVE">Moderately active</option>
                    <option value="HIGHLY_ACTIVE">Highly active</option>
                </select>
                {errors.dailyActivityLevel && (
                    <div className="field-error">
                        * {errors.dailyActivityLevel}
                    </div>
                )}
            </div>

            <div className="form-field vertical-gap-md">
                <label>Average sleep</label>
                <select
                    name="averageSleep"
                    className={errors.averageSleep ? 'input-error' : ''}
                    value={form.averageSleep}
                    onChange={onChange}
                >
                    <option value="">Select average sleep</option>
                    <option value="LESS_THAN_5">Less than 5 hours</option>
                    <option value="FIVE_TO_SIX">5-6 hours</option>
                    <option value="SIX_TO_SEVEN">6-7 hours</option>
                    <option value="SEVEN_TO_EIGHT">7-8 hours</option>
                    <option value="MORE_THAN_8">8+ hours</option>
                </select>
                {errors.averageSleep && (
                    <div className="field-error">
                        * {errors.averageSleep}
                    </div>
                )}
            </div>

            <div className="form-field vertical-gap-md">
                <label>Stress level</label>
                <select
                    name="stressLevel"
                    className={errors.stressLevel ? 'input-error' : ''}
                    value={form.stressLevel}
                    onChange={onChange}
                >
                    <option value="">Select stress level</option>
                    <option value="LOW">Low</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HIGH">High</option>
                    <option value="VERY_HIGH">Very High</option>
                </select>
                {errors.stressLevel && (
                    <div className="field-error">
                        * {errors.stressLevel}
                    </div>
                )}
            </div>

            {showStressSources() && (
                <div className="form-field vertical-gap-md">
                    <label>What are your main sources of stress?</label>
                    <textarea
                        name="stressSources"
                        rows="3"
                        placeholder="Optional"
                        value={form.stressSources}
                        onChange={onChange}
                    />
                </div>
            )}

            <div className="section-divider spaced" />

            <div className="form-field">
                <label>Additional lifestyle notes</label>
                <textarea
                    name="additionalNotes"
                    rows="3"
                    placeholder="Optional"
                    value={form.additionalNotes}
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

export default LifestyleStep;