package com.stugger.coachflow.entity.workout;

import com.stugger.coachflow.entity.person.Client;
import com.stugger.coachflow.entity.person.Trainer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Jake
 * @since June 29th, 2026
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "client_workouts")
public class ClientWorkout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trainer_id", nullable = false)
    private Trainer trainer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_workout_template_id")
    private WorkoutTemplate sourceTemplate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ClientWorkoutOrigin origin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ClientWorkoutStatus status;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "clientWorkout", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<ClientWorkoutSection> sections = new ArrayList<>();

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;
}
