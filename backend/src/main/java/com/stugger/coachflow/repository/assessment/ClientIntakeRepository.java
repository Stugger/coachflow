package com.stugger.coachflow.repository.assessment;

import com.stugger.coachflow.entity.assessment.ClientIntake;
import com.stugger.coachflow.entity.assessment.IntakeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Jake
 * @since June 2nd, 2026
 */
public interface ClientIntakeRepository extends JpaRepository<ClientIntake, Long> {

    List<ClientIntake> findByClientId(Long clientId);

    List<ClientIntake> findByTrainerId(Long trainerId);

    List<ClientIntake> findByClientIdAndStatus(Long clientId, IntakeStatus status);

}
