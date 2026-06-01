package com.stugger.coachflow.api.dto.response;

import com.stugger.coachflow.entity.Appointment;
import com.stugger.coachflow.entity.AppointmentStatus;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since June 1st, 2026
 */
public record AppointmentResponse(
        Long id,
        Long trainerId,
        Long clientId,
        String clientName,
        String title,
        LocalDateTime startTime,
        LocalDateTime endTime,
        AppointmentStatus status,
        String notes
) {

    public AppointmentResponse(Appointment appointment) {
        this(appointment.getId(),
            appointment.getTrainer().getId(),
            appointment.getClient().getId(),
            appointment.getClient().getFirstName() + " " + appointment.getClient().getLastName(),
            appointment.getTitle(),
            appointment.getStartTime(),
            appointment.getEndTime(),
            appointment.getStatus(),
            appointment.getNotes()
        );
    }
}