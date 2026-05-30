package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.LoginRequest;
import com.stugger.coachflow.api.dto.request.RegisterTrainerRequest;
import com.stugger.coachflow.api.dto.response.AuthResponse;
import com.stugger.coachflow.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Jake
 * @since May 29th, 2026
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register-trainer")
    public AuthResponse registerTrainer(@Valid @RequestBody RegisterTrainerRequest request) {
        return authService.registerTrainer(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}