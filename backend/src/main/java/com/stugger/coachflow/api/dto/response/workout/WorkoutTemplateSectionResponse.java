package com.stugger.coachflow.api.dto.response.workout;

import com.stugger.coachflow.entity.workout.WorkoutTemplateSection;
import com.stugger.coachflow.entity.workout.WorkoutTemplateSectionType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Jake
 * @since June 15th, 2026
 */
public record WorkoutTemplateSectionResponse(
        Long id,
        Integer position,
        String name,
        WorkoutTemplateSectionType sectionType,
        String notes,
        List<WorkoutTemplateItemResponse> items,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public WorkoutTemplateSectionResponse(WorkoutTemplateSection section) {
        this(section.getId(),
            section.getPosition(),
            section.getName(),
            section.getSectionType(),
            section.getNotes(),
            section.getItems().stream()
                    .map(WorkoutTemplateItemResponse::new)
                    .toList(),
            section.getCreatedAt(),
            section.getUpdatedAt()
        );
    }
}
