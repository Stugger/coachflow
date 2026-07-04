package com.stugger.coachflow.repository.workout;

import com.stugger.coachflow.entity.workout.ClientWorkout;
import com.stugger.coachflow.entity.workout.ClientWorkoutOrigin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;

/**
 * @author Jake
 * @since June 29th, 2026
 */
public interface ClientWorkoutRepository extends JpaRepository<ClientWorkout, Long> {

    Optional<ClientWorkout> findByIdAndTrainer_Id(Long clientWorkoutId, Long trainerId);

    Optional<ClientWorkout> findFirstByClientIdAndTrainerIdAndOriginAndArchivedAtNullOrderByUpdatedAtDesc(Long clientId, Long trainerId, ClientWorkoutOrigin origin);

    boolean existsByClientIdAndTrainerIdAndOriginAndArchivedAtNull(Long clientId, Long trainerId, ClientWorkoutOrigin origin);

    @Query("""
        select distinct workout.client.id
        from ClientWorkout workout
        where workout.trainer.id = :trainerId
          and workout.client.id in :clientIds
          and workout.origin = :origin
          and workout.archivedAt is null
        """)
    Set<Long> findClientIdsByTrainerIdAndClientIdInAndOriginAndArchivedAtNull(@Param("trainerId") Long trainerId, @Param("clientIds") Collection<Long> clientIds, @Param("origin") ClientWorkoutOrigin origin);
}
