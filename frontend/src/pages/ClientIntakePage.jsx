import {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {ROUTES} from '../constants/routes';
import {IntakeSteps} from '../constants/layout';
import * as PhoneUtils from '../utils/phone-utils';
import * as TextUtils from '../utils/text-utils';

function ClientIntakePage({trainerId}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Route state
    // ------------------------------------------------------------------------------------------------------------------------

    const navigate = useNavigate();
    const {intakeId: routeIntakeId} = useParams();

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [currentStep, setCurrentStep] = useState(IntakeSteps.BASIC_INFO);
    const [clientId, setClientId] = useState(null);
    const [intakeId, setIntakeId] = useState(null);

    const [basicInfoForm, setBasicInfoForm] = useState(createEmptyBasicInfoForm());
    const [parqForm, setParqForm] = useState(createEmptyParqForm());
    const [goalsForm, setGoalsForm] = useState(createEmptyGoalsForm());
    const [activityHistoryForm, setActivityHistoryForm] = useState(createEmptyActivityHistoryForm());
    const [medicalForm, setMedicalForm] = useState(createEmptyMedicalForm());
    const [lifestyleForm, setLifestyleForm] = useState(createEmptyLifestyleForm());
    const [trainingPreferencesForm, setTrainingPreferencesForm] = useState(createEmptyTrainingPreferencesForm());

    const [basicInfoErrors, setBasicInfoErrors] = useState({});
    const [parqErrors, setParqErrors] = useState({});
    const [goalsErrors, setGoalsErrors] = useState({});
    const [activityHistoryErrors, setActivityHistoryErrors] = useState({});
    const [lifestyleErrors, setLifestyleErrors] = useState({});
    const [trainingPreferencesErrors, setTrainingPreferencesErrors] = useState({});

    // ------------------------------------------------------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (routeIntakeId) {
            loadIntake(routeIntakeId);
        }
    }, [routeIntakeId]);

    // ------------------------------------------------------------------------------------------------------------------------
    // Loading
    // ------------------------------------------------------------------------------------------------------------------------

    function loadIntake(id) {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/client-intakes/${id}`)
            .then(response => response.json())
            .then(intake => {
                hydrateIntake(intake);
                loadClient(intake.clientId);
                setCurrentStep(intake.currentStep);
                scrollToTop();
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
        if (intake.medicalHistoryJson) {
            setMedicalForm({
                ...createEmptyMedicalForm(),
                ...JSON.parse(intake.medicalHistoryJson)
            });
        }
        if (intake.lifestyleJson) {
            setLifestyleForm({
                ...createEmptyLifestyleForm(),
                ...JSON.parse(intake.lifestyleJson)
            });
        }
        if (intake.trainingPreferencesJson) {
            setTrainingPreferencesForm({
                ...createEmptyTrainingPreferencesForm(),
                ...JSON.parse(intake.trainingPreferencesJson)
            });
        }
    }

    function loadClient(id) {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/${id}`)
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to load client');
                }

                return response.json();
            })
            .then(client => {
                setBasicInfoForm({
                    trainerId,
                    firstName: client.firstName || '',
                    lastName: client.lastName || '',
                    preferredName: client.preferredName || '',
                    email: client.email || '',
                    phone: client.phone || '',
                    birthDate: client.birthDate || '',
                    gender: client.gender || '',
                });
            })
            .catch(error => {
                console.error('Error loading client:', error)
                setFailedLoadError(error);
            });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // API actions
    // ------------------------------------------------------------------------------------------------------------------------

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
                navigate(ROUTES.intake(intake.id), { replace: true });
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

    function completeIntake() {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/client-intakes/${intakeId}/complete`, {
            method: 'PATCH'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to complete intake');
                }

                return response.json();
            })
            .then(intake => {
                hydrateIntake(intake);
                setCurrentStep(IntakeSteps.COMPLETED);
                scrollToTop();
            })
            .catch(error => console.error('Error completing intake:', error));
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function exitIntake() {
        if (currentStep !== IntakeSteps.BASIC_INFO && currentStep !== IntakeSteps.COMPLETED) {
            const confirmed = window.confirm('Are you sure you wish to exit?\n\nYour progress will be saved and the intake can be resumed later.');

            if (!confirmed) {
                return;
            }
        }
        switch (currentStep) {
            case IntakeSteps.PARQ:
                saveIntakeStep(IntakeSteps.PARQ, parqForm, () => navigate(ROUTES.clientProfile(clientId)));
                break;
            case IntakeSteps.GOALS:
                saveIntakeStep(IntakeSteps.GOALS, goalsForm, () => navigate(ROUTES.clientProfile(clientId)));
                break;
            case IntakeSteps.ACTIVITY_HISTORY:
                saveIntakeStep(IntakeSteps.ACTIVITY_HISTORY, activityHistoryForm, () => navigate(ROUTES.clientProfile(clientId)));
                break;
            case IntakeSteps.MEDICAL:
                saveIntakeStep(IntakeSteps.MEDICAL, medicalForm, () => navigate(ROUTES.clientProfile(clientId)));
                break;
            case IntakeSteps.LIFESTYLE:
                saveIntakeStep(IntakeSteps.LIFESTYLE, lifestyleForm, () => navigate(ROUTES.clientProfile(clientId)));
                break;
            case IntakeSteps.TRAINING_PREFERENCES:
                saveIntakeStep(IntakeSteps.TRAINING_PREFERENCES, trainingPreferencesForm, () => navigate(ROUTES.clientProfile(clientId)));
                break;
            default:
                if (clientId) {
                    navigate(ROUTES.clientProfile(clientId));
                } else {
                    navigate(ROUTES.CLIENTS);
                }
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

    /*
     * Lifestyle
     */

    function handleLifestyleBack() {
        saveIntakeStep(IntakeSteps.LIFESTYLE, lifestyleForm, () => {
            setCurrentStep(IntakeSteps.MEDICAL);
            scrollToTop();
        });
    }

    function handleLifestyleContinue(event) {
        event.preventDefault();

        const errors = validateLifestyleForm();

        if (Object.keys(errors).length > 0) {
            setLifestyleErrors(errors);
            return;
        }

        saveIntakeStep(IntakeSteps.LIFESTYLE, lifestyleForm, () => {
            setCurrentStep(IntakeSteps.TRAINING_PREFERENCES);
            scrollToTop();
        });
    }

    function updateLifestyleForm(event) {
        const {name, value} = event.target;

        const updatedForm = {
            ...lifestyleForm,
            [name]: value
        };

        if (
            name === 'stressLevel'
            && value !== 'MODERATE'
            && value !== 'HIGH'
            && value !== 'VERY_HIGH'
        ) {
            updatedForm.stressSources = '';
        }

        setLifestyleForm(updatedForm);

        if (lifestyleErrors[name]) {
            const updatedErrors = {...lifestyleErrors};
            delete updatedErrors[name];
            setLifestyleErrors(updatedErrors);
        }
    }

    /*
     * Training Preferences
     */

    function handleTrainingPreferencesBack() {
        saveIntakeStep(IntakeSteps.TRAINING_PREFERENCES, trainingPreferencesForm, () => {
            setCurrentStep(IntakeSteps.LIFESTYLE);
            scrollToTop();
        });
    }

    function handleTrainingPreferencesContinue(event) {
        event.preventDefault();

        const errors = validateTrainingPreferencesForm();

        if (Object.keys(errors).length > 0) {
            setTrainingPreferencesErrors(errors);
            return;
        }

        saveIntakeStep(IntakeSteps.TRAINING_PREFERENCES, trainingPreferencesForm, () => {
            completeIntake();
        });
    }

    function updateTrainingPreferencesForm(event) {
        const {name, value} = event.target;

        setTrainingPreferencesForm({
            ...trainingPreferencesForm,
            [name]: value
        });

        if (trainingPreferencesErrors[name]) {
            const updatedErrors = {...trainingPreferencesErrors};
            delete updatedErrors[name];
            setTrainingPreferencesErrors(updatedErrors);
        }
    }

    function updatePreferredWorkoutDay(day) {
        const selected = trainingPreferencesForm.preferredWorkoutDays.includes(day);

        const updatedDays = selected
            ? trainingPreferencesForm.preferredWorkoutDays.filter(value => value !== day)
            : [...trainingPreferencesForm.preferredWorkoutDays, day];

        setTrainingPreferencesForm({
            ...trainingPreferencesForm,
            preferredWorkoutDays: updatedDays
        });
    }

    function updateLearningStyle(style) {
        const selected = trainingPreferencesForm.learningStyles.includes(style);

        const updatedLearningStyles = selected
            ? trainingPreferencesForm.learningStyles.filter(value => value !== style)
            : [...trainingPreferencesForm.learningStyles, style];

        setTrainingPreferencesForm({
            ...trainingPreferencesForm,
            learningStyles: updatedLearningStyles
        });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

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
                {renderIntakeHeader('Step 1 of 8 · Basic Information')}

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
                {renderIntakeHeader('Step 2 of 8 · PAR-Q')}

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
                {renderIntakeHeader('Step 3 of 8 · Goals')}

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
                {renderIntakeHeader('Step 4 of 8 · Activity History')}

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
                {renderIntakeHeader('Step 5 of 8 · Medical History')}

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

    function renderLifestyle() {
        return (
            <>
                {renderIntakeHeader('Step 6 of 8 · Lifestyle')}

                <form onSubmit={handleLifestyleContinue}>
                    <div className="form-field">
                        <label>Occupation</label>
                        <input
                            name="occupation"
                            placeholder="Optional"
                            value={lifestyleForm.occupation}
                            onChange={updateLifestyleForm}
                        />
                    </div>

                    <div className="form-field vertical-gap-md">
                        <label>Daily activity level</label>
                        <select
                            name="dailyActivityLevel"
                            className={lifestyleErrors.dailyActivityLevel ? 'input-error' : ''}
                            value={lifestyleForm.dailyActivityLevel}
                            onChange={updateLifestyleForm}
                        >
                            <option value="">Select daily activity level</option>
                            <option value="MOSTLY_SITTING">Mostly sitting</option>
                            <option value="MOSTLY_STANDING">Mostly standing</option>
                            <option value="MODERATELY_ACTIVE">Moderately active</option>
                            <option value="HIGHLY_ACTIVE">Highly active</option>
                        </select>
                        {lifestyleErrors.dailyActivityLevel && (
                            <div className="field-error">
                                * {lifestyleErrors.dailyActivityLevel}
                            </div>
                        )}
                    </div>

                    <div className="form-field vertical-gap-md">
                        <label>Average sleep</label>
                        <select
                            name="averageSleep"
                            className={lifestyleErrors.averageSleep ? 'input-error' : ''}
                            value={lifestyleForm.averageSleep}
                            onChange={updateLifestyleForm}
                        >
                            <option value="">Select average sleep</option>
                            <option value="LESS_THAN_5">Less than 5 hours</option>
                            <option value="FIVE_TO_SIX">5-6 hours</option>
                            <option value="SIX_TO_SEVEN">6-7 hours</option>
                            <option value="SEVEN_TO_EIGHT">7-8 hours</option>
                            <option value="MORE_THAN_8">8+ hours</option>
                        </select>
                        {lifestyleErrors.averageSleep && (
                            <div className="field-error">
                                * {lifestyleErrors.averageSleep}
                            </div>
                        )}
                    </div>

                    <div className="form-field vertical-gap-md">
                        <label>Stress level</label>
                        <select
                            name="stressLevel"
                            className={lifestyleErrors.stressLevel ? 'input-error' : ''}
                            value={lifestyleForm.stressLevel}
                            onChange={updateLifestyleForm}
                        >
                            <option value="">Select stress level</option>
                            <option value="LOW">Low</option>
                            <option value="MODERATE">Moderate</option>
                            <option value="HIGH">High</option>
                            <option value="VERY_HIGH">Very High</option>
                        </select>
                        {lifestyleErrors.stressLevel && (
                            <div className="field-error">
                                * {lifestyleErrors.stressLevel}
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
                                value={lifestyleForm.stressSources}
                                onChange={updateLifestyleForm}
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
                            value={lifestyleForm.additionalNotes}
                            onChange={updateLifestyleForm}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleLifestyleBack}
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

    function renderTrainingPreferences() {
        const workoutDayOptions = [
            ['MONDAY', 'Mon'],
            ['TUESDAY', 'Tue'],
            ['WEDNESDAY', 'Wed'],
            ['THURSDAY', 'Thu'],
            ['FRIDAY', 'Fri'],
            ['SATURDAY', 'Sat'],
            ['SUNDAY', 'Sun'],
        ];

        const learningStyleOptions = [
            ['VISUAL_DEMONSTRATION', 'Visual demonstration'],
            ['VERBAL_EXPLANATION', 'Verbal explanation'],
            ['HANDS_ON_CORRECTION', 'Hands-on correction'],
            ['WRITTEN_INSTRUCTIONS', 'Written instructions'],
            ['NOT_SURE', 'Not sure']
        ];

        return (
            <>
                {renderIntakeHeader('Step 7 of 8 · Training Preferences')}

                <form onSubmit={handleTrainingPreferencesContinue}>
                    <div className="form-field">
                        <label>How many days per week would you like to train?</label>
                        <select
                            name="daysPerWeek"
                            className={trainingPreferencesErrors.daysPerWeek ? 'input-error' : ''}
                            value={trainingPreferencesForm.daysPerWeek}
                            onChange={updateTrainingPreferencesForm}
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
                        {trainingPreferencesErrors.daysPerWeek && (
                            <div className="field-error">
                                * {trainingPreferencesErrors.daysPerWeek}
                            </div>
                        )}
                    </div>

                    <div className="form-field vertical-gap-md">
                        <label>Preferred workout time</label>
                        <select
                            name="workoutTimePreference"
                            className={trainingPreferencesErrors.workoutTimePreference ? 'input-error' : ''}
                            value={trainingPreferencesForm.workoutTimePreference}
                            onChange={updateTrainingPreferencesForm}
                        >
                            <option value="">Select workout time</option>
                            <option value="MORNING">Morning</option>
                            <option value="AFTERNOON">Afternoon</option>
                            <option value="EVENING">Evening</option>
                            <option value="FLEXIBLE">Flexible</option>
                        </select>
                        {trainingPreferencesErrors.workoutTimePreference && (
                            <div className="field-error">
                                * {trainingPreferencesErrors.workoutTimePreference}
                            </div>
                        )}
                    </div>

                    <div className="section-divider spaced" />

                    <div className="form-field">
                        <label>Which days are you generally available to train? Select all that apply. (Optional)</label>

                        <div className="multi-option-grid">
                            {workoutDayOptions.map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={`multi-option ${trainingPreferencesForm.preferredWorkoutDays.includes(value) ? 'selected' : ''}`}
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
                            {learningStyleOptions.map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={`multi-option ${trainingPreferencesForm.learningStyles.includes(value) ? 'selected' : ''}`}
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
                            value={trainingPreferencesForm.exercisesToAvoid}
                            onChange={updateTrainingPreferencesForm}
                        />
                    </div>

                    <div className="form-field vertical-gap-md">
                        <label>Additional training preferences</label>
                        <textarea
                            name="additionalPreferences"
                            rows="3"
                            placeholder="Optional"
                            value={trainingPreferencesForm.additionalPreferences}
                            onChange={updateTrainingPreferencesForm}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleTrainingPreferencesBack}
                        >
                            Go Back
                        </button>

                        <button type="submit">
                            Complete Intake
                        </button>
                    </div>
                </form>
            </>
        );
    }

    function renderCompleted() {
        return (
            <>
                {renderIntakeHeader('Step 8 of 8 · Complete')}

                <div className="empty-state">
                    <h2>🎉 Intake Completed</h2>
                    <p>Thank you. Please return the device to your trainer.</p>
                    <p>Your trainer will review your answers with you before beginning the assessment.</p>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setCurrentStep(IntakeSteps.TRAINING_PREFERENCES)}
                    >
                        Go Back
                    </button>
                </div>
            </>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Validation
    // ------------------------------------------------------------------------------------------------------------------------

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

    function validateLifestyleForm() {
        const errors = {};

        if (!lifestyleForm.dailyActivityLevel) {
            errors.dailyActivityLevel = 'Daily activity level is required';
        }

        if (!lifestyleForm.averageSleep) {
            errors.averageSleep = 'Average sleep is required';
        }

        if (!lifestyleForm.stressLevel) {
            errors.stressLevel = 'Stress level is required';
        }

        return errors;
    }

    function validateTrainingPreferencesForm() {
        const errors = {};

        if (!trainingPreferencesForm.daysPerWeek) {
            errors.daysPerWeek = 'Training days per week is required';
        }

        if (!trainingPreferencesForm.workoutTimePreference) {
            errors.workoutTimePreference = 'Workout time preference is required';
        }

        return errors;
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Form helpers
    // ------------------------------------------------------------------------------------------------------------------------

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

    function createEmptyLifestyleForm() {
        return {
            occupation: '',
            dailyActivityLevel: '',
            averageSleep: '',
            stressLevel: '',
            stressSources: '',
            additionalNotes: ''
        };
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Utility
    // ------------------------------------------------------------------------------------------------------------------------

    function showStressSources() {
        return lifestyleForm.stressLevel === 'MODERATE'
            || lifestyleForm.stressLevel === 'HIGH'
            || lifestyleForm.stressLevel === 'VERY_HIGH';
    }

    function createEmptyTrainingPreferencesForm() {
        return {
            daysPerWeek: '',
            workoutTimePreference: '',
            preferredWorkoutDays: [],
            learningStyles: [],
            exercisesToAvoid: '',
            additionalPreferences: ''
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

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

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
                {currentStep === IntakeSteps.LIFESTYLE && (
                    renderLifestyle()
                )}
                {currentStep === IntakeSteps.TRAINING_PREFERENCES && (
                    renderTrainingPreferences()
                )}
                {currentStep === IntakeSteps.COMPLETED && (
                    renderCompleted()
                )}
            </section>
        </div>
    );
}

export default ClientIntakePage;