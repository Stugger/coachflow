package com.stugger.coachflow.api.dto.response.workout;

import com.stugger.coachflow.api.dto.response.person.TrainerSummaryResponse;
import com.stugger.coachflow.entity.workout.WorkoutTemplate;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Jake
 * @since June 15th, 2026
 */
public record WorkoutTemplateResponse(
        Long id,
        TrainerSummaryResponse trainer,
        String name,
        String description,
        Boolean archived,
        List<WorkoutSectionResponse> sections,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public WorkoutTemplateResponse(WorkoutTemplate workoutTemplate) {
        this(workoutTemplate.getId(),
            new TrainerSummaryResponse(workoutTemplate.getTrainer()),
            workoutTemplate.getName(),
            workoutTemplate.getDescription(),
            workoutTemplate.getArchived(),
            workoutTemplate.getSections().stream()
                    .map(WorkoutSectionResponse::new)
                    .toList(),
            workoutTemplate.getCreatedAt(),
            workoutTemplate.getUpdatedAt()
        );
    }
}
