// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyActivityHistoryForm() {
    return {
        previousTrainer: null,
        previousTrainerExperience: '',
        activityLevel: '',
        currentRoutine: ''
    };
}

export function validateActivityHistoryForm(form) {
    const errors = {};

    if (form.previousTrainer === null) {
        errors.previousTrainer = 'Please answer this question';
    }

    if (!form.activityLevel) {
        errors.activityLevel = 'Current activity level is required';
    }

    return errors;
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

function ActivityHistoryStep({form, errors, updateTrainer, onChange, onBack, onContinue}) {

    return (
        <form onSubmit={onContinue}>
            <div className={`intake-question ${errors.previousTrainer ? 'error' : ''}`}>
                <label>Have you worked with a personal trainer before?</label>

                <div className="intake-answer-group">
                    <label className="intake-answer">
                        <input
                            type="radio"
                            name="previousTrainer"
                            checked={form.previousTrainer === true}
                            onChange={() => updateTrainer(true)}
                        />
                        Yes
                    </label>

                    <label className="intake-answer">
                        <input
                            type="radio"
                            name="previousTrainer"
                            checked={form.previousTrainer === false}
                            onChange={() => updateTrainer(false)}
                        />
                        No
                    </label>
                </div>

                {errors.previousTrainer && (
                    <div className="field-error intake-error">
                        * {errors.previousTrainer}
                    </div>
                )}

                {form.previousTrainer && (
                    <div className="form-field">
                        <div className="section-divider vertical-gap-md" />
                        <label className="vertical-gap-sm">Please describe your experience:</label>
                        <textarea
                            name="previousTrainerExperience"
                            rows="3"
                            placeholder="Optional"
                            value={form.previousTrainerExperience}
                            onChange={onChange}
                        />
                    </div>
                )}
            </div>

            <div className="form-field">
                <label>Current level of physical activity</label>
                <select
                    name="activityLevel"
                    className={errors.activityLevel ? 'input-error' : ''}
                    value={form.activityLevel}
                    onChange={onChange}
                >
                    <option value="">Select activity level</option>
                    <option value="SEDENTARY">Sedentary</option>
                    <option value="LIGHTLY_ACTIVE">Lightly active</option>
                    <option value="MODERATELY_ACTIVE">Moderately active</option>
                    <option value="VERY_ACTIVE">Very active</option>
                </select>
                {errors.activityLevel && (
                    <div className="field-error">
                        * {errors.activityLevel}
                    </div>
                )}
            </div>

            <div className="form-field vertical-gap-md">
                <label>Describe your current exercise routine</label>
                <textarea
                    name="currentRoutine"
                    rows="3"
                    placeholder="Optional"
                    value={form.currentRoutine}
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

export default ActivityHistoryStep;