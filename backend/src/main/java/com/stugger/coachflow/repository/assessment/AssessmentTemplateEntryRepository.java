package com.stugger.coachflow.repository.assessment;

import com.stugger.coachflow.entity.assessment.AssessmentEntryCategory;
import com.stugger.coachflow.entity.assessment.AssessmentTemplateEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Jake
 * @since June 2nd, 2026
 */
public interface AssessmentTemplateEntryRepository extends JpaRepository<AssessmentTemplateEntry, Long> {

    List<AssessmentTemplateEntry> findByTemplateId(Long templateId);

    List<AssessmentTemplateEntry> findByTemplateIdAndCategory(Long templateId, AssessmentEntryCategory category);

}
