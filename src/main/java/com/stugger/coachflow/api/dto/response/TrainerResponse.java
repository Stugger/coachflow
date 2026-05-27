package com.stugger.coachflow.api.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * @author Jake
 * @since May 27th, 2026
 */
public record TrainerResponse(
        Long id,
        UserResponse user,
        String firstName,
        String lastName,
        LocalDate birthDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}