package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.intake.CreateClientIntakeRequest;
import com.stugger.coachflow.api.dto.request.intake.UpdateIntakeJsonRequest;
import com.stugger.coachflow.api.dto.response.intake.ClientIntakeResponse;
import com.stugger.coachflow.entity.intake.IntakeStatus;
import com.stugger.coachflow.entity.intake.IntakeStep;
import com.stugger.coachflow.service.ClientIntakeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Jake
 * @since June 3rd, 2026
 */
@RestController
@RequestMapping("/api/client-intakes")
public class ClientIntakeController {

    private final ClientIntakeService clientIntakeService;

    public ClientIntakeController(ClientIntakeService clientIntakeService) {
        this.clientIntakeService = clientIntakeService;
    }

    @PostMapping
    public ClientIntakeResponse createIntake(@Valid @RequestBody CreateClientIntakeRequest request) {
        return clientIntakeService.createIntake(request);
    }

    @GetMapping("/trainer/{trainerId}")
    public List<ClientIntakeResponse> getIntakesByTrainerId(@PathVariable Long trainerId) {
        return clientIntakeService.getIntakesByTrainerId(trainerId);
    }

    @GetMapping("/client/{clientId}")
    public List<ClientIntakeResponse> getIntakesByClientId(@PathVariable Long clientId) {
        return clientIntakeService.getIntakesByClientId(clientId);
    }

    @GetMapping("/client/{clientId}/status/{status}")
    public List<ClientIntakeResponse> getIntakesByClientIdAndStatus(@PathVariable Long clientId, @PathVariable IntakeStatus status) {
        return clientIntakeService.getIntakesOfStatusByClientId(clientId, status);
    }

    @PutMapping("/{intakeId}/step/{step}")
    public ClientIntakeResponse updateIntakeStep(@PathVariable Long intakeId, @PathVariable IntakeStep step, @Valid @RequestBody UpdateIntakeJsonRequest request) {
        return clientIntakeService.updateIntake(intakeId, step, request);
    }

    @PatchMapping("/{intakeId}/complete")
    public ClientIntakeResponse completeIntake(@PathVariable Long intakeId) {
        return clientIntakeService.completeIntake(intakeId);
    }
}