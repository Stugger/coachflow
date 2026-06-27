package com.stugger.coachflow.security;

import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.entity.person.User;
import com.stugger.coachflow.entity.person.UserRole;
import com.stugger.coachflow.repository.person.TrainerRepository;
import com.stugger.coachflow.repository.person.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * @author Jake
 * @since June 26th, 2026
 */
@Service
@Transactional(readOnly = true)
public class CurrentTrainerService {

    private final UserRepository userRepository;
    private final TrainerRepository trainerRepository;

    public CurrentTrainerService(UserRepository userRepository, TrainerRepository trainerRepository) {
        this.userRepository = userRepository;
        this.trainerRepository = trainerRepository;
    }

    public Trainer getCurrentTrainer() {
        Jwt jwt = getCurrentJwt();

        long userId;
        try {
            userId = Long.parseLong(jwt.getSubject());
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication subject.");
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user no longer exists."));

        if (user.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Trainer access is required.");
        }

        return trainerRepository.findByUser(user).orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Trainer profile not found."));
    }

    private Jwt getCurrentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }

        return jwt;
    }
}