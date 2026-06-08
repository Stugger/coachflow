import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {
    LoadingOverlay,
    Container,
    Paper,
    Alert,
    Button,
    Center,
    Stack,
    Text,
    ThemeIcon,
    Title,
    Group,
    Modal,
} from '@mantine/core';
import {
    IconCheck,
} from '@tabler/icons-react';

import {ROUTES} from '../constants/routes';
import {IntakeSteps} from '../constants/intake';

import IntakeHeader from '../components/intake/IntakeHeader';

import ClientDetailsForm from '../components/clients/ClientDetailsForm';
import * as ClientDetailsFormUtils from '../utils/client-form-utils';

import ParqStep, {createEmptyParqForm, validateParqForm} from '../components/intake/steps/ParqStep';
import GoalsStep, {createEmptyGoalsForm, validateGoalsForm} from '../components/intake/steps/GoalsStep';
import ActivityHistoryStep, {createEmptyActivityHistoryForm, validateActivityHistoryForm} from '../components/intake/steps/ActivityHistoryStep';
import MedicalHistoryStep, {createEmptyMedicalHistoryForm} from '../components/intake/steps/MedicalHistoryStep';
import LifestyleStep, {createEmptyLifestyleForm, validateLifestyleForm} from '../components/intake/steps/LifestyleStep';
import TrainingPreferencesStep, {createEmptyTrainingPreferencesForm, validateTrainingPreferencesForm} from '../components/intake/steps/TrainingPreferencesStep';

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

    const [clientLoaded, setClientLoaded] = useState(true);
    const [intakeLoaded, setIntakeLoaded] = useState(true);

    const loading = !clientLoaded || !intakeLoaded;

    const [exitModalOpen, setExitModalOpen] = useState(false);

    const [basicInfoForm, setBasicInfoForm] = useState({
        trainerId,
        ...ClientDetailsFormUtils.createEmptyClientDetailsForm(),
    });
    const [parqForm, setParqForm] = useState(createEmptyParqForm());
    const [goalsForm, setGoalsForm] = useState(createEmptyGoalsForm());
    const [activityHistoryForm, setActivityHistoryForm] = useState(createEmptyActivityHistoryForm());
    const [medicalForm, setMedicalForm] = useState(createEmptyMedicalHistoryForm());
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
        setIntakeLoaded(false);
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/client-intakes/${id}`)
            .then(response => response.json())
            .then(intake => {
                hydrateIntake(intake);
                loadClient(intake.clientId);
                setCurrentStep(intake.currentStep);
                scrollToTop();
            })
            .catch(error => {
                console.error('Error loading intake:', error)
            })
            .finally(() => {
                setIntakeLoaded(true);
            });
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
                ...createEmptyMedicalHistoryForm(),
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
        setClientLoaded(false);
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
                    ...ClientDetailsFormUtils.createClientDetailsFormFromClient(client),
                });
            })
            .catch(error => {
                console.error('Error loading client:', error)
            })
            .finally(() => {
                setClientLoaded(true);
            });
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // API actions
    // ------------------------------------------------------------------------------------------------------------------------

    function createClient(event) {
        event.preventDefault();

        const updatedErrors = ClientDetailsFormUtils.validateClientDetailsForm(basicInfoForm);

        if (Object.keys(updatedErrors).length > 0) {
            setBasicInfoErrors(updatedErrors);
            return;
        }

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ClientDetailsFormUtils.normalizeClientDetailsForm(basicInfoForm))
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

        const updatedErrors = ClientDetailsFormUtils.validateClientDetailsForm(basicInfoForm);

        if (Object.keys(updatedErrors).length > 0) {
            setBasicInfoErrors(updatedErrors);
            return;
        }

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/${clientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ClientDetailsFormUtils.normalizeClientDetailsForm(basicInfoForm))
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

        if (!hasData && step === IntakeSteps.MEDICAL) { //medical history can be empty
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
        setExitModalOpen(false);
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
        ClientDetailsFormUtils.updateFormField(
            basicInfoForm,
            basicInfoErrors,
            setBasicInfoForm,
            setBasicInfoErrors,
            name,
            value
        );
    }

    function updateBasicInfoPhone(value) {
        ClientDetailsFormUtils.updateFormField(
            basicInfoForm,
            basicInfoErrors,
            setBasicInfoForm,
            setBasicInfoErrors,
            'phone',
            value
        );
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

        const errors = validateParqForm(parqForm);

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
        updateFormField(
            parqForm,
            parqErrors,
            setParqForm,
            setParqErrors,
            name,
            value
        );
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

        const errors = validateGoalsForm(goalsForm);

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
        updateFormField(
            goalsForm,
            goalsErrors,
            setGoalsForm,
            setGoalsErrors,
            name,
            value
        );
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

        const errors = validateActivityHistoryForm(activityHistoryForm);

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
        updateFormField(
            activityHistoryForm,
            activityHistoryErrors,
            setActivityHistoryForm,
            setActivityHistoryErrors,
            name,
            value
        );
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

        const errors = validateLifestyleForm(lifestyleForm);

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

        const errors = validateTrainingPreferencesForm(trainingPreferencesForm);

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
        updateFormField(
            trainingPreferencesForm,
            trainingPreferencesErrors,
            setTrainingPreferencesForm,
            setTrainingPreferencesErrors,
            name,
            value
        );
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

    function renderBasicInfo() {
        return (
            <>
                <IntakeHeader
                    step="Basic Information"
                    stepNumber={1}
                    exitIntake={exitIntake}
                />
                <ClientDetailsForm
                    form={basicInfoForm}
                    errors={basicInfoErrors}
                    onChange={updateBasicInfoForm}
                    onPhoneChange={updateBasicInfoPhone}
                    onSubmit={saveBasicInfo}
                    submitLabel={"Save & Continue"}
                />
            </>
        );
    }

    function renderParq() {
        return (
            <>
                <IntakeHeader
                    step="PAR-Q"
                    stepNumber={2}
                    exitIntake={() => setExitModalOpen(true)}
                />
                <ParqStep
                    form={parqForm}
                    errors={parqErrors}
                    updateField={updateParqValue}
                    onChange={updateParqForm}
                    onBack={handleParqBack}
                    onContinue={handleParqContinue}
                />

            </>
        );
    }

    function renderGoals() {
        return (
            <>
                <IntakeHeader
                    step="Goals"
                    stepNumber={3}
                    exitIntake={() => setExitModalOpen(true)}
                />
                <GoalsStep
                    form={goalsForm}
                    errors={goalsErrors}
                    updateObjective={updateGoalObjective}
                    onChange={updateGoalsForm}
                    onBack={handleGoalsBack}
                    onContinue={handleGoalsContinue}
                />
            </>
        );
    }

    function renderActivityHistory() {
        return (
            <>
                <IntakeHeader
                    step="Activity History"
                    stepNumber={4}
                    exitIntake={() => setExitModalOpen(true)}
                />
                <ActivityHistoryStep
                    form={activityHistoryForm}
                    errors={activityHistoryErrors}
                    updateTrainer={updatePreviousTrainer}
                    onChange={updateActivityHistoryForm}
                    onBack={handleActivityHistoryBack}
                    onContinue={handleActivityHistoryContinue}
                />
            </>
        );
    }

    function renderMedical() {
        return (
            <>
                <IntakeHeader
                    step="Medical History"
                    stepNumber={5}
                    exitIntake={() => setExitModalOpen(true)}
                />
                <MedicalHistoryStep
                    form={medicalForm}
                    onChange={updateMedicalForm}
                    onBack={handleMedicalBack}
                    onContinue={handleMedicalContinue}
                />
            </>
        );
    }

    function renderLifestyle() {
        return (
            <>
                <IntakeHeader
                    step="Lifestyle"
                    stepNumber={6}
                    exitIntake={() => setExitModalOpen(true)}
                />
                <LifestyleStep
                    form={lifestyleForm}
                    errors={lifestyleErrors}
                    onChange={updateLifestyleForm}
                    onBack={handleLifestyleBack}
                    onContinue={handleLifestyleContinue}
                />
            </>
        );
    }

    function renderTrainingPreferences() {
        return (
            <>
                <IntakeHeader
                    step="Training Preferences"
                    stepNumber={7}
                    exitIntake={() => setExitModalOpen(true)}
                />
                <TrainingPreferencesStep
                    form={trainingPreferencesForm}
                    errors={trainingPreferencesErrors}
                    updatePreferredWorkoutDay={updatePreferredWorkoutDay}
                    updateLearningStyle={updateLearningStyle}
                    onChange={updateTrainingPreferencesForm}
                    onBack={handleTrainingPreferencesBack}
                    onContinue={handleTrainingPreferencesContinue}
                />
            </>
        );
    }

    function renderCompleted() {
        return (
            <>
                <IntakeHeader
                    step="Complete"
                    stepNumber={8}
                    exitIntake={exitIntake}
                />

                <Paper
                    withBorder
                    p="xl"
                    radius="md"
                >
                    <Center>
                        <Stack align="center" gap="md">
                            <ThemeIcon
                                size={64}
                                radius="xl"
                                color="green"
                            >
                                <IconCheck size={32}/>
                            </ThemeIcon>

                            <Title order={2}>
                                Intake Completed
                            </Title>

                            <Text ta="center" c="dimmed">
                                Thank you for completing your intake.
                            </Text>

                            <Alert
                                color="blue"
                                variant="light"
                            >
                                <Stack gap={20} align="center">
                                    <Text size="sm" ta="center" fw={600}>
                                        Please return the device.
                                    </Text>
                                    <Text size="sm" ta="center">
                                        Your trainer will review your answers with you before beginning an assessment.
                                    </Text>
                                </Stack>
                            </Alert>
                        </Stack>
                    </Center>
                </Paper>

                <Group justify="flex-start" mt="md">
                    <Button
                        variant="default"
                        onClick={() => setCurrentStep(IntakeSteps.TRAINING_PREFERENCES)}
                    >
                        Go Back
                    </Button>
                </Group>
            </>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Utility
    // ------------------------------------------------------------------------------------------------------------------------

    function updateFormField(form, errors, setForm, setErrors, name, value) {
        setForm({
            ...form,
            [name]: value,
        });

        if (errors[name]) {
            const updatedErrors = {...errors};
            delete updatedErrors[name];
            setErrors(updatedErrors);
        }
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
        <>
            {/* Confirm Exit */}
            <Modal
                opened={exitModalOpen}
                onClose={() => setExitModalOpen(false)}
                title="Exit intake?"
                centered
            >
                <Stack gap="lg">
                    <Text visibleFrom="sm" c="dimmed" size={"sm"}>
                        You can return later and continue where you left off.
                    </Text>
                    <Text hiddenFrom="sm" c="dimmed" size={"sm"}>
                        The intake can be resumed later.
                    </Text>

                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            onClick={() => setExitModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            color="red"
                            onClick={exitIntake}
                        >
                            Save & Exit
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Intake */}
            <Container size="md" py="md">
                <Paper
                    pos="relative"
                    p="xl"
                    radius="md"
                    withBorder
                >
                    <LoadingOverlay
                        visible={loading}
                        overlayProps={{blur: 2}}
                    />
                    {currentStep === IntakeSteps.BASIC_INFO && renderBasicInfo()}
                    {currentStep === IntakeSteps.PARQ && renderParq()}
                    {currentStep === IntakeSteps.GOALS && renderGoals()}
                    {currentStep === IntakeSteps.ACTIVITY_HISTORY && renderActivityHistory()}
                    {currentStep === IntakeSteps.MEDICAL && renderMedical()}
                    {currentStep === IntakeSteps.LIFESTYLE && renderLifestyle()}
                    {currentStep === IntakeSteps.TRAINING_PREFERENCES && renderTrainingPreferences()}
                    {currentStep === IntakeSteps.COMPLETED && renderCompleted()}
                </Paper>
            </Container>
        </>
    );
}

export default ClientIntakePage;