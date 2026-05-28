package com.stugger.coachflow.repository;

import com.stugger.coachflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author Jake
 * @since May 26th, 2026
 */
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

}