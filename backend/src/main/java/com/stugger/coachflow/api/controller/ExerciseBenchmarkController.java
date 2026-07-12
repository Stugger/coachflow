package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.benchmark.CreateExerciseBenchmarkRequest;
import com.stugger.coachflow.api.dto.request.benchmark.UpdateExerciseBenchmarkRequest;
import com.stugger.coachflow.api.dto.response.benchmark.ExerciseBenchmarkResponse;
import com.stugger.coachflow.entity.benchmark.ExerciseBenchmarkType;
import com.stugger.coachflow.service.ExerciseBenchmarkService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * @author Jake
 * @since July 10th, 2026
 */
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/clients/{clientId}/exercise-benchmarks")
public class ExerciseBenchmarkController {

    private final ExerciseBenchmarkService exerciseBenchmarkService;

    public ExerciseBenchmarkController(ExerciseBenchmarkService exerciseBenchmarkService) {
        this.exerciseBenchmarkService = exerciseBenchmarkService;
    }

    @GetMapping
    public List<ExerciseBenchmarkResponse> getCurrentClientExerciseBenchmarks(@PathVariable Long clientId, @RequestParam(required = false) Set<Long> exerciseIds) {
        return exerciseBenchmarkService.getCurrentClientExerciseBenchmarks(clientId, exerciseIds);
    }

    @GetMapping("/history")
    public List<ExerciseBenchmarkResponse> getAllClientExerciseBenchmarks(@PathVariable Long clientId,
                                                                                     @RequestParam(required = false) Set<Long> exerciseIds,
                                                                                     @RequestParam(required = false) ExerciseBenchmarkType benchmarkType) {
        return exerciseBenchmarkService.getAllClientExerciseBenchmarks(clientId, exerciseIds, benchmarkType);
    }


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExerciseBenchmarkResponse createClientExerciseBenchmark(@PathVariable Long clientId, @Valid @RequestBody CreateExerciseBenchmarkRequest request) {
        return exerciseBenchmarkService.createClientExerciseBenchmark(clientId, request);
    }

    @PutMapping("/{benchmarkId}")
    public ExerciseBenchmarkResponse updateClientExerciseBenchmark(@PathVariable Long clientId, @PathVariable Long benchmarkId, @Valid @RequestBody UpdateExerciseBenchmarkRequest request) {
        return exerciseBenchmarkService.updateClientExerciseBenchmark(clientId, benchmarkId, request);
    }

    @DeleteMapping("/{benchmarkId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteClientExerciseBenchmark(@PathVariable Long clientId, @PathVariable Long benchmarkId) {
        exerciseBenchmarkService.deleteClientExerciseBenchmark(clientId, benchmarkId);
    }
}
