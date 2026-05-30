package com.stugger.coachflow.repository;

import com.stugger.coachflow.entity.Trainer;
import com.stugger.coachflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * @author Jake
 * @since May 26th, 2026
 */
public interface TrainerRepository extends JpaRepository<Trainer, Long> {

    Optional<Trainer> findByUser(User user);

}