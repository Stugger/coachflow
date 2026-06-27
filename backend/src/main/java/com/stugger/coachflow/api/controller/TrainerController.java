package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.response.person.TrainerResponse;
import com.stugger.coachflow.service.TrainerService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.*;

/**
 * @author Jake
 * @since May 27th, 2026
 */
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/trainers")
public class TrainerController {

    private final TrainerService trainerService;

    public TrainerController(TrainerService trainerService) {
        this.trainerService = trainerService;
    }

    @GetMapping("/current")
    public TrainerResponse getCurrentTrainer() {
        return trainerService.getCurrentTrainer();
    }

}
