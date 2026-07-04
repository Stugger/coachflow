package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.person.CreateClientRequest;
import com.stugger.coachflow.api.dto.request.person.UpdateClientRequest;
import com.stugger.coachflow.api.dto.response.person.ClientResponse;
import com.stugger.coachflow.service.ClientService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Jake
 * @since May 27th, 2026
 */
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    public ClientResponse createClient(@Valid @RequestBody CreateClientRequest request) {
        return clientService.createClient(request);
    }

    @PutMapping("/{clientId}")
    public ClientResponse updateClient(@PathVariable Long clientId, @Valid @RequestBody UpdateClientRequest request) {
        return clientService.updateClient(clientId, request);
    }

    @GetMapping("/{clientId}")
    public ClientResponse getClientById(@PathVariable Long clientId) {
        return clientService.getClientById(clientId);
    }

    @GetMapping
    public List<ClientResponse> getClients() {
        return clientService.getClients();
    }
}
