package com.stugger.coachflow.repository.person;

import com.stugger.coachflow.entity.person.Client;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author Jake
 * @since May 26th, 2026
 */
public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByIdAndTrainer_Id(Long clientId, Long trainerId);

    List<Client> findByTrainerId(Long trainerId, Sort sort);

}