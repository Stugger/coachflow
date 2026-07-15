package com.stugger.coachflow.api.dto.response.person;

import com.stugger.coachflow.api.dto.response.workout.ActiveClientWorkoutResponse;
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
        ClientReviewStatusResponse reviewStatus,
        ActiveClientWorkoutResponse activeWorkout,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public ClientResponse(Client client, ClientReviewStatusResponse reviewStatus, ActiveClientWorkoutResponse activeWorkout) {
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
            reviewStatus,
            activeWorkout,
            client.getCreatedAt(),
            client.getUpdatedAt()
        );
    }
}