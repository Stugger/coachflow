package com.stugger.coachflow.api.dto.response.workout;

import com.stugger.coachflow.entity.workout.WorkoutTemplateSection;
import com.stugger.coachflow.entity.workout.WorkoutSectionType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Jake
 * @since June 15th, 2026
 */
public record WorkoutSectionResponse(
        Long id,
        Integer position,
        String name,
        WorkoutSectionType sectionType,
        String notes,
        List<WorkoutItemResponse> items,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public WorkoutSectionResponse(WorkoutTemplateSection section) {
        this(section.getId(),
            section.getPosition(),
            section.getName(),
            section.getSectionType(),
            section.getNotes(),
            section.getItems().stream()
                    .map(WorkoutItemResponse::new)
                    .toList(),
            section.getCreatedAt(),
            section.getUpdatedAt()
        );
    }
}
