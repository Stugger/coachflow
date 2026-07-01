package com.stugger.coachflow.repository.workout;

import com.stugger.coachflow.entity.workout.ClientWorkout;
import com.stugger.coachflow.entity.workout.ClientWorkoutOrigin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * @author Jake
 * @since June 29th, 2026
 */
public interface ClientWorkoutRepository extends JpaRepository<ClientWorkout, Long> {

    Optional<ClientWorkout> findByIdAndTrainer_Id(Long clientWorkoutId, Long trainerId);

    Optional<ClientWorkout> findFirstByClientIdAndTrainerIdAndOriginAndArchivedAtNullOrderByUpdatedAtDesc(Long clientId, Long trainerId, ClientWorkoutOrigin origin);

    boolean existsByClientIdAndTrainerIdAndOriginAndArchivedAtNull(Long clientId, Long trainerId, ClientWorkoutOrigin origin);

}
