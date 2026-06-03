package com.stugger.coachflow.api.dto.request.intake;

import jakarta.validation.constraints.NotBlank;

/**
 * @author Jake
 * @since June 3rd, 2026
 */
public record UpdateIntakeJsonRequest(
        @NotBlank String json
) {
}