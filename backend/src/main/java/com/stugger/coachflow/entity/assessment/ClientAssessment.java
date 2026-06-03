package com.stugger.coachflow.entity.assessment;

import com.stugger.coachflow.entity.Client;
import com.stugger.coachflow.entity.Trainer;
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
@Table(name = "client_assessments")
public class ClientAssessment {

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
    private AssessmentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AssessmentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_step", length = 64)
    private AssessmentStep currentStep;

    @Column(name = "assessment_date", nullable = false)
    private LocalDateTime assessmentDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "check_in_json", columnDefinition = "jsonb")
    private String checkInJson;

    @Column(name = "trainer_notes", columnDefinition = "TEXT")
    private String trainerNotes;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
