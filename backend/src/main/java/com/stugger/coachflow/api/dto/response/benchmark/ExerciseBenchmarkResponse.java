package com.stugger.coachflow.api.dto.response.benchmark;

import com.stugger.coachflow.api.dto.response.exercise.ExerciseResponse;
import com.stugger.coachflow.entity.benchmark.ClientExerciseBenchmark;
import com.stugger.coachflow.entity.benchmark.ExerciseBenchmarkBasis;
import com.stugger.coachflow.entity.benchmark.ExerciseBenchmarkType;
import com.stugger.coachflow.entity.exercise.ExerciseUnit;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @author Jake
 * @since July 10th, 2026
 */
public record ExerciseBenchmarkResponse(
        Long id,
        Long clientId,
        ExerciseResponse exercise,
        ExerciseBenchmarkType benchmarkType,
        BigDecimal value,
        ExerciseUnit unit,
        ExerciseBenchmarkBasis basis,
        LocalDateTime achievedAt,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public ExerciseBenchmarkResponse(ClientExerciseBenchmark benchmark) {
        this(
                benchmark.getId(),
                benchmark.getClient().getId(),
                new ExerciseResponse(benchmark.getExercise()),
                benchmark.getBenchmarkType(),
                benchmark.getValue(),
                benchmark.getUnit(),
                benchmark.getBasis(),
                benchmark.getAchievedAt(),
                benchmark.getNotes(),
                benchmark.getCreatedAt(),
                benchmark.getUpdatedAt()
        );
    }
}
