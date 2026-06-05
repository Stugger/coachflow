package com.stugger.coachflow.api.dto.response.person;

import com.stugger.coachflow.entity.person.Trainer;

/**
 * @author Jake
 * @since May 27th, 2026
 */
public record TrainerSummaryResponse(
        Long id,
        String firstName,
        String lastName,
        String email
) {
    public TrainerSummaryResponse(Trainer trainer) {
        this(trainer.getId(),
            trainer.getFirstName(),
            trainer.getLastName(),
            trainer.getUser().getEmail()
        );
    }
}