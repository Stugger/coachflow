package com.stugger.coachflow.api.dto.response.workout;

import com.stugger.coachflow.api.dto.response.exercise.ExerciseResponse;
import com.stugger.coachflow.entity.workout.AbstractWorkoutItemExercise;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since June 15th, 2026
 */
public record WorkoutItemExerciseResponse(
        Long id,
        ExerciseResponse exercise,
        Integer position,
        String name,
        String notes,
        String configJson,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public WorkoutItemExerciseResponse(AbstractWorkoutItemExercise itemExercise) {
        this(itemExercise.getId(),
            new ExerciseResponse(itemExercise.getExercise()),
            itemExercise.getPosition(),
            itemExercise.getName(),
            itemExercise.getNotes(),
            itemExercise.getConfigJson(),
            itemExercise.getCreatedAt(),
            itemExercise.getUpdatedAt()
        );
    }
}
