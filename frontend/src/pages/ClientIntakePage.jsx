import {useEffect, useRef, useState} from 'react';
import * as PhoneUtils from '../utils/phone-utils';
import * as TextUtils from '../utils/text-utils';

function ClientIntakePage({trainerId, navigate}) { //TODO added `navigate` to return to clients page (to be replaced with routing)

    /*-------------------------------------------------------------------------------------------------------------------------------------
        State
    --------------------------------------------------------------------------------------------------------------------------------------*/

    const [currentStep, setCurrentStep] = useState('BASIC_INFO');
    const [clientId, setClientId] = useState(null);
    const [intakeId, setIntakeId] = useState(null);

    const [basicInfoErrors, setBasicInfoErrors] = useState({});
    const [parqErrors, setParqErrors] = useState({});

    const [basicInfoForm, setBasicInfoForm] = useState({
        trainerId: trainerId,
        firstName: '',
        lastName: '',
        preferredName: '',
        email: '',
        phone: '',
        birthDate: '',
        gender: '',
    });

    const [parqForm, setParqForm] = useState(createEmptyParqForm());

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
                    throw new Error(errorBody.message || 'Failed to create client');
                }
                return response.json();
            })
            .then(intake => {
                setClientId(intake.clientId);
                setIntakeId(intake.id);
                setCurrentStep(intake.currentStep);
                scrollToTop();
            })
            .catch(error => console.error('Error creating client:', error));
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

    function saveBasicInfo(event) {
        if (clientId) {
            updateClient(event);
        } else {
            createClient(event);
        }
    }

    function handleParqBack() {
        saveIntakeStep('PARQ', parqForm, () => {
            setCurrentStep('BASIC_INFO');
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

        saveIntakeStep('PARQ', parqForm, () => {
            setCurrentStep('GOALS');
            scrollToTop();
        });
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

    function exitIntake() {
        if (currentStep === 'PARQ') {
            saveIntakeStep('PARQ', parqForm, () => navigate('clients')); //TODO will likely be replaced with routing
        } else {
            navigate('clients'); //TODO will likely be replaced with routing
        }
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

    function renderBasicInfo() {
        return (
            <>
                {renderIntakeHeader('Step 1 of 6 · Basic Information')}
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

    function renderParq() {
        return (
            <>
                {renderIntakeHeader('Step 2 of 6 · PAR-Q')}
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
            <div className={`parq-question ${parqErrors[field] ? 'error' : ''}`}>
                <label>{label}</label>
                <div className="parq-answer-group">
                    <label className="parq-answer">
                        <input
                            type="radio"
                            name={field}
                            checked={parqForm[field] === true}
                            onChange={() => updateParqValue(field, true)}
                        />
                        Yes
                    </label>

                    <label className="parq-answer">
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
                    <div className="field-error parq-error">
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
                    <div className="field-error parq-error">
                        * {parqErrors.additionalNotes}
                    </div>
                )}
            </div>
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

    /*-------------------------------------------------------------------------------------------------------------------------------------
        Utility
    --------------------------------------------------------------------------------------------------------------------------------------*/

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
                {currentStep === 'BASIC_INFO' && (
                    renderBasicInfo()
                )}
                {currentStep === 'PARQ' && (
                   renderParq()
                )}
            </section>
        </div>
    );
}

export default ClientIntakePage;