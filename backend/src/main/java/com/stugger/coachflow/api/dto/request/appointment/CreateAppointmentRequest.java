package com.stugger.coachflow.api.dto.request.appointment;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since June 1st, 2026
 */
public record CreateAppointmentRequest(
        @NotNull(message = "Trainer is required")
        Long trainerId,

        @NotNull(message = "Client is required")
        Long clientId,

        String title,

        @NotNull(message = "Start time is required")
        LocalDateTime startTime,

        @NotNull(message = "End time is required")
        LocalDateTime endTime,

        String notes
) {
}