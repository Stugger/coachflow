package com.stugger.coachflow.repository.exercise;

import com.stugger.coachflow.entity.exercise.ExerciseMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Jake
 * @since June 9th, 2026
 */
public interface ExerciseMediaRepository extends JpaRepository<ExerciseMedia, Long> {

    List<ExerciseMedia> findByExerciseIdOrderBySortOrderAscIdAsc(Long exerciseId);
}
