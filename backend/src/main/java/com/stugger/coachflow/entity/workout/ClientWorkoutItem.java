package com.stugger.coachflow.entity.workout;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Jake
 * @since June 29th, 2026
 */
@Setter
@Getter
@NoArgsConstructor
@Entity
@Table(name = "client_workout_items")
public class ClientWorkoutItem extends AbstractWorkoutItem{

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_workout_section_id", nullable = false)
    private ClientWorkoutSection clientWorkoutSection;

    @OneToMany(mappedBy = "clientWorkoutItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<ClientWorkoutItemExercise> itemExercises = new ArrayList<>();

}
