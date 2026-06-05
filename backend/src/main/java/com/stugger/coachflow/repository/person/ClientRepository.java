package com.stugger.coachflow.repository.person;

import com.stugger.coachflow.entity.person.Client;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Jake
 * @since May 26th, 2026
 */
public interface ClientRepository extends JpaRepository<Client, Long> {

    List<Client> findByTrainerId(Long trainerId, Sort sort);

}