package com.stugger.coachflow.api.dto.response.person;

import com.stugger.coachflow.entity.person.Client;
import com.stugger.coachflow.entity.person.ClientGender;

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
        ClientGender gender,
        Boolean archived,
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
            client.getGender(),
            client.getArchived(),
            client.getCreatedAt(),
            client.getUpdatedAt()
        );
    }
}