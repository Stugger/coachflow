package com.stugger.coachflow.api.dto.response.exercise;

import com.stugger.coachflow.api.dto.response.person.TrainerSummaryResponse;
import com.stugger.coachflow.entity.exercise.Exercise;
import com.stugger.coachflow.entity.exercise.ExerciseVisibility;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since June 9th, 2026
 */
public record ExerciseResponse(
        Long id,
        TrainerSummaryResponse trainer,
        ExerciseVisibility visibility,
        String name,
        String details,
        String metadataJson,
        Boolean archived,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public ExerciseResponse(Exercise exercise) {
        this(exercise.getId(),
            exercise.getTrainer() == null ? null : new TrainerSummaryResponse(exercise.getTrainer()),
            exercise.getVisibility(),
            exercise.getName(),
            exercise.getDetails(),
            exercise.getMetadataJson(),
            exercise.getArchived(),
            exercise.getCreatedAt(),
            exercise.getUpdatedAt()
        );
    }
}
