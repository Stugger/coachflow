package com.stugger.coachflow.entity.assessment;

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
@Table(name = "assessment_template_entries")
public class AssessmentTemplateEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "template_id", nullable = false)
    private AssessmentTemplate template;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AssessmentEntryCategory category;

    @Column(nullable = false)
    private String label;

    @Column(length = 64)
    private String unit;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "metadata_json", columnDefinition = "jsonb")
    private String metadataJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
