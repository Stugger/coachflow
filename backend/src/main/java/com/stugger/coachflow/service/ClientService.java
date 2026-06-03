package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.CreateClientRequest;
import com.stugger.coachflow.api.dto.request.UpdateClientRequest;
import com.stugger.coachflow.api.dto.response.ClientResponse;
import com.stugger.coachflow.entity.Client;
import com.stugger.coachflow.entity.Trainer;
import com.stugger.coachflow.repository.ClientRepository;
import com.stugger.coachflow.repository.TrainerRepository;
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
    private final TrainerRepository trainerRepository;

    public ClientService(ClientRepository clientRepository, TrainerRepository trainerRepository) {
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
    }

    public Client createClient(CreateClientRequest request) {
        Trainer trainer = trainerRepository.findById(request.trainerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer with id " + request.trainerId() + " not found"));
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
        client.setActive(true);
        client.setCreatedAt(now);
        client.setUpdatedAt(now);
        return clientRepository.save(client);
    }

    public Client updateClient(Long clientId, @Valid UpdateClientRequest request) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client with id " + clientId + " not found"));
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
        Client client = clientRepository.findById(clientId).orElse(null);
        if (client == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Client with id " + clientId + " not found");
        }
        return new ClientResponse(client);
    }

    public List<ClientResponse> getClientsByTrainerId(Long trainerId) {
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer with id " + trainerId + " not found"));

        Sort sort = Sort.by("lastName").ascending()
                .and(Sort.by("firstName").ascending());

        return clientRepository.findByTrainerId(trainer.getId(), sort).stream()
                .map(ClientResponse::new)
                .toList();
    }
}