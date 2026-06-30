package com.stugger.coachflow.entity.workout;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Jake
 * @since June 29th, 2026
 */
@Setter
@Getter
@NoArgsConstructor
@Entity
@Table(name = "client_workout_item_exercises")
public class ClientWorkoutItemExercise extends AbstractWorkoutItemExercise {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_workout_item_id", nullable = false)
    private ClientWorkoutItem clientWorkoutItem;

}
