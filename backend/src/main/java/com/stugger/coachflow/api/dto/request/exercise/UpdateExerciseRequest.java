package com.stugger.coachflow.api.dto.request.exercise;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @author Jake
 * @since June 9th, 2026
 */
public record UpdateExerciseRequest(
        @NotNull(message = "Trainer is required")
        Long trainerId,

        @NotBlank(message = "Exercise name is required")
        @Size(max = 255, message = "Exercise name must be 255 characters or fewer")
        String name,

        String details,

        String metadataJson
) {
}
