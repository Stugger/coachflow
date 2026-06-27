package com.stugger.coachflow.repository.exercise;

import com.stugger.coachflow.entity.exercise.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * @author Jake
 * @since June 9th, 2026
 */
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    Optional<Exercise> findByIdAndTrainer_Id(Long exerciseId, Long trainerId);

    @Query("""
            SELECT exercise
            FROM Exercise exercise
            WHERE exercise.archived = false
              AND (
                    exercise.visibility = com.stugger.coachflow.entity.exercise.ExerciseVisibility.GLOBAL
                    OR exercise.trainer.id = :trainerId
                  )
            ORDER BY LOWER(exercise.name) ASC
            """)
    List<Exercise> findAvailableForTrainer(@Param("trainerId") Long trainerId);

}
