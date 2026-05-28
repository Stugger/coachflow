package com.stugger.coachflow.api.dto.response;

import com.stugger.coachflow.entity.Trainer;

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
    public TrainerResponse(Trainer trainer) {
        this(trainer.getId(),
            new UserResponse(trainer.getUser()),
            trainer.getFirstName(),
            trainer.getLastName(),
            trainer.getBirthDate(),
            trainer.getCreatedAt(),
            trainer.getUpdatedAt()
        );
    }
}