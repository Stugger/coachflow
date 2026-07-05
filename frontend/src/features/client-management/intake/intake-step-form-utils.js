import {PARQ_QUESTIONS} from './intake-step-options.js';

// ------------------------------------------------------------------------------------------------------------------------
// PARQ
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

    PARQ_QUESTIONS.forEach(({field}) => {
        if (form[field] === null) {
            errors[field] = 'Required';
        }
    });

    if (form.otherMedicalReason && !form.additionalNotes.trim()) {
        errors.additionalNotes = 'Explanation required';
    }

    return errors;
}

// ------------------------------------------------------------------------------------------------------------------------
// Goals
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyGoalsForm() {
    return {
        objectives: [],
        otherGoal: '',
        successDescription: '',
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
// Activity History
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyActivityHistoryForm() {
    return {
        previousTrainer: null,
        previousTrainerExperience: '',
        activityLevel: '',
        currentRoutine: '',
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
// Medical History
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyMedicalHistoryForm() {
    return {
        medicalConditions: '',
        currentMedications: '',
        pastSurgeries: '',
        injuriesLimitations: '',
    };
}

// ------------------------------------------------------------------------------------------------------------------------
// Lifestyle
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyLifestyleForm() {
    return {
        occupation: '',
        dailyActivityLevel: '',
        averageSleep: '',
        stressLevel: '',
        stressSources: '',
        additionalNotes: '',
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
// Training Preferences
// ------------------------------------------------------------------------------------------------------------------------

export function createEmptyTrainingPreferencesForm() {
    return {
        daysPerWeek: '',
        workoutTimePreference: '',
        preferredWorkoutDays: [],
        learningStyles: [],
        exercisesToAvoid: '',
        additionalPreferences: '',
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
