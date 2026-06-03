package com.stugger.coachflow.repository.intake;

import com.stugger.coachflow.entity.intake.ClientIntake;
import com.stugger.coachflow.entity.intake.IntakeStatus;
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
