export const YES_NO_OPTIONS = [
    {label: 'Yes', value: 'true'},
    {label: 'No', value: 'false'},
];

export const ACTIVITY_LEVEL_OPTIONS = [
    {value: 'SEDENTARY', label: 'Sedentary'},
    {value: 'LIGHTLY_ACTIVE', label: 'Lightly active'},
    {value: 'MODERATELY_ACTIVE', label: 'Moderately active'},
    {value: 'VERY_ACTIVE', label: 'Very active'},
];

export const GOAL_OPTIONS = [
    {value: 'LOSE_WEIGHT', label: 'Lose weight'},
    {value: 'BUILD_MUSCLE', label: 'Build muscle'},
    {value: 'GET_STRONGER', label: 'Get stronger'},
    {value: 'IMPROVE_ENDURANCE', label: 'Improve endurance'},
    {value: 'IMPROVE_MOBILITY', label: 'Improve mobility / flexibility'},
    {value: 'IMPROVE_HEALTH', label: 'Improve overall health'},
    {value: 'SPORT_PERFORMANCE', label: 'Improve sports performance'},
    {value: 'INCREASE_CONFIDENCE', label: 'Increase confidence in the gym'},
    {value: 'OTHER', label: 'Other'},
];

export const PARQ_QUESTIONS = [
    {
        field: 'heartCondition',
        label: 'Has your doctor ever said that you have a heart condition?',
    },
    {
        field: 'chestPainDuringActivity',
        label: 'Do you feel pain in your chest during physical activity?',
    },
    {
        field: 'chestPainAtRest',
        label: 'Have you experienced chest pain at rest during the last month?',
    },
    {
        field: 'dizzinessOrLossOfBalance',
        label: 'Do you lose balance because of dizziness or lose consciousness?',
    },
    {
        field: 'boneOrJointProblem',
        label: 'Do you have a bone or joint problem that could be made worse by exercise?',
    },
    {
        field: 'bloodPressureMedication',
        label: 'Are you currently prescribed medication for blood pressure or a heart condition?',
    },
    {
        field: 'otherMedicalReason',
        label: 'Is there any other reason you should not participate in physical activity?',
    },
];

export const DAILY_ACTIVITY_LEVEL_OPTIONS = [
    {value: 'MOSTLY_SITTING', label: 'Mostly sitting'},
    {value: 'MOSTLY_STANDING', label: 'Mostly standing'},
    {value: 'MODERATELY_ACTIVE', label: 'Moderately active'},
    {value: 'HIGHLY_ACTIVE', label: 'Highly active'},
];

export const AVERAGE_SLEEP_OPTIONS = [
    {value: 'LESS_THAN_5', label: 'Less than 5 hours'},
    {value: 'FIVE_TO_SIX', label: '5-6 hours'},
    {value: 'SIX_TO_SEVEN', label: '6-7 hours'},
    {value: 'SEVEN_TO_EIGHT', label: '7-8 hours'},
    {value: 'MORE_THAN_8', label: '8+ hours'},
];

export const STRESS_LEVEL_OPTIONS = [
    {value: 'LOW', label: 'Low'},
    {value: 'MODERATE', label: 'Moderate'},
    {value: 'HIGH', label: 'High'},
    {value: 'VERY_HIGH', label: 'Very High'},
];

export const DAYS_PER_WEEK_OPTIONS = [
    {value: '1', label: '1 day'},
    {value: '2', label: '2 days'},
    {value: '3', label: '3 days'},
    {value: '4', label: '4 days'},
    {value: '5', label: '5 days'},
    {value: '6', label: '6 days'},
    {value: '7', label: '7 days'},
];

export const WORKOUT_TIME_PREFERENCE_OPTIONS = [
    {value: 'MORNING', label: 'Morning'},
    {value: 'AFTERNOON', label: 'Afternoon'},
    {value: 'EVENING', label: 'Evening'},
    {value: 'FLEXIBLE', label: 'Flexible'},
];

export const WORKOUT_DAY_OPTIONS = [
    {value: 'MONDAY', label: 'Mon'},
    {value: 'TUESDAY', label: 'Tue'},
    {value: 'WEDNESDAY', label: 'Wed'},
    {value: 'THURSDAY', label: 'Thu'},
    {value: 'FRIDAY', label: 'Fri'},
    {value: 'SATURDAY', label: 'Sat'},
    {value: 'SUNDAY', label: 'Sun'},
];

export const LEARNING_STYLE_OPTIONS = [
    {value: 'VISUAL_DEMONSTRATION', label: 'Visual demonstration'},
    {value: 'VERBAL_EXPLANATION', label: 'Verbal explanation'},
    {value: 'HANDS_ON_CORRECTION', label: 'Hands-on correction'},
    {value: 'WRITTEN_INSTRUCTIONS', label: 'Written instructions'},
    {value: 'NOT_SURE', label: 'Not sure'},
];

export function getIntakeOptionLabel(options, value) {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    return options.find(option => option.value === value)?.label ?? value;
}

export function getIntakeOptionLabels(options, values) {
    return (values ?? [])
        .map(value => getIntakeOptionLabel(options, value))
        .filter(Boolean);
}
