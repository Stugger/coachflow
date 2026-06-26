package com.stugger.coachflow.api.dto.request.workout;

import com.stugger.coachflow.entity.workout.WorkoutTemplateItemType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * @author Jake
 * @since June 15th, 2026
 */
public record WorkoutTemplateItemRequest(
        Long id,

        @NotNull(message = "Item position is required")
        @Positive(message = "Item position must be positive")
        Integer position,

        @NotNull(message = "Item type is required")
        WorkoutTemplateItemType itemType,

        Long exerciseId,

        @Size(max = 255, message = "Item name must be 255 characters or fewer")
        String name,

        @Positive(message = "Rounds must be positive")
        Integer rounds,

        String notes,
        String configJson,

        @Valid
        List<WorkoutTemplateItemExerciseRequest> itemExercises
) {
}
