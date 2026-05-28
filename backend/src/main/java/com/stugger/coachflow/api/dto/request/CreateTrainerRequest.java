package com.stugger.coachflow.api.dto.request;

import java.time.LocalDate;

/**
 * @author Jake
 * @since May 27th, 2026
 */
public record CreateTrainerRequest(
        String firstName,
        String lastName,
        LocalDate birthDate,
        String email,
        String password
) {
}