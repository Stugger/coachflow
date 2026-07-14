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
@Table(name = "workout_template_sections")
public class WorkoutTemplateSection extends AbstractWorkoutSection {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_template_id", nullable = false)
    private WorkoutTemplate workoutTemplate;

    @OneToMany(mappedBy = "workoutTemplateSection", cascade = CascadeType.ALL)
    @OrderBy("position ASC")
    private List<WorkoutTemplateItem> items = new ArrayList<>();

}