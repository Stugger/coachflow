package com.stugger.coachflow.repository.workout;

import com.stugger.coachflow.entity.workout.WorkoutTemplateItem;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author Jake
 * @since June 15th, 2026
 */
public interface WorkoutTemplateItemRepository extends JpaRepository<WorkoutTemplateItem, Long> {
}
