package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.CreateTrainerRequest;
import com.stugger.coachflow.api.dto.response.TrainerResponse;
import com.stugger.coachflow.api.dto.response.UserResponse;
import com.stugger.coachflow.entity.Trainer;
import com.stugger.coachflow.entity.User;
import com.stugger.coachflow.service.TrainerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Jake
 * @since May 27th, 2026
 */
@RestController
@RequestMapping("/api/trainers")
public class TrainerController {

    private final TrainerService trainerService;

    public TrainerController(TrainerService trainerService) {
        this.trainerService = trainerService;
    }

    @PostMapping
    public TrainerResponse createTrainer(@Valid @RequestBody CreateTrainerRequest request) {
        Trainer trainer = trainerService.createTrainer(request);
        User user = trainer.getUser();
        return new TrainerResponse(
                trainer.getId(),
                new UserResponse(user.getId(), user.getEmail(), user.getRole()),
                trainer.getFirstName(),
                trainer.getLastName(),
                trainer.getBirthDate(),
                trainer.getCreatedAt(),
                trainer.getUpdatedAt()
        );
    }
}
