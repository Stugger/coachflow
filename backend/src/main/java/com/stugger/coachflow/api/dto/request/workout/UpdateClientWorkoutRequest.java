package com.stugger.coachflow.api.dto.request.workout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * @author Jake
 * @since June 29th, 2026
 */
public record UpdateClientWorkoutRequest(
        @NotBlank(message = "Client workout name is required")
        @Size(max = 255, message = "Client workout name must be 255 characters or fewer")
        String name,

        String description,

        @Valid
        List<WorkoutSectionRequest> sections
) {
}