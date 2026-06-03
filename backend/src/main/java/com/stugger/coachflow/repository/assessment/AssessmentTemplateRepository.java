package com.stugger.coachflow.repository.assessment;

import com.stugger.coachflow.entity.assessment.AssessmentTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author Jake
 * @since June 2nd, 2026
 */
public interface AssessmentTemplateRepository extends JpaRepository<AssessmentTemplate, Long> {

    List<AssessmentTemplate> findByTrainerId(Long trainerId);

    Optional<AssessmentTemplate> findByTrainerIdAndDefaultTemplateTrueAndArchivedFalse(Long trainerId);

}
