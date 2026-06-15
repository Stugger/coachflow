package com.stugger.coachflow.api.dto.request.workout;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * @author Jake
 * @since June 15th, 2026
 */
public record WorkoutTemplateItemExerciseRequest(
        Long id,

        @NotNull(message = "Exercise is required")
        Long exerciseId,

        @NotNull(message = "Item exercise position is required")
        @Positive(message = "Item exercise position must be positive")
        Integer position,

        String notes,
        String configJson
) {
}
