package com.stugger.coachflow.repository;

import com.stugger.coachflow.entity.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author Jake
 * @since May 26th, 2026
 */
public interface TrainerRepository extends JpaRepository<Trainer, Long> {

}