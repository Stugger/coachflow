package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.intake.CreateClientIntakeRequest;
import com.stugger.coachflow.api.dto.request.intake.UpdateIntakeJsonRequest;
import com.stugger.coachflow.api.dto.response.intake.ClientIntakeResponse;
import com.stugger.coachflow.entity.Client;
import com.stugger.coachflow.entity.Trainer;
import com.stugger.coachflow.entity.intake.ClientIntake;
import com.stugger.coachflow.entity.intake.IntakeStatus;
import com.stugger.coachflow.entity.intake.IntakeStep;
import com.stugger.coachflow.repository.ClientRepository;
import com.stugger.coachflow.repository.TrainerRepository;
import com.stugger.coachflow.repository.intake.ClientIntakeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Jake
 * @since June 3rd, 2026
 */
@Service
public class ClientIntakeService {

    private final ClientIntakeRepository clientIntakeRepository;
    private final TrainerRepository trainerRepository;
    private final ClientRepository clientRepository;

    public ClientIntakeService(ClientIntakeRepository clientIntakeRepository, TrainerRepository trainerRepository, ClientRepository clientRepository) {
        this.clientIntakeRepository = clientIntakeRepository;
        this.trainerRepository = trainerRepository;
        this.clientRepository = clientRepository;
    }

    public ClientIntakeResponse createIntake(CreateClientIntakeRequest request) {
        Trainer trainer = trainerRepository.findById(request.trainerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));

        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));

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

    public ClientIntakeResponse updateIntake(Long intakeId, IntakeStep step, UpdateIntakeJsonRequest request) {
        ClientIntake intake = getIntakeOrThrow(intakeId);

        switch (step) {
            case PARQ -> intake.setParqJson(request.json());
            case GOALS -> intake.setGoalsJson(request.json());
            case ACTIVITY_HISTORY -> intake.setActivityHistory(request.json());
            case MEDICAL -> intake.setMedicalHistoryJson(request.json());
            case LIFESTYLE -> intake.setLifestyleJson(request.json());
            case TRAINING_PREFERENCES -> intake.setTrainingPreferencesJson(request.json());
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Step cannot be updated with JSON");
        }

        return saveUpdatedIntake(intake, step);
    }

    public ClientIntakeResponse completeIntake(Long intakeId) {
        ClientIntake intake = getIntakeOrThrow(intakeId);

        if (intake.getParqJson() == null || intake.getParqJson().isBlank()
                || intake.getGoalsJson() == null || intake.getGoalsJson().isBlank()
                || intake.getMedicalHistoryJson() == null ||  intake.getMedicalHistoryJson().isBlank()
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

    private ClientIntake getIntakeOrThrow(Long intakeId) {
        return clientIntakeRepository.findById(intakeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Intake not found"));
    }

    public ClientIntakeResponse getIntakeById(Long intakeId) {
        return new ClientIntakeResponse(getIntakeOrThrow(intakeId));
    }

    public List<ClientIntakeResponse> getIntakesByTrainerId(Long trainerId) {
        return clientIntakeRepository.findByTrainerId(trainerId).stream()
                .map(ClientIntakeResponse::new)
                .toList();
    }

    public List<ClientIntakeResponse> getIntakesByClientId(Long clientId) {
        return clientIntakeRepository.findByClientId(clientId).stream()
                .map(ClientIntakeResponse::new)
                .toList();
    }

    public List<ClientIntakeResponse> getIntakesOfStatusByClientId(Long clientId, IntakeStatus status) {
        return clientIntakeRepository.findByClientIdAndStatus(clientId, status).stream()
                .map(ClientIntakeResponse::new)
                .toList();
    }
}