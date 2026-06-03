package com.stugger.coachflow.api.dto.response.intake;

import com.stugger.coachflow.entity.intake.ClientIntake;
import com.stugger.coachflow.entity.intake.IntakeStatus;
import com.stugger.coachflow.entity.intake.IntakeStep;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since June 3rd, 2026
 */
public record ClientIntakeResponse(
        Long id,
        Long clientId,
        Long trainerId,
        IntakeStatus status,
        IntakeStep currentStep,
        String goalsJson,
        String activityHistoryJson,
        String medicalHistoryJson,
        String lifestyleJson,
        String trainingPreferencesJson,
        String parqJson,
        LocalDateTime startedAt,
        LocalDateTime updatedAt,
        LocalDateTime completedAt
) {
    public ClientIntakeResponse(ClientIntake intake) {
        this(intake.getId(),
            intake.getClient().getId(),
            intake.getTrainer().getId(),
            intake.getStatus(),
            intake.getCurrentStep(),
            intake.getGoalsJson(),
            intake.getActivityHistory(),
            intake.getMedicalHistoryJson(),
            intake.getLifestyleJson(),
            intake.getTrainingPreferencesJson(),
            intake.getParqJson(),
            intake.getStartedAt(),
            intake.getUpdatedAt(),
            intake.getCompletedAt()
        );
    }
}