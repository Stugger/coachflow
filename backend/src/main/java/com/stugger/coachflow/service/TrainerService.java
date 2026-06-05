package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.auth.RegisterTrainerRequest;
import com.stugger.coachflow.api.dto.response.person.TrainerResponse;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.entity.person.User;
import com.stugger.coachflow.entity.person.UserRole;
import com.stugger.coachflow.repository.person.TrainerRepository;
import com.stugger.coachflow.util.TextUtils;
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
public class TrainerService {

    private final TrainerRepository trainerRepository;
    private final UserService userService;

    public TrainerService(TrainerRepository trainerRepository, UserService userService) {
        this.trainerRepository = trainerRepository;
        this.userService = userService;
    }

    public Trainer createTrainer(RegisterTrainerRequest request) {
        LocalDateTime now = LocalDateTime.now();
        //create user
        User user = userService.createUser(request.email(), request.password(), UserRole.TRAINER, now);
        //create trainer
        Trainer trainer = new Trainer();
        trainer.setUser(user);
        trainer.setFirstName(TextUtils.normalizeName(request.firstName()));
        trainer.setLastName(TextUtils.normalizeName(request.lastName()));
        trainer.setBirthDate(request.birthDate());
        trainer.setCreatedAt(now);
        trainer.setUpdatedAt(now);
        return trainerRepository.save(trainer);
    }

    public TrainerResponse getTrainerById(Long trainerId) {
        Trainer trainer = trainerRepository.findById(trainerId).orElse(null);
        if (trainer == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer with id " + trainerId + " not found");
        }
        return new TrainerResponse(trainer);
    }

    public List<TrainerResponse> getAllTrainers() {
        return trainerRepository.findAll(Sort.by("lastName").ascending()
                        .and(Sort.by("firstName").ascending()))
                .stream()
                .map(TrainerResponse::new)
                .toList();
    }
}