package com.stugger.coachflow.repository.assessment;

import com.stugger.coachflow.entity.assessment.AssessmentType;
import com.stugger.coachflow.entity.assessment.ClientAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Jake
 * @since June 2nd, 2026
 */
public interface ClientAssessmentRepository extends JpaRepository<ClientAssessment, Long> {

    List<ClientAssessment> findByClientId(Long clientId);

    List<ClientAssessment> findByTrainerId(Long trainerId);

    List<ClientAssessment> findByClientIdAndType(Long clientId, AssessmentType type);

}
