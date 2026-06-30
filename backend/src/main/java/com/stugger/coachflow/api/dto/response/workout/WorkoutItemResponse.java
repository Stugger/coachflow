package com.stugger.coachflow.api.dto.response.workout;

import com.stugger.coachflow.api.dto.response.exercise.ExerciseResponse;
import com.stugger.coachflow.entity.workout.ClientWorkoutItem;
import com.stugger.coachflow.entity.workout.WorkoutTemplateItem;
import com.stugger.coachflow.entity.workout.WorkoutItemType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Jake
 * @since June 15th, 2026
 */
public record WorkoutItemResponse(
        Long id,
        Integer position,
        WorkoutItemType itemType,
        ExerciseResponse exercise,
        String name,
        Integer rounds,
        String notes,
        String configJson,
        List<WorkoutItemExerciseResponse> itemExercises,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public WorkoutItemResponse(WorkoutTemplateItem item) {
        this(item.getId(),
            item.getPosition(),
            item.getItemType(),
            item.getExercise() == null ? null : new ExerciseResponse(item.getExercise()),
            item.getName(),
            item.getRounds(),
            item.getNotes(),
            item.getConfigJson(),
            item.getItemExercises().stream()
                    .map(WorkoutItemExerciseResponse::new)
                    .toList(),
            item.getCreatedAt(),
            item.getUpdatedAt()
        );
    }

    public WorkoutItemResponse(ClientWorkoutItem item) {
        this(item.getId(),
            item.getPosition(),
            item.getItemType(),
            item.getExercise() == null ? null : new ExerciseResponse(item.getExercise()),
            item.getName(),
            item.getRounds(),
            item.getNotes(),
            item.getConfigJson(),
            item.getItemExercises().stream()
                    .map(WorkoutItemExerciseResponse::new)
                    .toList(),
            item.getCreatedAt(),
            item.getUpdatedAt()
        );
    }
}
