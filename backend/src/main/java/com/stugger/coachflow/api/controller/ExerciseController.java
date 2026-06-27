package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.exercise.CreateExerciseRequest;
import com.stugger.coachflow.api.dto.request.exercise.UpdateExerciseRequest;
import com.stugger.coachflow.api.dto.response.exercise.ExerciseResponse;
import com.stugger.coachflow.service.ExerciseService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Jake
 * @since June 9th, 2026
 */
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping
    public List<ExerciseResponse> getAvailableExercises() {
        return exerciseService.getAvailableExercises();
    }

    @PostMapping
    public ExerciseResponse createTrainerExercise(@Valid @RequestBody CreateExerciseRequest request) {
        return exerciseService.createTrainerExercise(request);
    }

    @PutMapping("/{exerciseId}")
    public ExerciseResponse updateTrainerExercise(@PathVariable Long exerciseId, @Valid @RequestBody UpdateExerciseRequest request) {
        return exerciseService.updateTrainerExercise(exerciseId, request);
    }

    @DeleteMapping("/{exerciseId}")
    public void archiveExercise(@PathVariable Long exerciseId) {
        exerciseService.archiveExercise(exerciseId);
    }

}
