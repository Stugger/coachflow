package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.exercise.CopyExerciseRequest;
import com.stugger.coachflow.api.dto.request.exercise.CreateExerciseMediaRequest;
import com.stugger.coachflow.api.dto.request.exercise.CreateExerciseRequest;
import com.stugger.coachflow.api.dto.request.exercise.UpdateExerciseRequest;
import com.stugger.coachflow.api.dto.response.exercise.ExerciseMediaResponse;
import com.stugger.coachflow.api.dto.response.exercise.ExerciseResponse;
import com.stugger.coachflow.service.ExerciseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Jake
 * @since June 9th, 2026
 */
@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping("/trainer/{trainerId}")
    public List<ExerciseResponse> getAvailableExercises(@PathVariable Long trainerId) {
        return exerciseService.getAvailableExercises(trainerId);
    }

    @PostMapping
    public ExerciseResponse createTrainerExercise(@Valid @RequestBody CreateExerciseRequest request) {
        return exerciseService.createTrainerExercise(request);
    }

    @PutMapping("/{exerciseId}")
    public ExerciseResponse updateTrainerExercise(@PathVariable Long exerciseId, @Valid @RequestBody UpdateExerciseRequest request) {
        return exerciseService.updateTrainerExercise(exerciseId, request);
    }

    @PostMapping("/{exerciseId}/copy")
    public ExerciseResponse copyExercise(@PathVariable Long exerciseId, @Valid @RequestBody CopyExerciseRequest request) {
        return exerciseService.copyExercise(exerciseId, request);
    }

    @DeleteMapping("/{exerciseId}")
    public void archiveExercise(@PathVariable Long exerciseId, @RequestParam Long trainerId) {
        exerciseService.archiveExercise(exerciseId, trainerId);
    }

    @GetMapping("/{exerciseId}/media")
    public List<ExerciseMediaResponse> getExerciseMedia(@PathVariable Long exerciseId, @RequestParam Long trainerId) {
        return exerciseService.getExerciseMedia(exerciseId, trainerId);
    }

    @PostMapping("/{exerciseId}/media")
    public ExerciseMediaResponse addExerciseMedia(@PathVariable Long exerciseId, @Valid @RequestBody CreateExerciseMediaRequest request) {
        return exerciseService.addExerciseMedia(exerciseId, request);
    }
}
