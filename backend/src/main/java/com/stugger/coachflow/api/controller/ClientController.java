package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.CreateClientRequest;
import com.stugger.coachflow.api.dto.request.UpdateClientRequest;
import com.stugger.coachflow.api.dto.response.ClientResponse;
import com.stugger.coachflow.entity.Client;
import com.stugger.coachflow.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Jake
 * @since May 27th, 2026
 */
@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    public ClientResponse createClient(@Valid @RequestBody CreateClientRequest request) {
        Client client = clientService.createClient(request);
        return new ClientResponse(client);
    }

    @PutMapping("/{clientId}")
    public ClientResponse updateClient(@PathVariable Long clientId, @Valid @RequestBody UpdateClientRequest request) {
        Client client = clientService.updateClient(clientId, request);
        return new ClientResponse(client);
    }

    @GetMapping("/{clientId}")
    public ClientResponse getClientById(@PathVariable Long clientId) {
        return clientService.getClientById(clientId);
    }

    @GetMapping("/trainer/{trainerId}")
    public List<ClientResponse> getClientsByTrainerId(@PathVariable Long trainerId) {
        return clientService.getClientsByTrainerId(trainerId);
    }
}
