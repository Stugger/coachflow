package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.person.CreateClientRequest;
import com.stugger.coachflow.api.dto.request.person.UpdateClientRequest;
import com.stugger.coachflow.api.dto.response.person.ClientResponse;
import com.stugger.coachflow.api.dto.response.person.ClientReviewStatusResponse;
import com.stugger.coachflow.api.dto.response.person.InitialAssessmentReviewStatus;
import com.stugger.coachflow.api.dto.response.person.IntakeReviewStatus;
import com.stugger.coachflow.entity.intake.ClientIntake;
import com.stugger.coachflow.entity.intake.IntakeStatus;
import com.stugger.coachflow.entity.person.Client;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.entity.workout.ClientWorkoutOrigin;
import com.stugger.coachflow.entity.workout.ClientWorkoutStatus;
import com.stugger.coachflow.repository.intake.ClientIntakeRepository;
import com.stugger.coachflow.repository.person.ClientRepository;
import com.stugger.coachflow.repository.workout.ClientWorkoutRepository;
import com.stugger.coachflow.security.CurrentTrainerService;
import com.stugger.coachflow.util.TextUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

/**
 * @author Jake
 * @since May 27th, 2026
 */
@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final CurrentTrainerService currentTrainerService;

    private final ClientIntakeRepository clientIntakeRepository;
    private final ClientWorkoutRepository clientWorkoutRepository;

    public ClientService(ClientRepository clientRepository, CurrentTrainerService currentTrainerService, ClientIntakeRepository clientIntakeRepository, ClientWorkoutRepository clientWorkoutRepository) {
        this.clientRepository = clientRepository;
        this.currentTrainerService = currentTrainerService;
        this.clientIntakeRepository = clientIntakeRepository;
        this.clientWorkoutRepository = clientWorkoutRepository;
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Clients
    //
    //---------------------------------------------------------------------------------------------------------

    public ClientResponse createClient(CreateClientRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();

        LocalDateTime now = LocalDateTime.now();
        Client client = new Client();
        client.setTrainer(trainer);
        client.setFirstName(TextUtils.normalizeName(request.firstName()));
        client.setLastName(TextUtils.normalizeName(request.lastName()));
        client.setPreferredName(TextUtils.normalizeName(request.preferredName()));
        if (request.email() != null && !request.email().isBlank()) {
            client.setEmail(TextUtils.normalizeEmail(request.email()));
        }
        client.setPhone(request.phone());
        client.setBirthDate(request.birthDate());
        client.setGender(request.gender());
        client.setArchived(false);
        client.setCreatedAt(now);
        client.setUpdatedAt(now);
        return toClientResponse(clientRepository.save(client));
    }

    public ClientResponse updateClient(Long clientId, @Valid UpdateClientRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        Client client = getOwnedClientOrThrow(clientId, trainer);

        client.setFirstName(TextUtils.normalizeName(request.firstName()));
        client.setLastName(TextUtils.normalizeName(request.lastName()));
        client.setPreferredName(TextUtils.normalizeName(request.preferredName()));
        if (request.email() != null && !request.email().isBlank()) {
            client.setEmail(TextUtils.normalizeEmail(request.email()));
        } else {
            client.setEmail(null);
        }
        client.setPhone(request.phone());
        client.setBirthDate(request.birthDate());
        client.setGender(request.gender());
        client.setUpdatedAt(LocalDateTime.now());
        return toClientResponse(clientRepository.save(client));
    }

    public ClientResponse getClientById(Long clientId) {
        Client client = getOwnedClientOrThrow(clientId, currentTrainerService.getCurrentTrainer());
        return toClientResponse(client);
    }

    public List<ClientResponse> getClients() {
        Trainer trainer = currentTrainerService.getCurrentTrainer();

        Sort sort = Sort.by("lastName").ascending()
                .and(Sort.by("firstName").ascending());

        List<Client> clients = clientRepository.findByTrainerId(trainer.getId(), sort);

        Map<Long, ClientReviewStatusResponse> reviewStatuses = getReviewStatuses(clients.stream().map(Client::getId).toList(), trainer.getId());

        return clients.stream()
                .map(client -> new ClientResponse(client, reviewStatuses.get(client.getId())))
                .toList();
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Mapping
    //
    //---------------------------------------------------------------------------------------------------------

    private ClientResponse toClientResponse(Client client) {
        ClientReviewStatusResponse reviewStatus = getReviewStatuses(List.of(client.getId()), client.getTrainer().getId()).get(client.getId());
        return new ClientResponse(client, reviewStatus);
    }

    private Map<Long, ClientReviewStatusResponse> getReviewStatuses(Collection<Long> clientIds, Long trainerId) {
        if (clientIds.isEmpty()) {
            return Map.of();
        }

        List<ClientIntake> intakes = clientIntakeRepository.findByTrainer_IdAndClient_IdIn(trainerId, clientIds);

        Map<Long, ClientIntake> intakesByClientId = new HashMap<>();

        for (ClientIntake intake : intakes) { //list should only have one entry at most
            intakesByClientId.put(intake.getClient().getId(), intake);
        }

        List<ClientWorkoutRepository.ClientWorkoutStatusView> initialAssessmentWorkouts = clientWorkoutRepository
                .findStatusesByTrainerIdAndClientIdInAndOriginAndArchivedAtNull(trainerId, clientIds, ClientWorkoutOrigin.INITIAL_ASSESSMENT);

        Map<Long, ClientWorkoutStatus> initialAssessmentStatusesByClientId = new HashMap<>();

        for (ClientWorkoutRepository.ClientWorkoutStatusView workout : initialAssessmentWorkouts) {
            initialAssessmentStatusesByClientId.put(workout.getClientId(), workout.getStatus());
        }

        Map<Long, ClientReviewStatusResponse> reviewStatuses = new HashMap<>();

        for (Long clientId : clientIds) {
            ClientIntake intake = intakesByClientId.get(clientId);
            ClientWorkoutStatus clientWorkoutStatus = initialAssessmentStatusesByClientId.get(clientId);

            reviewStatuses.put(clientId, toClientReviewStatusResponse(intake, clientWorkoutStatus));
        }

        return reviewStatuses;
    }

    private ClientReviewStatusResponse toClientReviewStatusResponse(ClientIntake intake, ClientWorkoutStatus clientWorkoutStatus) {
        IntakeReviewStatus intakeStatus = intake == null
                ? IntakeReviewStatus.MISSING
                : intake.getStatus() == IntakeStatus.COMPLETED
                  ? IntakeReviewStatus.COMPLETED
                  : IntakeReviewStatus.IN_PROGRESS;

        Long inProgressIntakeId = intakeStatus == IntakeReviewStatus.IN_PROGRESS ? intake.getId() : null;

        InitialAssessmentReviewStatus initialAssessmentStatus = clientWorkoutStatus == null
                ? InitialAssessmentReviewStatus.MISSING
                : switch (clientWorkoutStatus) {
                    case READY -> InitialAssessmentReviewStatus.READY;
                    case IN_PROGRESS -> InitialAssessmentReviewStatus.IN_PROGRESS;
                    case COMPLETED -> InitialAssessmentReviewStatus.COMPLETED;
                };

        return new ClientReviewStatusResponse(intakeStatus, inProgressIntakeId, initialAssessmentStatus);
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
}