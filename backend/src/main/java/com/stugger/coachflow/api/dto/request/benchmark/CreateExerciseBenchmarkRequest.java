package com.stugger.coachflow.api.dto.request.benchmark;

import com.stugger.coachflow.entity.benchmark.ExerciseBenchmarkType;
import com.stugger.coachflow.entity.exercise.ExerciseUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @author Jake
 * @since July 10th, 2026
 */
public record CreateExerciseBenchmarkRequest(
        @NotNull(message = "Exercise is required")
        Long exerciseId,

        @NotNull(message = "Benchmark type is required")
        ExerciseBenchmarkType benchmarkType,

        @NotNull(message = "Benchmark value is required")
        @DecimalMin(value = "0.001", message = "Benchmark value must be greater than zero")
        @Digits(integer = 9, fraction = 3, message = "Benchmark value is too large or has too many decimal places")
        BigDecimal value,

        ExerciseUnit unit,

        @NotNull(message = "Benchmark achievement time is required")
        LocalDateTime achievedAt,

        @Size(max = 2000, message = "Notes must be 2000 characters or fewer")
        String notes
) {
}
