package com.stugger.coachflow.api.dto.request;

import com.stugger.coachflow.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since June 1st, 2026
 */
public record UpdateAppointmentRequest(
        @NotNull(message = "Client is required")
        Long clientId,

        String title,

        @NotNull(message = "Start time is required")
        LocalDateTime startTime,

        @NotNull(message = "End time is required")
        LocalDateTime endTime,

        @NotNull(message = "Status is required")
        AppointmentStatus status,

        String notes
) {
}