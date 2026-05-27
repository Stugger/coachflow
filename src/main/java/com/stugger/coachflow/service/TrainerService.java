package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.CreateTrainerRequest;
import com.stugger.coachflow.entity.Trainer;
import com.stugger.coachflow.entity.User;
import com.stugger.coachflow.entity.UserRole;
import com.stugger.coachflow.repository.TrainerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since May 27th, 2026
 */
@Service
public class TrainerService {

    private final TrainerRepository trainerRepository;
    private final UserService userService;

    public TrainerService(TrainerRepository trainerRepository, UserService userService) {
        this.trainerRepository = trainerRepository;
        this.userService = userService;
    }

    public Trainer createTrainer(CreateTrainerRequest request) {
        LocalDateTime now = LocalDateTime.now();
        //create user
        User user = userService.createUser(request.email(), request.password(), UserRole.TRAINER, now);
        //create trainer
        Trainer trainer = new Trainer();
        trainer.setUser(user);
        trainer.setFirstName(request.firstName());
        trainer.setLastName(request.lastName());
        trainer.setBirthDate(request.birthDate());
        trainer.setCreatedAt(now);
        trainer.setUpdatedAt(now);
        return trainerRepository.save(trainer);
    }
}