package com.stugger.coachflow.api.dto.response.workout;

import com.stugger.coachflow.entity.workout.ClientWorkoutSetResult;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since July 15th, 2026
 */
public record ClientWorkoutSetResultResponse(
        Long id,
        Long clientWorkoutItemId,
        Long clientWorkoutItemExerciseId,
        String setKey,
        String valuesJson,
        String notes,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public ClientWorkoutSetResultResponse(ClientWorkoutSetResult result) {
        this(result.getId(),
            result.getClientWorkoutItem() == null ? null : result.getClientWorkoutItem().getId(),
            result.getClientWorkoutItemExercise() == null ? null : result.getClientWorkoutItemExercise().getId(),
            result.getSetKey(),
            result.getValuesJson(),
            result.getNotes(),
            result.getCompletedAt(),
            result.getCreatedAt(),
            result.getUpdatedAt()
        );
    }
}