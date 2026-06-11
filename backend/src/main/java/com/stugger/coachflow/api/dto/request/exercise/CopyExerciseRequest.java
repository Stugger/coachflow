package com.stugger.coachflow.api.dto.request.exercise;

import jakarta.validation.constraints.NotNull;

/**
 * @author Jake
 * @since June 9th, 2026
 */
public record CopyExerciseRequest(
        @NotNull(message = "Trainer is required")
        Long trainerId
) {
}
