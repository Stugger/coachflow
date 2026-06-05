package com.stugger.coachflow.entity.intake;

import com.stugger.coachflow.entity.person.Client;
import com.stugger.coachflow.entity.person.Trainer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "current_step", length = 64)
    private IntakeStep currentStep;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "goals_json", columnDefinition = "jsonb")
    private String goalsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "activity_history_json", columnDefinition = "jsonb")
    private String activityHistoryJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "medical_history_json", columnDefinition = "jsonb")
    private String medicalHistoryJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "lifestyle_json", columnDefinition = "jsonb")
    private String lifestyleJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "training_preferences_json", columnDefinition = "jsonb")
    private String trainingPreferencesJson;

    @JdbcTypeCode(SqlTypes.JSON)
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
