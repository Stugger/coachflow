package com.stugger.coachflow.entity.benchmark;

import com.stugger.coachflow.entity.exercise.Exercise;
import com.stugger.coachflow.entity.exercise.ExerciseUnit;
import com.stugger.coachflow.entity.person.Client;
import com.stugger.coachflow.entity.person.Trainer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @author Jake
 * @since July 10th, 2026
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "client_exercise_benchmarks")
public class ClientExerciseBenchmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trainer_id", nullable = false)
    private Trainer trainer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

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

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
