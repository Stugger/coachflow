package com.stugger.coachflow.entity.workout;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since June 29th, 2026
 */
@MappedSuperclass
@Getter
@Setter
public abstract class AbstractWorkoutSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer position;

    @Column
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "section_type", nullable = false, length = 32)
    private WorkoutSectionType sectionType;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}