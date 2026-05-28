package com.stugger.coachflow.api.dto.response;

import com.stugger.coachflow.entity.Client;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * @author Jake
 * @since May 27th, 2026
 */
public record ClientResponse(
        Long id,
        UserResponse user,
        TrainerSummaryResponse trainer,
        String firstName,
        String lastName,
        String preferredName,
        String email,
        String phone,
        LocalDate birthDate,
        String goals,
        String limitations,
        String generalNotes,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public ClientResponse(Client client) {
        this(client.getId(),
            client.getUser() == null ? null : new UserResponse(client.getUser()),
            new TrainerSummaryResponse(client.getTrainer()),
            client.getFirstName(),
            client.getLastName(),
            client.getPreferredName(),
            client.getEmail(),
            client.getPhone(),
            client.getBirthDate(),
            client.getGoals(),
            client.getLimitations(),
            client.getGeneralNotes(),
            client.getActive(),
            client.getCreatedAt(),
            client.getUpdatedAt()
        );
    }
}