// ------------------------------------------------------------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyMedicalHistoryForm() {
    return {
        medicalConditions: '',
        currentMedications: '',
        pastSurgeries: '',
        injuriesLimitations: ''
    };
}

// ------------------------------------------------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------------------------------------------------

function MedicalHistoryStep({form, onChange, onBack, onContinue}) {

    return (
        <form onSubmit={onContinue}>
            <div className="form-field">
                <label>Medical conditions</label>
                <textarea
                    name="medicalConditions"
                    rows="3"
                    placeholder="Optional"
                    value={form.medicalConditions}
                    onChange={onChange}
                />
            </div>

            <div className="form-field vertical-gap-md">
                <label>Current medications</label>
                <textarea
                    name="currentMedications"
                    rows="3"
                    placeholder="Optional"
                    value={form.currentMedications}
                    onChange={onChange}
                />
            </div>

            <div className="form-field vertical-gap-md">
                <label>Past injuries or surgeries</label>
                <textarea
                    name="pastSurgeries"
                    rows="3"
                    placeholder="Optional"
                    value={form.pastSurgeries}
                    onChange={onChange}
                />
            </div>

            <div className="form-field vertical-gap-md">
                <label>Current injuries or physical limitations</label>
                <textarea
                    name="injuriesLimitations"
                    rows="3"
                    placeholder="Optional"
                    value={form.injuriesLimitations}
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

export default MedicalHistoryStep;