package com.stugger.coachflow.api.dto.request.exercise;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @author Jake
 * @since June 9th, 2026
 */
public record UpdateExerciseRequest(
        @NotBlank(message = "Exercise name is required")
        @Size(max = 255, message = "Exercise name must be 255 characters or fewer")
        String name,

        String details,

        String thumbnailUrl,
        String demoVideoUrl,

        String metadataJson
) {
}
