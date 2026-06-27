package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.exercise.CreateExerciseRequest;
import com.stugger.coachflow.api.dto.request.exercise.UpdateExerciseRequest;
import com.stugger.coachflow.api.dto.response.exercise.ExerciseResponse;
import com.stugger.coachflow.entity.exercise.Exercise;
import com.stugger.coachflow.entity.exercise.ExerciseVisibility;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.repository.exercise.ExerciseRepository;
import com.stugger.coachflow.security.CurrentTrainerService;
import com.stugger.coachflow.util.TextUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Jake
 * @since June 9th, 2026
 */
@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final CurrentTrainerService currentTrainerService;

    public ExerciseService(ExerciseRepository exerciseRepository, CurrentTrainerService currentTrainerService) {
        this.exerciseRepository = exerciseRepository;
        this.currentTrainerService = currentTrainerService;
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Exercises
    //
    //---------------------------------------------------------------------------------------------------------

    public ExerciseResponse createTrainerExercise(@Valid CreateExerciseRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        LocalDateTime now = LocalDateTime.now();

        Exercise exercise = new Exercise();
        exercise.setTrainer(trainer);
        exercise.setVisibility(ExerciseVisibility.TRAINER);
        exercise.setName(TextUtils.trimToEmpty(request.name()));
        exercise.setDetails(TextUtils.trimToNull(request.details()));
        exercise.setThumbnailUrl(TextUtils.trimToNull(request.thumbnailUrl()));
        exercise.setDemoVideoUrl(TextUtils.trimToNull(request.demoVideoUrl()));
        exercise.setMetadataJson(request.metadataJson());
        exercise.setArchived(false);
        exercise.setCreatedAt(now);
        exercise.setUpdatedAt(now);

        return new ExerciseResponse(exerciseRepository.save(exercise));
    }

    public ExerciseResponse updateTrainerExercise(Long exerciseId, @Valid UpdateExerciseRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        Exercise exercise = getExerciseOrThrow(exerciseId, trainer);

        exercise.setName(TextUtils.trimToEmpty(request.name()));
        exercise.setDetails(TextUtils.trimToNull(request.details()));
        exercise.setThumbnailUrl(TextUtils.trimToNull(request.thumbnailUrl()));
        exercise.setDemoVideoUrl(TextUtils.trimToNull(request.demoVideoUrl()));
        exercise.setMetadataJson(request.metadataJson());
        exercise.setUpdatedAt(LocalDateTime.now());

        return new ExerciseResponse(exerciseRepository.save(exercise));
    }

    public void archiveExercise(Long exerciseId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        Exercise exercise = getExerciseOrThrow(exerciseId, trainer);

        exercise.setArchived(true);
        exercise.setUpdatedAt(LocalDateTime.now());
        exerciseRepository.save(exercise);
    }

    public List<ExerciseResponse> getAvailableExercises() {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        return exerciseRepository.findAvailableForTrainer(trainer.getId()).stream()
                .map(ExerciseResponse::new)
                .toList();
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Validation
    //
    //---------------------------------------------------------------------------------------------------------

    private Exercise getExerciseOrThrow(Long exerciseId, Trainer trainer) {
        return exerciseRepository.findByIdAndTrainer_Id(exerciseId, trainer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise with id " + exerciseId + " not found"));
    }
}
