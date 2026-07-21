package com.stugger.coachflow.api.dto.response.workout;

import com.stugger.coachflow.entity.workout.ClientWorkout;
import com.stugger.coachflow.entity.workout.ClientWorkoutBenchmarkSnapshot;
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
        List<ClientWorkoutSetResultResponse> results,
        List<ClientWorkoutBenchmarkSnapshotResponse> benchmarks
) {

    public ClientWorkoutSessionResponse(ClientWorkout workout, List<ClientWorkoutSetResult> results, List<ClientWorkoutBenchmarkSnapshot> benchmarks) {
        this(new ClientWorkoutResponse(workout),
            results.stream()
                .map(ClientWorkoutSetResultResponse::new)
                .toList(),
            benchmarks.stream()
                .map(ClientWorkoutBenchmarkSnapshotResponse::new)
                .toList()
        );
    }
}