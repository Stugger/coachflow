package com.stugger.coachflow.api.dto.request.intake;

import jakarta.validation.constraints.NotNull;

/**
 * @author Jake
 * @since June 3rd, 2026
 */
public record CreateClientIntakeRequest(
        @NotNull(message = "Trainer is required")
        Long trainerId,

        @NotNull(message = "Client is required")
        Long clientId
) {
}