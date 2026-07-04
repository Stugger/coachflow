package com.stugger.coachflow.api.dto.request.workout;

import com.stugger.coachflow.entity.workout.WorkoutSectionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * @author Jake
 * @since June 15th, 2026
 */
public record WorkoutSectionRequest(
        Long id,

        @NotNull(message = "Section position is required")
        @Positive(message = "Section position must be positive")
        Integer position,

        @Size(max = 255, message = "Section name must be 255 characters or fewer")
        String name,

        @NotNull(message = "Section type is required") WorkoutSectionType sectionType,

        String notes,

        @Valid
        List<WorkoutItemRequest> items
) {
}
