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
@Table(name = "client_workout_sections")
public class ClientWorkoutSection extends AbstractWorkoutSection {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_workout_id", nullable = false)
    private ClientWorkout clientWorkout;

    @OneToMany(mappedBy = "clientWorkoutSection", cascade = CascadeType.ALL)
    @OrderBy("position ASC")
    private List<ClientWorkoutItem> items = new ArrayList<>();

}
