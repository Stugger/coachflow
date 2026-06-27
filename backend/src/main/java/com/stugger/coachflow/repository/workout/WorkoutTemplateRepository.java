package com.stugger.coachflow.repository.workout;

import com.stugger.coachflow.entity.workout.WorkoutTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author Jake
 * @since June 15th, 2026
 */
public interface WorkoutTemplateRepository extends JpaRepository<WorkoutTemplate, Long> {

    Optional<WorkoutTemplate> findByIdAndTrainer_Id(Long workoutTemplateId, Long trainerId);

    List<WorkoutTemplate> findByTrainerIdAndArchivedFalseOrderByUpdatedAtDesc(Long trainerId);

}
