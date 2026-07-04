package com.stugger.coachflow.repository.workout;

import com.stugger.coachflow.entity.workout.ClientWorkoutItem;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author Jake
 * @since June 29th, 2026
 */
public interface ClientWorkoutItemRepository extends JpaRepository<ClientWorkoutItem, Long> {
}
