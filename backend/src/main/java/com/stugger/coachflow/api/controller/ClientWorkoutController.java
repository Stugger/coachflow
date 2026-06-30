package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.workout.CreateClientWorkoutRequest;
import com.stugger.coachflow.api.dto.request.workout.UpdateClientWorkoutRequest;
import com.stugger.coachflow.api.dto.response.workout.ClientWorkoutResponse;
import com.stugger.coachflow.entity.workout.ClientWorkoutOrigin;
import com.stugger.coachflow.service.ClientWorkoutService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PutMapping("/client-workouts/{clientWorkoutId}")
    public ClientWorkoutResponse updateClientWorkout(@PathVariable Long clientWorkoutId, @Valid @RequestBody UpdateClientWorkoutRequest request) {
        return clientWorkoutService.updateClientWorkout(clientWorkoutId, request);
    }

    @DeleteMapping("/client-workouts/{clientWorkoutId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteClientWorkout(@PathVariable Long clientWorkoutId) {
        clientWorkoutService.deleteClientWorkout(clientWorkoutId);
    }

    /*
     * Assessment Workouts
     */

    @PostMapping("/clients/{clientId}/assessment-workouts")
    @ResponseStatus(HttpStatus.CREATED)
    public ClientWorkoutResponse createAssessmentWorkout(@PathVariable Long clientId, @Valid @RequestBody CreateClientWorkoutRequest request) {
        return clientWorkoutService.createAssessmentWorkout(clientId, request);
    }

    @GetMapping("/clients/{clientId}/assessment-workouts")
    public List<ClientWorkoutResponse> getAssessmentWorkoutsByClientId(@PathVariable Long clientId) {
        return clientWorkoutService.getClientWorkoutsOfOriginByClientId(clientId, ClientWorkoutOrigin.ASSESSMENT);
    }

}