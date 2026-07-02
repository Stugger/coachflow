package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.intake.CreateClientIntakeRequest;
import com.stugger.coachflow.api.dto.request.intake.UpdateIntakeJsonRequest;
import com.stugger.coachflow.api.dto.response.intake.ClientIntakeResponse;
import com.stugger.coachflow.entity.person.Client;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.entity.intake.ClientIntake;
import com.stugger.coachflow.entity.intake.IntakeStatus;
import com.stugger.coachflow.entity.intake.IntakeStep;
import com.stugger.coachflow.repository.person.ClientRepository;
import com.stugger.coachflow.repository.intake.ClientIntakeRepository;
import com.stugger.coachflow.security.CurrentTrainerService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Jake
 * @since June 3rd, 2026
 */
@Service
@Transactional(readOnly = true)
public class ClientIntakeService {

    private final ClientIntakeRepository clientIntakeRepository;
    private final CurrentTrainerService currentTrainerService;
    private final ClientRepository clientRepository;

    public ClientIntakeService(ClientIntakeRepository clientIntakeRepository, CurrentTrainerService currentTrainerService, ClientRepository clientRepository) {
        this.clientIntakeRepository = clientIntakeRepository;
        this.currentTrainerService = currentTrainerService;
        this.clientRepository = clientRepository;
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Client Intakes
    //
    //---------------------------------------------------------------------------------------------------------

    @Transactional
    public ClientIntakeResponse createIntake(CreateClientIntakeRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        Client client = getOwnedClientOrThrow(request.clientId(), trainer);

        if (clientIntakeRepository.existsByClient_IdAndTrainer_Id(client.getId(), trainer.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An intake already exists.");
        }

        ClientIntake intake = new ClientIntake();
        LocalDateTime now = LocalDateTime.now();

        intake.setTrainer(trainer);
        intake.setClient(client);
        intake.setStatus(IntakeStatus.DRAFT);
        intake.setCurrentStep(IntakeStep.PARQ);
        intake.setStartedAt(now);
        intake.setCreatedAt(now);
        intake.setUpdatedAt(now);

        return new ClientIntakeResponse(clientIntakeRepository.save(intake));
    }

    @Transactional
    public ClientIntakeResponse updateIntake(Long intakeId, IntakeStep step, UpdateIntakeJsonRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        ClientIntake intake = getOwnedIntakeOrThrow(intakeId, trainer);

        switch (step) {
            case PARQ -> intake.setParqJson(request.json());
            case GOALS -> intake.setGoalsJson(request.json());
            case ACTIVITY_HISTORY -> intake.setActivityHistoryJson(request.json());
            case MEDICAL -> intake.setMedicalHistoryJson(request.json());
            case LIFESTYLE -> intake.setLifestyleJson(request.json());
            case TRAINING_PREFERENCES -> intake.setTrainingPreferencesJson(request.json());
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Step cannot be updated with JSON");
        }

        return saveUpdatedIntake(intake, step);
    }

    @Transactional
    public ClientIntakeResponse completeIntake(Long intakeId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        ClientIntake intake = getOwnedIntakeOrThrow(intakeId, trainer);

        if (intake.getParqJson() == null || intake.getParqJson().isBlank()
                || intake.getGoalsJson() == null || intake.getGoalsJson().isBlank()
                || intake.getActivityHistoryJson() == null || intake.getActivityHistoryJson().isBlank()
                || intake.getLifestyleJson() == null || intake.getLifestyleJson().isBlank()
                || intake.getTrainingPreferencesJson() == null || intake.getTrainingPreferencesJson().isBlank()) {

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All intake steps must be completed before completing intake");
        }

        intake.setStatus(IntakeStatus.COMPLETED);
        intake.setCompletedAt(LocalDateTime.now());

        return saveUpdatedIntake(intake, IntakeStep.COMPLETED);
    }

    private ClientIntakeResponse saveUpdatedIntake(ClientIntake intake, IntakeStep step) {
        intake.setCurrentStep(step);
        intake.setUpdatedAt(LocalDateTime.now());
        return new ClientIntakeResponse(clientIntakeRepository.save(intake));
    }

    public ClientIntakeResponse getIntakeById(Long intakeId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        return new ClientIntakeResponse(getOwnedIntakeOrThrow(intakeId, trainer));
    }

    public List<ClientIntakeResponse> getIntakes() {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        return clientIntakeRepository.findByTrainerId(trainer.getId()).stream()
                .map(ClientIntakeResponse::new)
                .toList();
    }

    public List<ClientIntakeResponse> getIntakesByClientId(Long clientId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        getOwnedClientOrThrow(clientId, trainer);

        return clientIntakeRepository
                .findByClient_IdAndTrainer_Id(clientId, trainer.getId())
                .stream()
                .map(ClientIntakeResponse::new)
                .toList();
    }

    public List<ClientIntakeResponse> getIntakesOfStatusByClientId(Long clientId, IntakeStatus status) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        getOwnedClientOrThrow(clientId, trainer);

        return clientIntakeRepository
                .findByClient_IdAndTrainer_IdAndStatus(clientId, trainer.getId(), status)
                .stream()
                .map(ClientIntakeResponse::new)
                .toList();
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Validation
    //
    //---------------------------------------------------------------------------------------------------------

    private Client getOwnedClientOrThrow(Long clientId, Trainer trainer) {
        return clientRepository.findByIdAndTrainer_Id(clientId, trainer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found."));
    }

    private ClientIntake getOwnedIntakeOrThrow(Long intakeId, Trainer trainer) {
        return clientIntakeRepository.findByIdAndTrainer_Id(intakeId, trainer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Intake not found."));
    }

}