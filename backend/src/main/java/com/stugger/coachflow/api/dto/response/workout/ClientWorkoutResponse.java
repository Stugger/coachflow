package com.stugger.coachflow.api.dto.response.workout;

import com.stugger.coachflow.entity.workout.ClientWorkout;
import com.stugger.coachflow.entity.workout.ClientWorkoutOrigin;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Jake
 * @since June 29th, 2026
 */
public record ClientWorkoutResponse(
        Long id,
        Long clientId,
        Long sourceWorkoutTemplateId,
        ClientWorkoutOrigin origin,
        String name,
        String description,
        List<WorkoutSectionResponse> sections,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime archivedAt
) {

    public ClientWorkoutResponse(ClientWorkout clientWorkout) {
        this(
            clientWorkout.getId(),
            clientWorkout.getClient().getId(),
            clientWorkout.getSourceTemplate() == null
                ? null
                : clientWorkout.getSourceTemplate().getId(),
            clientWorkout.getOrigin(),
            clientWorkout.getName(),
            clientWorkout.getDescription(),
            clientWorkout.getSections().stream()
                .map(WorkoutSectionResponse::new)
                .toList(),
            clientWorkout.getCreatedAt(),
            clientWorkout.getUpdatedAt(),
            clientWorkout.getArchivedAt()
        );
    }
}