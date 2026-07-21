package com.stugger.coachflow.entity.workout;

import com.stugger.coachflow.entity.benchmark.ClientExerciseBenchmark;
import com.stugger.coachflow.entity.benchmark.ExerciseBenchmarkBasis;
import com.stugger.coachflow.entity.benchmark.ExerciseBenchmarkType;
import com.stugger.coachflow.entity.exercise.Exercise;
import com.stugger.coachflow.entity.exercise.ExerciseUnit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Immutable benchmark value used to resolve percentage-based targets for a specific client workout.
 *
 * @author Jake
 * @since July 20th, 2026
 */
@Setter
@Getter
@NoArgsConstructor
@Entity
@Table(
    name = "client_workout_benchmark_snapshots",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_client_workout_benchmark_snapshot",
        columnNames = {"client_workout_id", "exercise_id", "benchmark_type"}
    )
)
public class ClientWorkoutBenchmarkSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_workout_id", nullable = false)
    private ClientWorkout clientWorkout;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_benchmark_id")
    private ClientExerciseBenchmark sourceBenchmark;

    @Enumerated(EnumType.STRING)
    @Column(name = "benchmark_type", nullable = false, length = 64)
    private ExerciseBenchmarkType benchmarkType;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal value;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private ExerciseUnit unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ExerciseBenchmarkBasis basis;

    @Column(name = "achieved_at", nullable = false)
    private LocalDateTime achievedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}