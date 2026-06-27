package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.auth.LoginRequest;
import com.stugger.coachflow.api.dto.request.auth.RegisterTrainerRequest;
import com.stugger.coachflow.api.dto.response.auth.AuthResponse;
import com.stugger.coachflow.api.dto.response.person.TrainerResponse;
import com.stugger.coachflow.api.dto.response.person.UserResponse;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.entity.person.User;
import com.stugger.coachflow.entity.person.UserRole;
import com.stugger.coachflow.repository.person.TrainerRepository;
import com.stugger.coachflow.repository.person.UserRepository;
import com.stugger.coachflow.security.JwtTokenService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * @author Jake
 * @since May 29th, 2026
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TrainerRepository trainerRepository;
    private final TrainerService trainerService;

    private final JwtTokenService jwtTokenService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, TrainerRepository trainerRepository, TrainerService trainerService, JwtTokenService jwtTokenService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.trainerRepository = trainerRepository;
        this.trainerService = trainerService;
        this.jwtTokenService = jwtTokenService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse registerTrainer(RegisterTrainerRequest request) {
        Trainer trainer = trainerService.createTrainer(new RegisterTrainerRequest(
                request.firstName(),
                request.lastName(),
                request.birthDate(),
                request.email(),
                request.password()
        ));

        return new AuthResponse(
                new UserResponse(trainer.getUser()),
                new TrainerResponse(trainer),
                jwtTokenService.createAccessToken(trainer.getUser())
        );
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        if (user.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only trainer login is supported right now.");
        }

        Trainer trainer = trainerRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer profile not found."));

        return new AuthResponse(
                new UserResponse(user),
                new TrainerResponse(trainer),
                jwtTokenService.createAccessToken(user)
        );
    }
}