package com.stugger.coachflow.repository.intake;

import com.stugger.coachflow.entity.intake.ClientIntake;
import com.stugger.coachflow.entity.intake.IntakeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author Jake
 * @since June 2nd, 2026
 */
public interface ClientIntakeRepository extends JpaRepository<ClientIntake, Long> {

    Optional<ClientIntake> findByIdAndTrainer_Id(Long intakeId, Long trainerId);

    List<ClientIntake> findByTrainerId(Long trainerId);

    List<ClientIntake> findByClient_IdAndTrainer_Id(Long clientId, Long trainerId);

    List<ClientIntake> findByClient_IdAndTrainer_IdAndStatus(Long clientId, Long trainerId, IntakeStatus status);

}
