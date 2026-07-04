package com.stugger.coachflow.entity.workout;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Jake
 * @since June 15th, 2026
 */
@Setter
@Getter
@NoArgsConstructor
@Entity
@Table(name = "workout_template_item_exercises")
public class WorkoutTemplateItemExercise extends AbstractWorkoutItemExercise {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_template_item_id", nullable = false)
    private WorkoutTemplateItem workoutTemplateItem;

}
