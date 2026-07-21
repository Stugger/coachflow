package com.stugger.coachflow.api.dto.response.workout;

import com.stugger.coachflow.entity.benchmark.ExerciseBenchmarkBasis;
import com.stugger.coachflow.entity.benchmark.ExerciseBenchmarkType;
import com.stugger.coachflow.entity.exercise.ExerciseUnit;
import com.stugger.coachflow.entity.workout.ClientWorkoutBenchmarkSnapshot;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @author Jake
 * @since July 20th, 2026
 */
public record ClientWorkoutBenchmarkSnapshotResponse(
        Long exerciseId,
        ExerciseBenchmarkType benchmarkType,
        BigDecimal value,
        ExerciseUnit unit,
        ExerciseBenchmarkBasis basis,
        LocalDateTime achievedAt
) {

    public ClientWorkoutBenchmarkSnapshotResponse(ClientWorkoutBenchmarkSnapshot snapshot) {
        this(snapshot.getExercise().getId(),
            snapshot.getBenchmarkType(),
            snapshot.getValue(),
            snapshot.getUnit(),
            snapshot.getBasis(),
            snapshot.getAchievedAt()
        );
    }
}