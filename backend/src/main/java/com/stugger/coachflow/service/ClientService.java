package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.person.CreateClientRequest;
import com.stugger.coachflow.api.dto.request.person.UpdateClientRequest;
import com.stugger.coachflow.api.dto.response.person.ClientResponse;
import com.stugger.coachflow.entity.person.Client;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.repository.person.ClientRepository;
import com.stugger.coachflow.security.CurrentTrainerService;
import com.stugger.coachflow.util.TextUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Jake
 * @since May 27th, 2026
 */
@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final CurrentTrainerService currentTrainerService;

    public ClientService(ClientRepository clientRepository, CurrentTrainerService currentTrainerService) {
        this.clientRepository = clientRepository;
        this.currentTrainerService = currentTrainerService;
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Clients
    //
    //---------------------------------------------------------------------------------------------------------

    public Client createClient(CreateClientRequest request) {
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
        return clientRepository.save(client);
    }

    public Client updateClient(Long clientId, @Valid UpdateClientRequest request) {
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
        return clientRepository.save(client);
    }

    public ClientResponse getClientById(Long clientId) {
        Client client = getOwnedClientOrThrow(clientId, currentTrainerService.getCurrentTrainer());
        return new ClientResponse(client);
    }

    public List<ClientResponse> getClients() {
        Trainer trainer = currentTrainerService.getCurrentTrainer();

        Sort sort = Sort.by("lastName").ascending()
                .and(Sort.by("firstName").ascending());

        return clientRepository.findByTrainerId(trainer.getId(), sort).stream()
                .map(ClientResponse::new)
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
}