package com.stugger.coachflow.repository.workout;

import com.stugger.coachflow.entity.workout.ClientWorkout;
import com.stugger.coachflow.entity.workout.ClientWorkoutOrigin;
import com.stugger.coachflow.entity.workout.ClientWorkoutStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * @author Jake
 * @since June 29th, 2026
 */
public interface ClientWorkoutRepository extends JpaRepository<ClientWorkout, Long> {

    Optional<ClientWorkout> findByIdAndTrainer_Id(Long clientWorkoutId, Long trainerId);

    Optional<ClientWorkout> findFirstByClientIdAndTrainerIdAndStatusAndArchivedAtNull(Long clientId, Long trainerId, ClientWorkoutStatus status);

    Optional<ClientWorkout> findFirstByClientIdAndTrainerIdAndOriginAndArchivedAtNullOrderByUpdatedAtDesc(Long clientId, Long trainerId, ClientWorkoutOrigin origin);

    boolean existsByClientIdAndTrainerIdAndOriginAndArchivedAtNull(Long clientId, Long trainerId, ClientWorkoutOrigin origin);

    @Query("""
        select workout.client.id as clientId, workout.status as status
        from ClientWorkout workout
        where workout.trainer.id = :trainerId
          and workout.client.id in :clientIds
          and workout.origin = :origin
          and workout.archivedAt is null
        """)
    List<ClientWorkoutStatusView> findStatusesByTrainerIdAndClientIdInAndOriginAndArchivedAtNull(
            @Param("trainerId") Long trainerId,
            @Param("clientIds") Collection<Long> clientIds,
            @Param("origin") ClientWorkoutOrigin origin
    );

    @Query("""
        select workout.id as id,
               workout.client.id as clientId,
               workout.name as name,
               workout.origin as origin,
               workout.startedAt as startedAt
        from ClientWorkout workout
        where workout.trainer.id = :trainerId
          and workout.client.id in :clientIds
          and workout.status = :status
          and workout.archivedAt is null
        """)
    List<ActiveClientWorkoutView> findActiveWorkoutsByTrainerAndClients(
            @Param("trainerId") Long trainerId,
            @Param("clientIds") Collection<Long> clientIds,
            @Param("status") ClientWorkoutStatus status
    );

    /**
     * Projection containing a client ID and the client's current workout status.
     * This avoids loading the full workout structure.
     */
    interface ClientWorkoutStatusView {

        Long getClientId();

        ClientWorkoutStatus getStatus();
    }

    /**
     * Projection containing the minimal details required to identify and display
     * a client's currently in-progress workout without loading its full structure.
     */
    interface ActiveClientWorkoutView {

        Long getId();

        Long getClientId();

        String getName();

        ClientWorkoutOrigin getOrigin();

        LocalDateTime getStartedAt();
    }
}