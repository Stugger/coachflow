package com.stugger.coachflow.api.dto.request;

import java.time.LocalDate;

/**
 * @author Jake
 * @since May 27th, 2026
 */
public record CreateClientRequest(
        Long trainerId,
        String firstName,
        String lastName,
        String preferredName,
        String email,
        String phone,
        LocalDate birthDate,
        String goals,
        String limitations,
        String generalNotes
) {
}