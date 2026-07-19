package com.stugger.coachflow.repository.workout;

import com.stugger.coachflow.entity.workout.ClientWorkoutSetResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * @author Jake
 * @since July 15th, 2026
 */
public interface ClientWorkoutSetResultRepository extends JpaRepository<ClientWorkoutSetResult, Long> {

    List<ClientWorkoutSetResult> findAllByClientWorkout_Id(Long clientWorkoutId);

    Optional<ClientWorkoutSetResult> findByClientWorkout_IdAndClientWorkoutItem_IdAndSetKey(Long clientWorkoutId, Long clientWorkoutItemId, String setKey);

    Optional<ClientWorkoutSetResult> findByClientWorkout_IdAndClientWorkoutItemExercise_IdAndSetKey(Long clientWorkoutId, Long clientWorkoutItemExerciseId, String setKey);

    @Modifying
    @Query("""
        delete from ClientWorkoutSetResult result
        where result.clientWorkout.id = :clientWorkoutId
        """)
    int deleteAllByClientWorkoutId(@Param("clientWorkoutId") Long clientWorkoutId);

    boolean existsByClientWorkoutItem_IdAndCompletedAtIsNotNull(Long clientWorkoutItemId);

    boolean existsByClientWorkoutItemExercise_IdAndCompletedAtIsNotNull(Long clientWorkoutItemExerciseId);

    boolean existsByClientWorkoutItemExercise_ClientWorkoutItem_IdAndCompletedAtIsNotNull(Long clientWorkoutItemId);
}