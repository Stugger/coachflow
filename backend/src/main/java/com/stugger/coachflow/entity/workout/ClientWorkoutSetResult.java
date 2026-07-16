package com.stugger.coachflow.entity.workout;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Stores the actual tracking values recorded for one prescribed set in a client workout.
 *
 * @author Jake
 * @since July 15th, 2026
 */
@Setter
@Getter
@NoArgsConstructor
@Entity
@Table(name = "client_workout_set_results")
public class ClientWorkoutSetResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_workout_id", nullable = false)
    private ClientWorkout clientWorkout;

    /**
     * Populated when the result belongs to a direct exercise item.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_workout_item_id")
    private ClientWorkoutItem clientWorkoutItem;

    /**
     * Populated when the result belongs to an exercise inside a superset, triset, or circuit.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_workout_item_exercise_id")
    private ClientWorkoutItemExercise clientWorkoutItemExercise;

    /**
     * Stable identifier persisted in the exercise's config JSON for the prescribed set represented by this result.
     */
    @Column(name = "set_key", nullable = false, length = 64)
    private String setKey;

    /**
     * Actual tracking values grouped under default, left, or right.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "values_json", nullable = false, columnDefinition = "jsonb")
    private String valuesJson;

    /**
     * Optional trainer note about what occurred while performing this set.
     * This is separate from the prescribed read-only NOTES tracking field.
     */
    @Column(columnDefinition = "TEXT")
    private String notes;

    /**
     * Null while the result is only partially entered and autosaved.
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}