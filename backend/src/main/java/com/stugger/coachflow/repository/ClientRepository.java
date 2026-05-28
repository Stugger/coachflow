package com.stugger.coachflow.repository;

import com.stugger.coachflow.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author Jake
 * @since May 26th, 2026
 */
public interface ClientRepository extends JpaRepository<Client, Long> {

}