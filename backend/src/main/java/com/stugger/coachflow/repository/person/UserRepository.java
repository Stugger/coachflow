package com.stugger.coachflow.repository.person;

import com.stugger.coachflow.entity.person.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * @author Jake
 * @since May 26th, 2026
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

}