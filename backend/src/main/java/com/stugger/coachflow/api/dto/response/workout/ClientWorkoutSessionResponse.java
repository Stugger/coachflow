package com.stugger.coachflow.api.dto.response.workout;

import com.stugger.coachflow.entity.workout.ClientWorkout;
import com.stugger.coachflow.entity.workout.ClientWorkoutSetResult;

import java.util.List;

/**
 * Complete data required to display an in-progress workout session or
 * completed workout record.
 *
 * @author Jake
 * @since July 15th, 2026
 */
public record ClientWorkoutSessionResponse(
        ClientWorkoutResponse workout,
        List<ClientWorkoutSetResultResponse> results
) {

    public ClientWorkoutSessionResponse(ClientWorkout workout, List<ClientWorkoutSetResult> results) {
        this(new ClientWorkoutResponse(workout),
            results.stream()
                .map(ClientWorkoutSetResultResponse::new)
                .toList()
        );
    }
}