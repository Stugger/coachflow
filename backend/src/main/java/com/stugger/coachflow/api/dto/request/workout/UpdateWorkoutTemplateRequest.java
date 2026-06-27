package com.stugger.coachflow.api.dto.request.workout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * @author Jake
 * @since June 15th, 2026
 */
public record UpdateWorkoutTemplateRequest(
        @NotBlank(message = "Workout template name is required")
        @Size(max = 255, message = "Workout template name must be 255 characters or fewer")
        String name,

        String description,

        @Valid
        List<WorkoutTemplateSectionRequest> sections
) {
}
