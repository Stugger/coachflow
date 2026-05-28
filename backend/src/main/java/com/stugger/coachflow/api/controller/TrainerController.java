package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.CreateTrainerRequest;
import com.stugger.coachflow.api.dto.response.TrainerResponse;
import com.stugger.coachflow.entity.Trainer;
import com.stugger.coachflow.service.TrainerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        return new TrainerResponse(trainer);
    }

    @GetMapping("/{trainerId}")
    public TrainerResponse getTrainerById(@PathVariable Long trainerId) {
        return trainerService.getTrainerById(trainerId);
    }

    @GetMapping
    public List<TrainerResponse> getAllTrainers() {
        return trainerService.getAllTrainers();
    }
}
