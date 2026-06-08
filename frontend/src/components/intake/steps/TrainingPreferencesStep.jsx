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
    ['NOT_SURE', 'Not sure']
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
        additionalPreferences: ''
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

    return (
        <form onSubmit={onContinue}>
            <div className="form-field">
                <label>How many days per week would you like to train?</label>
                <select
                    name="daysPerWeek"
                    className={errors.daysPerWeek ? 'input-error' : ''}
                    value={form.daysPerWeek}
                    onChange={onChange}
                >
                    <option value="">Select days per week</option>
                    <option value="1">1 day</option>
                    <option value="2">2 days</option>
                    <option value="3">3 days</option>
                    <option value="4">4 days</option>
                    <option value="5">5 days</option>
                    <option value="6">6 days</option>
                    <option value="7">7 days</option>
                </select>
                {errors.daysPerWeek && (
                    <div className="field-error">
                        * {errors.daysPerWeek}
                    </div>
                )}
            </div>

            <div className="form-field vertical-gap-md">
                <label>Preferred workout time</label>
                <select
                    name="workoutTimePreference"
                    className={errors.workoutTimePreference ? 'input-error' : ''}
                    value={form.workoutTimePreference}
                    onChange={onChange}
                >
                    <option value="">Select workout time</option>
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
                    <option value="EVENING">Evening</option>
                    <option value="FLEXIBLE">Flexible</option>
                </select>
                {errors.workoutTimePreference && (
                    <div className="field-error">
                        * {errors.workoutTimePreference}
                    </div>
                )}
            </div>

            <div className="section-divider spaced" />

            <div className="form-field">
                <label>Which days are you generally available to train? Select all that apply. (Optional)</label>

                <div className="multi-option-grid">
                    {WORKOUT_DAY_OPTIONS.map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            className={`multi-option ${form.preferredWorkoutDays.includes(value) ? 'selected' : ''}`}
                            onClick={() => updatePreferredWorkoutDay(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="section-divider spaced" />

            <div className="form-field">
                <label>How do you best learn new exercises? Select all that apply. (Optional)</label>

                <div className="multi-option-grid">
                    {LEARNING_STYLE_OPTIONS.map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            className={`multi-option ${form.learningStyles.includes(value) ? 'selected' : ''}`}
                            onClick={() => updateLearningStyle(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="section-divider spaced" />

            <div className="form-field">
                <label>Are there any specific exercises you would like to avoid?</label>
                <textarea
                    name="exercisesToAvoid"
                    rows="3"
                    placeholder="Optional"
                    value={form.exercisesToAvoid}
                    onChange={onChange}
                />
            </div>

            <div className="form-field vertical-gap-md">
                <label>Additional training preferences</label>
                <textarea
                    name="additionalPreferences"
                    rows="3"
                    placeholder="Optional"
                    value={form.additionalPreferences}
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
                    Complete Intake
                </button>
            </div>
        </form>
    );
}

export default TrainingPreferencesStep;