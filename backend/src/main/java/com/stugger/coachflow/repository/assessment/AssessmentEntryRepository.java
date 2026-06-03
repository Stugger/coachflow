package com.stugger.coachflow.repository.assessment;

import com.stugger.coachflow.entity.assessment.AssessmentEntry;
import com.stugger.coachflow.entity.assessment.AssessmentEntryCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Jake
 * @since June 2nd, 2026
 */
public interface AssessmentEntryRepository extends JpaRepository<AssessmentEntry, Long> {

    List<AssessmentEntry> findByAssessmentId(Long assessmentId);

    List<AssessmentEntry> findByAssessmentIdAndCategory(Long assessmentId, AssessmentEntryCategory category);

}
