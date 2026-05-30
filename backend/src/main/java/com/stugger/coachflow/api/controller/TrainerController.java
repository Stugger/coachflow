package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.response.TrainerResponse;
import com.stugger.coachflow.service.TrainerService;
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

    @GetMapping("/{trainerId}")
    public TrainerResponse getTrainerById(@PathVariable Long trainerId) {
        return trainerService.getTrainerById(trainerId);
    }

    @GetMapping
    public List<TrainerResponse> getAllTrainers() {
        return trainerService.getAllTrainers();
    }
}
