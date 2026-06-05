package com.stugger.coachflow.repository.person;

import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.entity.person.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * @author Jake
 * @since May 26th, 2026
 */
public interface TrainerRepository extends JpaRepository<Trainer, Long> {

    Optional<Trainer> findByUser(User user);

}