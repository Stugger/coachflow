package com.stugger.coachflow.repository.workout;

import com.stugger.coachflow.entity.workout.ClientWorkoutBenchmarkSnapshot;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * @author Jake
 * @since July 20th, 2026
 */
public interface ClientWorkoutBenchmarkSnapshotRepository extends JpaRepository<ClientWorkoutBenchmarkSnapshot, Long> {

    @EntityGraph(attributePaths = "exercise")
    List<ClientWorkoutBenchmarkSnapshot> findAllByClientWorkout_Id(Long clientWorkoutId);

    @Modifying
    @Query("""
        delete from ClientWorkoutBenchmarkSnapshot snapshot
        where snapshot.clientWorkout.id = :clientWorkoutId
        """)
    int deleteAllByClientWorkoutId(@Param("clientWorkoutId") Long clientWorkoutId);
}