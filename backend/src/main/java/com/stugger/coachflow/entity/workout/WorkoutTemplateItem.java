package com.stugger.coachflow.entity.workout;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Jake
 * @since June 15th, 2026
 */
@Setter
@Getter
@NoArgsConstructor
@Entity
@Table(name = "workout_template_items")
public class WorkoutTemplateItem extends AbstractWorkoutItem {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_template_section_id", nullable = false)
    private WorkoutTemplateSection workoutTemplateSection;

    @OneToMany(mappedBy = "workoutTemplateItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<WorkoutTemplateItemExercise> itemExercises = new ArrayList<>();

}
