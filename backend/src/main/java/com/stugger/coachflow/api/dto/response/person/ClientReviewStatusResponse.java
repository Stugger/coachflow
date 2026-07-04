package com.stugger.coachflow.api.dto.response.person;

/**
 * @author Jake
 * @since July 2nd, 2026
 */
public record ClientReviewStatusResponse(
        IntakeReviewStatus intakeStatus,
        Long inProgressIntakeId,
        InitialAssessmentReviewStatus initialAssessmentStatus
) {
}