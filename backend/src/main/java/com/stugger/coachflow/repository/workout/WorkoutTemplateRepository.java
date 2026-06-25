package com.stugger.coachflow.repository.workout;

import com.stugger.coachflow.entity.workout.WorkoutTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Jake
 * @since June 15th, 2026
 */
public interface WorkoutTemplateRepository extends JpaRepository<WorkoutTemplate, Long> {

    List<WorkoutTemplate> findByTrainerIdAndArchivedFalseOrderByUpdatedAtDesc(Long trainerId);
}
