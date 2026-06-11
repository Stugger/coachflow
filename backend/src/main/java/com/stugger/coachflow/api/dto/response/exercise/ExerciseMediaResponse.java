package com.stugger.coachflow.api.dto.response.exercise;

import com.stugger.coachflow.entity.exercise.ExerciseMedia;
import com.stugger.coachflow.entity.exercise.ExerciseMediaType;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since June 9th, 2026
 */
public record ExerciseMediaResponse(
        Long id,
        Long exerciseId,
        ExerciseMediaType mediaType,
        String url,
        String title,
        Integer sortOrder,
        LocalDateTime createdAt
) {
    public ExerciseMediaResponse(ExerciseMedia media) {
        this(media.getId(),
            media.getExercise().getId(),
            media.getMediaType(),
            media.getUrl(),
            media.getTitle(),
            media.getSortOrder(),
            media.getCreatedAt()
        );
    }
}
