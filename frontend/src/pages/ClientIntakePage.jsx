import {useEffect, useRef, useState} from 'react';
import {Pages, IntakeSteps} from '../constants/layout';
import * as PhoneUtils from '../utils/phone-utils';
import * as TextUtils from '../utils/text-utils';

function ClientIntakePage({trainerId, navigate}) { //TODO added `navigate` to return to clients page (to be replaced with routing)

    /*-------------------------------------------------------------------------------------------------------------------------------------
        State
    --------------------------------------------------------------------------------------------------------------------------------------*/

    const [currentStep, setCurrentStep] = useState(IntakeSteps.BASIC_INFO);
    const [clientId, setClientId] = useState(null);
    const [intakeId, setIntakeId] = useState(null);

    const [basicInfoForm, setBasicInfoForm] = useState(createEmptyBasicInfoForm());
    const [parqForm, setParqForm] = useState(createEmptyParqForm());
    const [goalsForm, setGoalsForm] = useState(createEmptyGoalsForm());
    const [activityHistoryForm, setActivityHistoryForm] = useState(createEmptyActivityHistoryForm());
    const [medicalForm, setMedicalForm] = useState(createEmptyMedicalForm());

    const [basicInfoErrors, setBasicInfoErrors] = useState({});
    const [parqErrors, setParqErrors] = useState({});
    const [goalsErrors, setGoalsErrors] = useState({});
    const [activityHistoryErrors, setActivityHistoryErrors] = useState({});

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Effects
    --------------------------------------------------------------------------------------------------------------------------------------*/

    //

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Loading
    --------------------------------------------------------------------------------------------------------------------------------------*/

    function loadIntake(id) {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/client-intakes/${id}`)
            .then(response => response.json())
            .then(intake => {
                hydrateIntake(intake);
                setCurrentStep(intake.currentStep);
            })
            .catch(error => console.error('Error loading intake:', error));
    }

    function hydrateIntake(intake) {
        setIntakeId(intake.id);
        setClientId(intake.clientId);

        if (intake.parqJson) {
            setParqForm({
                ...createEmptyParqForm(),
                ...JSON.parse(intake.parqJson)
            });
        }
        if (intake.goalsJson) {
            setGoalsForm({
                ...createEmptyGoalsForm(),
                ...JSON.parse(intake.goalsJson)
            });
        }
        if (intake.activityHistoryJson) {
            setActivityHistoryForm({
                ...createEmptyActivityHistoryForm(),
                ...JSON.parse(intake.activityHistoryJson)
            });
        }
        if (intake.medicalJson) {
            setMedicalForm({
                ...createEmptyMedicalForm(),
                ...JSON.parse(intake.medicalJson)
            });
        }
    }

    /*-------------------------------------------------------------------------------------------------------------------------------------
        API Actions
    --------------------------------------------------------------------------------------------------------------------------------------*/

    function createClient(event) {
        event.preventDefault();

        const updatedErrors = validateBasicInfoForm(basicInfoForm);

        if (Object.keys(updatedErrors).length > 0) {
            setBasicInfoErrors(updatedErrors);
            return;
        }

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(normalizeBasicInfoForm(basicInfoForm))
        })
            .then(async response => {
                if (!response.ok) {
                    const errorBody = await response.json();
                    if (errorBody.fieldErrors) {
                        setBasicInfoErrors(errorBody.fieldErrors);
                    }
                    throw new Error(errorBody.message || 'Failed to create client');
                }
                return response.json();
            })
            .then(createdClient => {
                return fetch(`${import.meta.env.VITE_API_BASE_URL}/api/client-intakes`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        trainerId,
                        clientId: createdClient.id
                    })
                });
            })
            .then(async response => {
                if (!response.ok) {
                    const errorBody = await response.json();
                    if (errorBody.fieldErrors) {
                        setBasicInfoErrors(errorBody.fieldErrors);
                    }
                    throw new Error(errorBody.message || 'Failed to create client intake');
                }
                return response.json();
            })
            .then(intake => {
                setClientId(intake.clientId);
                setIntakeId(intake.id);
                setCurrentStep(intake.currentStep);
                scrollToTop();
            })
            .catch(error => console.error('Error creating client or intake:', error));
    }

    function updateClient(event) {
        event.preventDefault();

        const updatedErrors = validateBasicInfoForm(basicInfoForm);

        if (Object.keys(updatedErrors).length > 0) {
            setBasicInfoErrors(updatedErrors);
            return;
        }

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/${clientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(normalizeBasicInfoForm(basicInfoForm))
        })
            .then(async response => {
                if (!response.ok) {
                    const errorBody = await response.json();
                    if (errorBody.fieldErrors) {
                        setBasicInfoErrors(errorBody.fieldErrors);
                    }
                    throw new Error(errorBody.message || 'Failed to update client');
                }
                return response.json();
            })
            .then(() => {
                loadIntake(intakeId);
                scrollToTop();
            })
            .catch(error => console.error('Error updating client:', error));
    }

    function saveIntakeStep(step, formData, onSaved) {
        const hasData = Object.values(formData).some(value =>
            typeof value === 'string' ? value.trim() !== '' : value !== null
        );

        if (!hasData) {
            onSaved();
            return;
        }

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/client-intakes/${intakeId}/step/${step}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                json: JSON.stringify(formData)
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to save ${step}`);
                }

                return response.json();
            })
            .then(intake => {
                hydrateIntake(intake);
                onSaved();
            })
            .catch(error => console.error(error));
    }

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Event Handlers
    --------------------------------------------------------------------------------------------------------------------------------------*/

    function exitIntake() {
        //TODO navigate will likely be replaced with routing
        switch (currentStep) {
            case IntakeSteps.PARQ:
                saveIntakeStep(IntakeSteps.PARQ, parqForm, () => navigate(Pages.CLIENTS));
                break;
            case IntakeSteps.GOALS:
                saveIntakeStep(IntakeSteps.GOALS, goalsForm, () => navigate(Pages.CLIENTS));
                break;
            case IntakeSteps.ACTIVITY_HISTORY:
                saveIntakeStep(IntakeSteps.ACTIVITY_HISTORY, activityHistoryForm, () => navigate(Pages.CLIENTS));
                break;
            case IntakeSteps.MEDICAL:
                saveIntakeStep(IntakeSteps.MEDICAL, medicalForm, () => navigate(Pages.CLIENTS));
                break;
            default:
                navigate(Pages.CLIENTS);
        }
    }

    /*
     *  Basic Info
     */

    function saveBasicInfo(event) {
        if (clientId) {
            updateClient(event);
        } else {
            createClient(event);
        }
    }

    function updateBasicInfoForm(event) {
        const {name, value} = event.target;

        setBasicInfoForm({
            ...basicInfoForm,
            [name]: value
        });
        if (basicInfoErrors[name]) {
            const updatedErrors = {...basicInfoErrors};
            delete updatedErrors[name];
            setBasicInfoErrors(updatedErrors);
        }
    }

    /*
     *  PARQ
     */

    function handleParqBack() {
        saveIntakeStep(IntakeSteps.PARQ, parqForm, () => {
            setCurrentStep(IntakeSteps.BASIC_INFO);
            scrollToTop();
        });
    }

    function handleParqContinue(event) {
        event.preventDefault();

        const errors = validateParqForm();

        if (Object.keys(errors).length > 0) {
            setParqErrors(errors);
            return;
        }

        saveIntakeStep(IntakeSteps.PARQ, parqForm, () => {
            setCurrentStep(IntakeSteps.GOALS);
            scrollToTop();
        });
    }

    function updateParqForm(event) {
        const {name, value} = event.target;

        setParqForm({
            ...parqForm,
            [name]: value
        });

        if (parqErrors[name]) {
            const updatedErrors = {...parqErrors};
            delete updatedErrors[name];
            setParqErrors(updatedErrors);
        }
    }

    function updateParqValue(field, value) {
        const updatedForm = {
            ...parqForm,
            [field]: value
        };

        const updatedErrors = {...parqErrors};
        delete updatedErrors[field];

        if (field === 'otherMedicalReason' && value === false) {
            updatedForm.additionalNotes = '';
            delete updatedErrors.additionalNotes;
        }

        setParqForm(updatedForm);
        setParqErrors(updatedErrors);
    }

    /*
     *  Goals
     */

    function handleGoalsBack() {
        saveIntakeStep(IntakeSteps.GOALS, goalsForm, () => {
            setCurrentStep(IntakeSteps.PARQ);
            scrollToTop();
        });
    }

    function handleGoalsContinue(event) {
        event.preventDefault();

        const errors = validateGoalsForm();

        if (Object.keys(errors).length > 0) {
            setGoalsErrors(errors);
            return;
        }

        saveIntakeStep(IntakeSteps.GOALS, goalsForm, () => {
            setCurrentStep(IntakeSteps.ACTIVITY_HISTORY);
            scrollToTop();
        });
    }

    function updateGoalObjective(objective) {
        const selected = goalsForm.objectives.includes(objective);

        const updatedObjectives = selected
            ? goalsForm.objectives.filter(value => value !== objective)
            : [...goalsForm.objectives, objective];

        const updatedForm = {
            ...goalsForm,
            objectives: updatedObjectives
        };

        const updatedErrors = {...goalsErrors};

        if (updatedObjectives.length > 0) {
            delete updatedErrors.objectives;
        }

        if (objective === 'OTHER' && selected) {
            updatedForm.otherGoal = '';
            delete updatedErrors.otherGoal;
        }

        setGoalsForm(updatedForm);
        setGoalsErrors(updatedErrors);
    }

    function updateGoalsForm(event) {
        const {name, value} = event.target;

        setGoalsForm({
            ...goalsForm,
            [name]: value
        });

        if (goalsErrors[name]) {
            const updatedErrors = {...goalsErrors};
            delete updatedErrors[name];
            setGoalsErrors(updatedErrors);
        }
    }

    /*
     *  Activity History
     */

    function handleActivityHistoryBack() {
        saveIntakeStep(IntakeSteps.ACTIVITY_HISTORY, activityHistoryForm, () => {
            setCurrentStep(IntakeSteps.GOALS);
            scrollToTop();
        });
    }

    function handleActivityHistoryContinue(event) {
        event.preventDefault();

        const errors = validateActivityHistoryForm();

        if (Object.keys(errors).length > 0) {
            setActivityHistoryErrors(errors);
            return;
        }

        saveIntakeStep(IntakeSteps.ACTIVITY_HISTORY, activityHistoryForm, () => {
            setCurrentStep(IntakeSteps.MEDICAL);
            scrollToTop();
        });
    }

    function updateActivityHistoryForm(event) {
        const {name, value} = event.target;

        setActivityHistoryForm({
            ...activityHistoryForm,
            [name]: value
        });

        if (activityHistoryErrors[name]) {
            const updatedErrors = {...activityHistoryErrors};
            delete updatedErrors[name];
            setActivityHistoryErrors(updatedErrors);
        }
    }

    function updatePreviousTrainer(value) {
        const updatedForm = {
            ...activityHistoryForm,
            previousTrainer: value
        };

        if (!value) {
            updatedForm.previousTrainerExperience = '';
        }

        const updatedErrors = {...activityHistoryErrors};
        delete updatedErrors.previousTrainer;

        setActivityHistoryForm(updatedForm);
        setActivityHistoryErrors(updatedErrors);
    }

    /*
     *  Medical
     */

    function handleMedicalBack() {
        saveIntakeStep(IntakeSteps.MEDICAL, medicalForm, () => {
            setCurrentStep(IntakeSteps.ACTIVITY_HISTORY);
            scrollToTop();
        });
    }

    function handleMedicalContinue(event) {
        event.preventDefault();

        saveIntakeStep(IntakeSteps.MEDICAL, medicalForm, () => {
            setCurrentStep(IntakeSteps.LIFESTYLE);
            scrollToTop();
        });
    }

    function updateMedicalForm(event) {
        const {name, value} = event.target;

        setMedicalForm({
            ...medicalForm,
            [name]: value
        });
    }

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Render Helpers
    --------------------------------------------------------------------------------------------------------------------------------------*/

    function renderIntakeHeader(progress) {
        return (
            <>
                <div className="intake-header">
                    <h3 className="intake-step-title">
                        New Client Intake
                    </h3>
                    <button type="button"
                            className="danger-button intake-exit-button"
                            onClick={() => exitIntake()}
                    >
                        ×
                    </button>
                    <div className="intake-progress">
                        {progress}
                    </div>
                </div>
                <div className="section-divider spaced"></div>
            </>
        );
    }

    /*
     *  Basic Info
     */

    function renderBasicInfo() {
        return (
            <>
                {renderIntakeHeader('Step 1 of 7 · Basic Information')}

                <form onSubmit={saveBasicInfo} className="client-form">
                    {basicInfoErrors.trainerId && <div className="field-error"> * {basicInfoErrors.trainerId}</div>}
                    <div className="form-field">
                        <label>First Name</label>
                        <input name="firstName"
                               className={basicInfoErrors.firstName ? 'input-error' : ''}
                               value={basicInfoForm.firstName}
                               onChange={updateBasicInfoForm}
                        />
                    </div>
                    {basicInfoErrors.firstName && <div className="field-error"> * {basicInfoErrors.firstName}</div>}
                    <div className="form-field">
                        <label>Last Name</label>
                        <input name="lastName"
                               className={basicInfoErrors.lastName ? 'input-error' : ''}
                               value={basicInfoForm.lastName}
                               onChange={updateBasicInfoForm}
                        />
                        {basicInfoErrors.lastName && <div className="field-error"> * {basicInfoErrors.lastName}</div>}
                    </div>
                    <div className="form-field">
                        <label>Preferred Name</label>
                        <input name="preferredName"
                               placeholder={"Optional"}
                               value={basicInfoForm.preferredName}
                               onChange={updateBasicInfoForm}
                        />
                    </div>

                    <div className="section-divider spaced" />

                    <div className="form-field">
                        <label>Phone</label>
                        <input
                            name="phone"
                            inputMode="tel"
                            placeholder="Digits only"
                            className={basicInfoErrors.phone ? 'input-error' : ''}
                            value={basicInfoForm.phone}
                            onChange={(event) => {
                                setBasicInfoForm({
                                    ...basicInfoForm,
                                    phone: PhoneUtils.formatPhoneFromDigits(event.target.value)
                                });
                                if (basicInfoErrors.phone) {
                                    const updatedErrors = {...basicInfoErrors};
                                    delete updatedErrors.phone;
                                    setBasicInfoErrors(updatedErrors);
                                }
                            }}
                        />
                        {basicInfoErrors.phone && <div className="field-error">* {basicInfoErrors.phone}</div>}
                    </div>
                    <div className="form-field">
                        <label>Email</label>
                        <input name="email"
                               className={basicInfoErrors.email ? 'input-error' : ''}
                               value={basicInfoForm.email}
                               onChange={updateBasicInfoForm}
                        />
                        {basicInfoErrors.email && <div className="field-error"> * {basicInfoErrors.email}</div>}
                    </div>

                    <div className="section-divider spaced" />

                    <div className="form-field">
                        <label>Birth Date</label>
                        <input name="birthDate"
                               className={basicInfoErrors.birthDate ? 'input-error' : ''}
                               type="date"
                               value={basicInfoForm.birthDate}
                               onChange={updateBasicInfoForm}
                        />
                        {basicInfoErrors.birthDate && <div className="field-error"> * {basicInfoErrors.birthDate}</div>}
                    </div>
                    <div className="form-field">
                        <label>Gender</label>
                        <select
                            name="gender"
                            value={basicInfoForm.gender}
                            onChange={updateBasicInfoForm}
                        >
                            <option value="">Select gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="NON_BINARY">Non-binary</option>
                            <option value="UNDISCLOSED">Prefer not to say</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="submit">
                            Save & Continue
                        </button>
                    </div>
                </form>
            </>
        );
    }

    /*
     *  PARQ
     */

    function renderParq() {
        return (
            <>
                {renderIntakeHeader('Step 2 of 7 · PAR-Q')}

                <form onSubmit={handleParqContinue}>
                    {renderParqQuestion('heartCondition', 'Has your doctor ever said that you have a heart condition?')}
                    {renderParqQuestion('chestPainDuringActivity', 'Do you feel pain in your chest during physical activity?')}
                    {renderParqQuestion('chestPainAtRest', 'Have you experienced chest pain at rest during the last month?')}
                    {renderParqQuestion('dizzinessOrLossOfBalance', 'Do you lose balance because of dizziness or lose consciousness?')}
                    {renderParqQuestion('boneOrJointProblem', 'Do you have a bone or joint problem that could be made worse by exercise?')}
                    {renderParqQuestion('bloodPressureMedication', 'Are you currently prescribed medication for blood pressure or a heart condition?')}
                    {renderParqQuestion('otherMedicalReason', 'Is there any other reason you should not participate in physical activity?')}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleParqBack}
                        >
                            Go Back
                        </button>

                        <button type="submit">
                            Save & Continue
                        </button>
                    </div>
                </form>
            </>
        );
    }

    function renderParqQuestion(field, label) {
        return (
            <div className={`intake-question ${parqErrors[field] ? 'error' : ''}`}>
                <label>{label}</label>
                <div className="intake-answer-group">
                    <label className="intake-answer">
                        <input
                            type="radio"
                            name={field}
                            checked={parqForm[field] === true}
                            onChange={() => updateParqValue(field, true)}
                        />
                        Yes
                    </label>

                    <label className="intake-answer">
                        <input
                            type="radio"
                            name={field}
                            checked={parqForm[field] === false}
                            onChange={() => updateParqValue(field, false)}
                        />
                        No
                    </label>
                </div>
                {parqErrors[field] && (
                    <div className="field-error intake-error">
                        * Please answer this question
                    </div>
                )}
                {field === 'otherMedicalReason' && parqForm.otherMedicalReason && (
                    <div className="form-field">
                        <div className="section-divider spaced" />
                        <label>Please explain:</label>
                        <textarea
                            className={parqErrors.additionalNotes ? 'input-error' : ''}
                            name="additionalNotes"
                            rows="4"
                            value={parqForm.additionalNotes}
                            onChange={updateParqForm}
                        />
                    </div>
                )}
                {field === 'otherMedicalReason' && parqForm.otherMedicalReason && parqErrors.additionalNotes && (
                    <div className="field-error intake-error">
                        * {parqErrors.additionalNotes}
                    </div>
                )}
            </div>
        );
    }

    /*
     *  Goals
     */

    function renderGoals() {
        const goalOptions = [
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

        return (
            <>
                {renderIntakeHeader('Step 3 of 7 · Goals')}

                <form onSubmit={handleGoalsContinue}>
                    <div className="form-field">
                        <label>What are your fitness objectives? Select all that apply.</label>

                        <div className={`multi-option-grid ${goalsErrors.objectives ? 'error' : ''}`}>
                            {goalOptions.map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={`multi-option ${goalsForm.objectives.includes(value) ? 'selected' : ''}`}
                                    onClick={() => updateGoalObjective(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {goalsErrors.objectives && (
                            <div className="field-error vertical-gap-sm">
                                * {goalsErrors.objectives}
                            </div>
                        )}
                    </div>

                    {goalsForm.objectives.includes('OTHER') && (
                        <div className="form-field vertical-gap-md">
                            <label>Describe your other goal(s):</label>
                            <textarea
                                className={goalsErrors.otherGoal ? 'input-error' : ''}
                                name="otherGoal"
                                rows="3"
                                value={goalsForm.otherGoal}
                                onChange={updateGoalsForm}
                            />
                            {goalsErrors.otherGoal && (
                                <div className="field-error">
                                    * {goalsErrors.otherGoal}
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
                            value={goalsForm.successDescription}
                            onChange={updateGoalsForm}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleGoalsBack}
                        >
                            Go Back
                        </button>

                        <button type="submit">
                            Save & Continue
                        </button>
                    </div>
                </form>
            </>
        );
    }

    function renderActivityHistory() {
        return (
            <>
                {renderIntakeHeader('Step 4 of 7 · Activity History')}

                <form onSubmit={handleActivityHistoryContinue}>
                    <div className={`intake-question ${activityHistoryErrors.previousTrainer ? 'error' : ''}`}>
                        <label>Have you worked with a personal trainer before?</label>

                        <div className="intake-answer-group">
                            <label className="intake-answer">
                                <input
                                    type="radio"
                                    name="previousTrainer"
                                    checked={activityHistoryForm.previousTrainer === true}
                                    onChange={() => updatePreviousTrainer(true)}
                                />
                                Yes
                            </label>

                            <label className="intake-answer">
                                <input
                                    type="radio"
                                    name="previousTrainer"
                                    checked={activityHistoryForm.previousTrainer === false}
                                    onChange={() => updatePreviousTrainer(false)}
                                />
                                No
                            </label>
                        </div>

                        {activityHistoryErrors.previousTrainer && (
                            <div className="field-error intake-error">
                                * {activityHistoryErrors.previousTrainer}
                            </div>
                        )}

                        {activityHistoryForm.previousTrainer && (
                            <div className="form-field">
                                <div className="section-divider vertical-gap-md" />
                                <label className="vertical-gap-sm">Please describe your experience:</label>
                                <textarea
                                    name="previousTrainerExperience"
                                    rows="3"
                                    placeholder="Optional"
                                    value={activityHistoryForm.previousTrainerExperience}
                                    onChange={updateActivityHistoryForm}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-field">
                        <label>Current level of physical activity</label>
                        <select
                            name="activityLevel"
                            className={activityHistoryErrors.activityLevel ? 'input-error' : ''}
                            value={activityHistoryForm.activityLevel}
                            onChange={updateActivityHistoryForm}
                        >
                            <option value="">Select activity level</option>
                            <option value="SEDENTARY">Sedentary</option>
                            <option value="LIGHTLY_ACTIVE">Lightly active</option>
                            <option value="MODERATELY_ACTIVE">Moderately active</option>
                            <option value="VERY_ACTIVE">Very active</option>
                        </select>
                        {activityHistoryErrors.activityLevel && (
                            <div className="field-error">
                                * {activityHistoryErrors.activityLevel}
                            </div>
                        )}
                    </div>

                    <div className="form-field vertical-gap-md">
                        <label>Describe your current exercise routine</label>
                        <textarea
                            name="currentRoutine"
                            rows="3"
                            placeholder="Optional"
                            value={activityHistoryForm.currentRoutine}
                            onChange={updateActivityHistoryForm}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleActivityHistoryBack}
                        >
                            Go Back
                        </button>

                        <button type="submit">
                            Save & Continue
                        </button>
                    </div>
                </form>
            </>
        );
    }

    function renderMedical() {
        return (
            <>
                {renderIntakeHeader('Step 5 of 7 · Medical History')}

                <form onSubmit={handleMedicalContinue}>
                    <div className="form-field">
                        <label>Medical conditions</label>
                        <textarea
                            name="medicalConditions"
                            rows="3"
                            placeholder="Optional"
                            value={medicalForm.medicalConditions}
                            onChange={updateMedicalForm}
                        />
                    </div>

                    <div className="form-field vertical-gap-md">
                        <label>Current medications</label>
                        <textarea
                            name="currentMedications"
                            rows="3"
                            placeholder="Optional"
                            value={medicalForm.currentMedications}
                            onChange={updateMedicalForm}
                        />
                    </div>

                    <div className="form-field vertical-gap-md">
                        <label>Past injuries or surgeries</label>
                        <textarea
                            name="pastSurgeries"
                            rows="3"
                            placeholder="Optional"
                            value={medicalForm.pastSurgeries}
                            onChange={updateMedicalForm}
                        />
                    </div>

                    <div className="form-field vertical-gap-md">
                        <label>Current injuries or physical limitations</label>
                        <textarea
                            name="injuriesLimitations"
                            rows="3"
                            placeholder="Optional"
                            value={medicalForm.injuriesLimitations}
                            onChange={updateMedicalForm}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleMedicalBack}
                        >
                            Go Back
                        </button>

                        <button type="submit">
                            Save & Continue
                        </button>
                    </div>
                </form>
            </>
        );
    }

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Validation
    --------------------------------------------------------------------------------------------------------------------------------------*/

    function validateBasicInfoForm(form) {
        const updatedErrors = {};
        if (!form.firstName.trim()) {
            updatedErrors.firstName = 'First name is required';
        }
        if (!form.lastName.trim()) {
            updatedErrors.lastName = 'Last name is required';
        }
        if (!form.birthDate) {
            updatedErrors.birthDate = 'Birth date is required';
        }
        if (!form.phone.trim()) {
            updatedErrors.phone = 'Phone number is required';
        } else {
            const phone = PhoneUtils.splitPhone(form.phone);

            if (PhoneUtils.isPartialPhone(phone.area, phone.prefix, phone.line)) {
                updatedErrors.phone = 'Phone number must be complete';
            }
        }
        return updatedErrors;
    }

    function validateParqForm() {
        const errors = {};

        Object.entries(parqForm).forEach(([key, value]) => {
            if (key === 'additionalNotes') {
                return;
            }

            if (value === null) {
                errors[key] = 'Required';
            }
        });

        if (parqForm.otherMedicalReason && !parqForm.additionalNotes.trim()) {
            errors.additionalNotes = 'Explanation required';
        }

        return errors;
    }

    function validateGoalsForm() {
        const errors = {};

        if (goalsForm.objectives.length === 0) {
            errors.objectives = 'Select at least one goal';
        }

        if (goalsForm.objectives.includes('OTHER') && !goalsForm.otherGoal.trim()) {
            errors.otherGoal = 'Please describe your other goal';
        }

        return errors;
    }

    function validateActivityHistoryForm() {
        const errors = {};

        if (activityHistoryForm.previousTrainer === null) {
            errors.previousTrainer = 'Please answer this question';
        }

        if (!activityHistoryForm.activityLevel) {
            errors.activityLevel = 'Current activity level is required';
        }

        return errors;
    }

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Utility
    --------------------------------------------------------------------------------------------------------------------------------------*/

    function createEmptyBasicInfoForm(form) {
        return {
            trainerId: trainerId,
            firstName: '',
            lastName: '',
            preferredName: '',
            email: '',
            phone: '',
            birthDate: '',
            gender: '',
        };
    }

    function normalizeBasicInfoForm(form) {
        return {
            ...form,
            firstName: TextUtils.normalizeName(form.firstName),
            lastName: TextUtils.normalizeName(form.lastName),
            preferredName: TextUtils.normalizeName(form.preferredName),
            email: TextUtils.normalizeEmail(form.email),
            phone: form.phone.trim(),
            gender: form.gender || null,
        };
    }

    function createEmptyParqForm() {
        return {
            heartCondition: null,
            chestPainDuringActivity: null,
            chestPainAtRest: null,
            dizzinessOrLossOfBalance: null,
            boneOrJointProblem: null,
            bloodPressureMedication: null,
            otherMedicalReason: null,
            additionalNotes: ''
        };
    }

    function createEmptyGoalsForm() {
        return {
            objectives: [],
            otherGoal: '',
            successDescription: ''
        };
    }

    function createEmptyActivityHistoryForm() {
        return {
            previousTrainer: null,
            previousTrainerExperience: '',
            activityLevel: '',
            currentRoutine: ''
        };
    }

    function createEmptyMedicalForm() {
        return {
            medicalConditions: '',
            currentMedications: '',
            pastSurgeries: '',
            injuriesLimitations: ''
        };
    }

    function scrollToTop() {
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 200);
    }

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Main Return
    --------------------------------------------------------------------------------------------------------------------------------------*/

    return (
        <div className="intake-page">
            <section className="intake-card">
                {currentStep === IntakeSteps.BASIC_INFO && (
                    renderBasicInfo()
                )}
                {currentStep === IntakeSteps.PARQ && (
                   renderParq()
                )}
                {currentStep === IntakeSteps.GOALS && (
                    renderGoals()
                )}
                {currentStep === IntakeSteps.ACTIVITY_HISTORY && (
                    renderActivityHistory()
                )}
                {currentStep === IntakeSteps.MEDICAL && (
                    renderMedical()
                )}
            </section>
        </div>
    );
}

export default ClientIntakePage;