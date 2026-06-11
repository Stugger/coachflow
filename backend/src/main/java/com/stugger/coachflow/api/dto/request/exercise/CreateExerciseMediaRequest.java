package com.stugger.coachflow.api.dto.request.exercise;

import com.stugger.coachflow.entity.exercise.ExerciseMediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * @author Jake
 * @since June 9th, 2026
 */
public record CreateExerciseMediaRequest(
        @NotNull(message = "Trainer is required")
        Long trainerId,

        @NotNull(message = "Media type is required")
        ExerciseMediaType mediaType,

        @NotBlank(message = "Media URL is required")
        String url,

        @Size(max = 255, message = "Media title must be 255 characters or fewer")
        String title,

        Integer sortOrder
) {
}
