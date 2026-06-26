package com.stugger.coachflow.api.dto.request.workout;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

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

        @Size(max = 255, message = "Item exercise name must be 255 characters or fewer")
        String name,

        String notes,
        String configJson
) {
}
