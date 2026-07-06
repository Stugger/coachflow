import {
    Box,
    Button,
    Group,
    Stack,
    Text,
    useComputedColorScheme,
} from '@mantine/core';
import {
    IconAsterisk,
    IconList,
    IconPoint,
} from '@tabler/icons-react';

import {
    ACTIVITY_LEVEL_OPTIONS,
    AVERAGE_SLEEP_OPTIONS,
    DAILY_ACTIVITY_LEVEL_OPTIONS,
    DAYS_PER_WEEK_OPTIONS,
    GOAL_OPTIONS,
    LEARNING_STYLE_OPTIONS,
    PARQ_QUESTIONS,
    STRESS_LEVEL_OPTIONS,
    WORKOUT_DAY_OPTIONS,
    WORKOUT_TIME_PREFERENCE_OPTIONS,
    getIntakeOptionLabel,
    getIntakeOptionLabels,
} from '../../intake/intake-step-options.js';

import {normalizeName} from '../../../../utils/text-utils.js';

const sectionStyle = {
    border: '1px solid var(--color-border)',
    borderBottom: 'none',
    borderRadius: 0,
};

const formatBirthDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(`${dateString}T00:00:00`).toLocaleDateString([], options);
};

function IntakeReview({intake, client, onEditBasicInfo}) {

    const computedColorScheme = useComputedColorScheme('light');

    // ------------------------------------------------------------------------------------------------------------------------
    // Shared review UI
    // ------------------------------------------------------------------------------------------------------------------------

    function SectionHeader({name, first = false, onEdit}) {
        return (
            <Box
                style={{
                        background: computedColorScheme === 'light' ? '#f4f5f6' : '#292929',
                        borderBottom: '1px solid var(--color-border)',
                        ...(first ? {
                            borderTopLeftRadius: 'var(--mantine-radius-md)',
                            borderTopRightRadius: 'var(--mantine-radius-md)',
                        } : {})
                    }}
            >
                <Group justify="space-between" wrap="nowrap">
                    <Group gap={4} pl={4}>
                        <IconList color='gray' size={16}/>
                        <Text size="md" pt={2} fw={700}>
                            {name}
                        </Text>
                    </Group>
                    {onEdit ? (
                        <Button variant="transparent" onClick={onEdit}>
                            Edit
                        </Button>
                    ) : (
                        <Button disabled radius="sm" variant="transparent">
                            Edit
                        </Button>
                    )}
                </Group>
            </Box>
        );
    }

    function SectionRow({ label, value = null, urgent = false, prewrap = false }) {
        const hasValue = value !== null && value !== undefined && value !== '';
        return (
            <Group pl={6} gap={4} wrap="nowrap" align="flex-start">
                {hasValue ? (
                    <>
                        {urgent ? (
                            <IconAsterisk size={10} stroke={2.4} color="red" style={{flexShrink: 0, marginTop: '0.3rem'}}/>
                        ) : (
                            <IconPoint size={10} stroke={3.4} style={{flexShrink: 0, marginTop: '0.3rem'}}/>
                        )}
                        <Text size="sm" style={{flex: 1, minWidth: 0}}>
                            <Text span fw={600}>{label}:</Text>{' '}
                            <Text span c="dimmed"
                                  style={{
                                      whiteSpace: prewrap ? 'pre-wrap' : undefined,
                                  }}
                            >
                                {value}
                            </Text>
                        </Text>
                    </>
                ) : (
                    <Text size="sm" pl={4}>{label}</Text>
                )}
            </Group>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderBasicInfo() {
        return (
            <Stack gap="sm" pb="md" radius="md"
                style={{...sectionStyle,
                    borderTopLeftRadius: 'var(--mantine-radius-md)',
                    borderTopRightRadius: 'var(--mantine-radius-md)',
                }}>
                <SectionHeader
                    first
                    name="Basic Information"
                    onEdit={onEditBasicInfo}
                />
                <Stack gap="xs">
                    <SectionRow
                        label="Name"
                        value={`${client.firstName} ${client.lastName}${
                            client.preferredName
                                ? ` (${client.preferredName})`
                                : ''
                        }`}
                    />
                    <SectionRow
                        label="Phone"
                        value={client.phone ?? "—"}
                    />
                    <SectionRow
                        label="Email"
                        value={client.email ?? "—"}
                    />
                    <SectionRow
                        label="DOB"
                        value={client.birthDate ? formatBirthDate(client.birthDate) : "—"}
                    />
                    <SectionRow
                        label="Gender"
                        value={client.gender ? normalizeName(client.gender).replaceAll('_', '-') : "—"}
                    />
                </Stack>
            </Stack>
        );
    }

    function renderParq() {
        const form = intake.parqJson ? JSON.parse(intake.parqJson) : {};

        const positiveQuestions = PARQ_QUESTIONS.filter(question =>
            form[question.field] === true
        );

        return (
            <Stack gap="sm" pb="md" radius="md" style={sectionStyle}>
                <SectionHeader name="PAR-Q"/>

                {positiveQuestions.length === 0 ? (
                    <SectionRow label="No health concerns reported."/>
                ) : (
                    <Stack gap="xs">
                        {positiveQuestions.map(question => {
                            const hasAdditionalNotes =
                                question.field === 'otherMedicalReason'
                                && form.additionalNotes?.trim();

                            return (
                                <SectionRow
                                    key={question.field}
                                    label={question.label}
                                    urgent
                                    prewrap={Boolean(hasAdditionalNotes)}
                                    value={
                                        hasAdditionalNotes ? (
                                            <>
                                                Yes{' '}
                                                <Text span fs="italic">
                                                    ({form.additionalNotes})
                                                </Text>
                                            </>
                                        ) : 'Yes'
                                    }
                                />
                            );
                        })}
                    </Stack>
                )}
            </Stack>
        );
    }

    function renderGoals() {
        const form = intake.goalsJson ? JSON.parse(intake.goalsJson) : {};

        const objectiveLabels = getIntakeOptionLabels(
            GOAL_OPTIONS,
            form.objectives,
        ).filter(label => label !== 'Other');

        const otherGoal = form.otherGoal?.trim();
        const successDescription = form.successDescription?.trim();

        const hasInformation =
            objectiveLabels.length > 0
            || Boolean(otherGoal)
            || Boolean(successDescription);

        return (
            <Stack gap="sm" pb="md" radius="md" style={sectionStyle}>
                <SectionHeader name="Goals"/>

                {!hasInformation ? (
                    <SectionRow label="No goals provided."/>
                ) : (
                    <Stack gap="xs">
                        {objectiveLabels.length > 0 && (
                            <SectionRow
                                label="Primary goals"
                                value={objectiveLabels.join(', ')}
                            />
                        )}

                        {otherGoal && (
                            <SectionRow
                                label="Other goal"
                                value={otherGoal}
                                prewrap
                            />
                        )}

                        {successDescription && (
                            <SectionRow
                                label="Success looks like"
                                value={successDescription}
                                prewrap
                            />
                        )}
                    </Stack>
                )}
            </Stack>
        );
    }

    function renderActivityHistory() {
        const form = intake.activityHistoryJson ? JSON.parse(intake.activityHistoryJson) : {};

        const activityLevel = getIntakeOptionLabel(
            ACTIVITY_LEVEL_OPTIONS,
            form.activityLevel,
        );

        const previousTrainerExperience = form.previousTrainerExperience?.trim();

        const currentRoutine = form.currentRoutine?.trim();

        const hasInformation =
            (form.previousTrainer !== null && form.previousTrainer !== undefined)
            || Boolean(activityLevel)
            || Boolean(previousTrainerExperience)
            || Boolean(currentRoutine);

        return (
            <Stack gap="sm" pb="md" radius="md" style={sectionStyle}>
                <SectionHeader name="Activity History"/>

                {!hasInformation ? (
                    <SectionRow label="No activity history provided."/>
                ) : (
                    <Stack gap="xs">
                        {form.previousTrainer !== null
                            && form.previousTrainer !== undefined && (
                                <SectionRow
                                    label="Worked with a trainer before"
                                    value={form.previousTrainer ? 'Yes' : 'No'}
                                />
                            )}

                        {previousTrainerExperience && (
                            <SectionRow
                                label="Previous trainer experience"
                                value={previousTrainerExperience}
                                prewrap
                            />
                        )}

                        {activityLevel && (
                            <SectionRow
                                label="Current activity level"
                                value={activityLevel}
                            />
                        )}

                        {currentRoutine && (
                            <SectionRow
                                label="Current exercise routine"
                                value={currentRoutine}
                                prewrap
                            />
                        )}
                    </Stack>
                )}
            </Stack>
        );
    }

    function renderMedicalHistory() {
        const form = intake.medicalHistoryJson ? JSON.parse(intake.medicalHistoryJson) : {};

        const medicalConditions = form.medicalConditions?.trim();
        const currentMedications = form.currentMedications?.trim();
        const pastSurgeries = form.pastSurgeries?.trim();
        const injuriesLimitations = form.injuriesLimitations?.trim();

        const hasInformation =
            Boolean(medicalConditions)
            || Boolean(currentMedications)
            || Boolean(pastSurgeries)
            || Boolean(injuriesLimitations);

        return (
            <Stack gap="sm" pb="md" radius="md" style={sectionStyle}>
                <SectionHeader name="Medical History"/>

                {!hasInformation ? (
                    <SectionRow label="No medical information provided."/>
                ) : (
                    <Stack gap="xs">
                        {medicalConditions && (
                            <SectionRow
                                label="Medical conditions"
                                value={medicalConditions}
                                prewrap
                            />
                        )}

                        {currentMedications && (
                            <SectionRow
                                label="Current medications"
                                value={currentMedications}
                                prewrap
                            />
                        )}

                        {pastSurgeries && (
                            <SectionRow
                                label="Past injuries or surgeries"
                                value={pastSurgeries}
                                prewrap
                            />
                        )}

                        {injuriesLimitations && (
                            <SectionRow
                                label="Current injuries or limitations"
                                value={injuriesLimitations}
                                prewrap
                            />
                        )}
                    </Stack>
                )}
            </Stack>
        );
    }

    function renderLifestyle() {
        const form = intake.lifestyleJson ? JSON.parse(intake.lifestyleJson) : {};

        const dailyActivityLevel = getIntakeOptionLabel(
            DAILY_ACTIVITY_LEVEL_OPTIONS,
            form.dailyActivityLevel,
        );

        const averageSleep = getIntakeOptionLabel(
            AVERAGE_SLEEP_OPTIONS,
            form.averageSleep,
        );

        const stressLevel = getIntakeOptionLabel(
            STRESS_LEVEL_OPTIONS,
            form.stressLevel,
        );

        const occupation = form.occupation?.trim();
        const stressSources = form.stressSources?.trim();
        const additionalNotes = form.additionalNotes?.trim();

        const hasInformation =
            Boolean(occupation)
            || Boolean(dailyActivityLevel)
            || Boolean(averageSleep)
            || Boolean(stressLevel)
            || Boolean(stressSources)
            || Boolean(additionalNotes);

        return (
            <Stack gap="sm" pb="md" radius="md" style={sectionStyle}>
                <SectionHeader name="Lifestyle"/>

                {!hasInformation ? (
                    <SectionRow label="No lifestyle information provided."/>
                ) : (
                    <Stack gap="xs">
                        {occupation && (
                            <SectionRow
                                label="Occupation"
                                value={occupation}
                            />
                        )}

                        {dailyActivityLevel && (
                            <SectionRow
                                label="Daily activity level"
                                value={dailyActivityLevel}
                            />
                        )}

                        {averageSleep && (
                            <SectionRow
                                label="Average sleep"
                                value={averageSleep}
                            />
                        )}

                        {stressLevel && (
                            <SectionRow
                                label="Stress level"
                                value={stressLevel}
                            />
                        )}

                        {stressSources && (
                            <SectionRow
                                label="Main stress sources"
                                value={stressSources}
                                prewrap
                            />
                        )}

                        {additionalNotes && (
                            <SectionRow
                                label="Additional lifestyle notes"
                                value={additionalNotes}
                                prewrap
                            />
                        )}
                    </Stack>
                )}
            </Stack>
        );
    }

    function renderTrainingPreferences() {
        const form = intake.trainingPreferencesJson ? JSON.parse(intake.trainingPreferencesJson) : {};

        const daysPerWeek = getIntakeOptionLabel(
            DAYS_PER_WEEK_OPTIONS,
            form.daysPerWeek,
        );

        const workoutTimePreference = getIntakeOptionLabel(
            WORKOUT_TIME_PREFERENCE_OPTIONS,
            form.workoutTimePreference,
        );

        const preferredWorkoutDays = getIntakeOptionLabels(
            WORKOUT_DAY_OPTIONS,
            form.preferredWorkoutDays,
        );

        const learningStyles = getIntakeOptionLabels(
            LEARNING_STYLE_OPTIONS,
            form.learningStyles,
        );

        const exercisesToAvoid = form.exercisesToAvoid?.trim();
        const additionalPreferences = form.additionalPreferences?.trim();

        const hasInformation =
            Boolean(daysPerWeek)
            || Boolean(workoutTimePreference)
            || preferredWorkoutDays.length > 0
            || learningStyles.length > 0
            || Boolean(exercisesToAvoid)
            || Boolean(additionalPreferences);

        return (
            <Stack gap="sm" pb="md" radius="md"
                style={{
                    ...sectionStyle,
                    borderBottom: '1px solid var(--color-border)',
                    borderBottomLeftRadius: 'var(--mantine-radius-md)',
                    borderBottomRightRadius: 'var(--mantine-radius-md)',
                }}>
                <SectionHeader name="Training Preferences"/>

                {!hasInformation ? (
                    <SectionRow label="No training preferences provided."/>
                ) : (
                    <Stack gap="xs">
                        {daysPerWeek && (
                            <SectionRow
                                label="Preferred training frequency"
                                value={`${daysPerWeek} per week`}
                            />
                        )}

                        {workoutTimePreference && (
                            <SectionRow
                                label="Preferred workout time"
                                value={workoutTimePreference}
                            />
                        )}

                        {preferredWorkoutDays.length > 0 && (
                            <SectionRow
                                label="Available days"
                                value={preferredWorkoutDays.join(', ')}
                            />
                        )}

                        {learningStyles.length > 0 && (
                            <SectionRow
                                label="Preferred learning style"
                                value={learningStyles.join(', ')}
                            />
                        )}

                        {exercisesToAvoid && (
                            <SectionRow
                                label="Exercises to avoid"
                                value={exercisesToAvoid}
                                prewrap
                            />
                        )}

                        {additionalPreferences && (
                            <SectionRow
                                label="Additional preferences"
                                value={additionalPreferences}
                                prewrap
                            />
                        )}
                    </Stack>
                )}
            </Stack>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Stack gap={0}>
            {renderBasicInfo()}
            {renderParq()}
            {renderGoals()}
            {renderActivityHistory()}
            {renderMedicalHistory()}
            {renderLifestyle()}
            {renderTrainingPreferences()}
        </Stack>
    );
}

export default IntakeReview;