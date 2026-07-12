package com.stugger.coachflow.repository.benchmark;

import com.stugger.coachflow.entity.benchmark.ClientExerciseBenchmark;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * @author Jake
 * @since July 10th, 2026
 */
public interface ClientExerciseBenchmarkRepository extends JpaRepository<ClientExerciseBenchmark, Long> {

    @EntityGraph(attributePaths = "exercise")
    List<ClientExerciseBenchmark> findAllByClient_IdAndTrainer_IdOrderByExercise_NameAsc(Long clientId, Long trainerId);

    @EntityGraph(attributePaths = "exercise")
    List<ClientExerciseBenchmark> findAllByClient_IdAndTrainer_IdAndExercise_IdInOrderByExercise_NameAsc(Long clientId, Long trainerId, Collection<Long> exerciseIds);

    @EntityGraph(attributePaths = "exercise")
    Optional<ClientExerciseBenchmark> findByIdAndClient_IdAndTrainer_Id(Long benchmarkId, Long clientId, Long trainerId);

    @Query(value = """
            SELECT DISTINCT ON (benchmark.exercise_id, benchmark.benchmark_type) benchmark.*
            FROM client_exercise_benchmarks benchmark
            WHERE benchmark.client_id = :clientId
              AND benchmark.trainer_id = :trainerId
            ORDER BY
                benchmark.exercise_id,
                benchmark.benchmark_type,
                benchmark.achieved_at DESC,
                benchmark.created_at DESC,
                benchmark.id DESC
            """, nativeQuery = true)
    List<ClientExerciseBenchmark> findLatestForClient(Long clientId, Long trainerId);

    @Query(value = """
            SELECT DISTINCT ON (benchmark.exercise_id, benchmark.benchmark_type) benchmark.*
            FROM client_exercise_benchmarks benchmark
            WHERE benchmark.client_id = :clientId
              AND benchmark.trainer_id = :trainerId
              AND benchmark.exercise_id IN (:exerciseIds)
            ORDER BY
                benchmark.exercise_id,
                benchmark.benchmark_type,
                benchmark.achieved_at DESC,
                benchmark.created_at DESC,
                benchmark.id DESC
            """, nativeQuery = true)
    List<ClientExerciseBenchmark> findLatestForClientAndExercises(Long clientId, Long trainerId, Collection<Long> exerciseIds);
}
