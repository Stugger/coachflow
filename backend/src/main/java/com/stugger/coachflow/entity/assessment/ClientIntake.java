package com.stugger.coachflow.entity.assessment;

import com.stugger.coachflow.entity.Client;
import com.stugger.coachflow.entity.Trainer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since June 2nd, 2026
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "client_intakes")
public class ClientIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(optional = false)
    @JoinColumn(name = "trainer_id", nullable = false)
    private Trainer trainer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private IntakeStatus status;

    @Column(name = "current_step", length = 64)
    private String currentStep;

    @Column(name = "goals_json", columnDefinition = "jsonb")
    private String goalsJson;

    @Column(name = "training_history_json", columnDefinition = "jsonb")
    private String trainingHistoryJson;

    @Column(name = "medical_history_json", columnDefinition = "jsonb")
    private String medicalHistoryJson;

    @Column(name = "injuries_limitations_json", columnDefinition = "jsonb")
    private String injuriesLimitationsJson;

    @Column(name = "lifestyle_json", columnDefinition = "jsonb")
    private String lifestyleJson;

    @Column(name = "preferences_json", columnDefinition = "jsonb")
    private String preferencesJson;

    @Column(name = "parq_json", columnDefinition = "jsonb")
    private String parqJson;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
