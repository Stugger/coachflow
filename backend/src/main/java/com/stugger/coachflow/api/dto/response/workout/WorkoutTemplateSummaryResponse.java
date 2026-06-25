package com.stugger.coachflow.api.dto.response.workout;

import com.stugger.coachflow.entity.workout.WorkoutTemplate;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Jake
 * @since June 25th, 2026
 */
public record WorkoutTemplateSummaryResponse(
    Long id,
    String name,
    List<String> exerciseNames,
    int exerciseCount,
    LocalDateTime updatedAt
) {
    public WorkoutTemplateSummaryResponse(WorkoutTemplate template, List<String> exerciseNames, int totalExercises) {
        this(template.getId(),
            template.getName(),
            exerciseNames,
            totalExercises,
            template.getUpdatedAt()
        );
    }
}