package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.workout.CreateClientWorkoutRequest;
import com.stugger.coachflow.api.dto.request.workout.SaveClientWorkoutSetResultRequest;
import com.stugger.coachflow.api.dto.request.workout.UpdateClientWorkoutRequest;
import com.stugger.coachflow.api.dto.response.workout.ClientWorkoutResponse;
import com.stugger.coachflow.api.dto.response.workout.ClientWorkoutSessionResponse;
import com.stugger.coachflow.api.dto.response.workout.ClientWorkoutSetResultResponse;
import com.stugger.coachflow.service.ClientWorkoutService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author Jake
 * @since June 30th, 2026
 */
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api")
public class ClientWorkoutController {

    private final ClientWorkoutService clientWorkoutService;

    public ClientWorkoutController(ClientWorkoutService clientWorkoutService) {
        this.clientWorkoutService = clientWorkoutService;
    }

    @GetMapping("/client-workouts/{clientWorkoutId}")
    public ClientWorkoutResponse getClientWorkout(@PathVariable Long clientWorkoutId) {
        return clientWorkoutService.getClientWorkout(clientWorkoutId);
    }

    @GetMapping("/client-workouts/{clientWorkoutId}/session")
    public ClientWorkoutSessionResponse getClientWorkoutSession(@PathVariable Long clientWorkoutId) {
        return clientWorkoutService.getClientWorkoutSession(clientWorkoutId);
    }

    @PutMapping("/client-workouts/{clientWorkoutId}")
    public ClientWorkoutResponse updateClientWorkout(@PathVariable Long clientWorkoutId, @Valid @RequestBody UpdateClientWorkoutRequest request) {
        return clientWorkoutService.updateClientWorkout(clientWorkoutId, request);
    }

    @PostMapping("/client-workouts/{clientWorkoutId}/start")
    public ClientWorkoutResponse startClientWorkout(@PathVariable Long clientWorkoutId) {
        return clientWorkoutService.startClientWorkout(clientWorkoutId);
    }

    @PostMapping("/client-workouts/{clientWorkoutId}/abandon")
    public ClientWorkoutResponse abandonClientWorkout(@PathVariable Long clientWorkoutId) {
        return clientWorkoutService.abandonClientWorkout(clientWorkoutId);
    }

    @PutMapping("/client-workouts/{clientWorkoutId}/set-results")
    public ResponseEntity<ClientWorkoutSetResultResponse> saveClientWorkoutSetResult(@PathVariable Long clientWorkoutId, @Valid @RequestBody SaveClientWorkoutSetResultRequest request) {
        return clientWorkoutService.saveClientWorkoutSetResult(clientWorkoutId, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @DeleteMapping("/client-workouts/{clientWorkoutId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteClientWorkout(@PathVariable Long clientWorkoutId) {
        clientWorkoutService.deleteClientWorkout(clientWorkoutId);
    }

    /*
     * Assessment Workouts
     */

    @PostMapping("/clients/{clientId}/initial-assessment-workout")
    @ResponseStatus(HttpStatus.CREATED)
    public ClientWorkoutResponse createInitialAssessmentWorkout(@PathVariable Long clientId, @Valid @RequestBody CreateClientWorkoutRequest request) {
        return clientWorkoutService.createInitialAssessmentWorkout(clientId, request);
    }

    @GetMapping("/clients/{clientId}/initial-assessment-workout")
    public ClientWorkoutResponse getInitialAssessmentWorkout(@PathVariable Long clientId) {
        return clientWorkoutService.getInitialAssessmentWorkout(clientId);
    }

}