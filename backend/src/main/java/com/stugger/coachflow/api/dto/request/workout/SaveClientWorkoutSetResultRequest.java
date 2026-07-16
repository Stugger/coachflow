package com.stugger.coachflow.api.dto.request.workout;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @author Jake
 * @since July 16th, 2026
 */
public record SaveClientWorkoutSetResultRequest(
        Long clientWorkoutItemId,
        Long clientWorkoutItemExerciseId,

        @NotBlank
        @Size(max = 64)
        String setKey,

        String valuesJson,

        String notes,

        boolean completed
) {
}