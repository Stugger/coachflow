package com.stugger.coachflow.api.dto.response.workout;

import com.stugger.coachflow.entity.workout.ClientWorkoutOrigin;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since July 14th, 2026
 */
public record ActiveClientWorkoutResponse(
        Long id,
        String name,
        ClientWorkoutOrigin origin,
        LocalDateTime startedAt
) {
}