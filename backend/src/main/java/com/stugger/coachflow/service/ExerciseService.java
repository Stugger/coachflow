package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.exercise.CopyExerciseRequest;
import com.stugger.coachflow.api.dto.request.exercise.CreateExerciseRequest;
import com.stugger.coachflow.api.dto.request.exercise.UpdateExerciseRequest;
import com.stugger.coachflow.api.dto.response.exercise.ExerciseResponse;
import com.stugger.coachflow.entity.exercise.Exercise;
import com.stugger.coachflow.entity.exercise.ExerciseVisibility;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.repository.exercise.ExerciseRepository;
import com.stugger.coachflow.repository.person.TrainerRepository;
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
    private final TrainerRepository trainerRepository;

    public ExerciseService(ExerciseRepository exerciseRepository, TrainerRepository trainerRepository) {
        this.exerciseRepository = exerciseRepository;
        this.trainerRepository = trainerRepository;
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Exercises
    //
    //---------------------------------------------------------------------------------------------------------

    public ExerciseResponse createTrainerExercise(@Valid CreateExerciseRequest request) {
        Trainer trainer = getTrainerOrThrow(request.trainerId());
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
        getTrainerOrThrow(request.trainerId());
        Exercise exercise = getExerciseOrThrow(exerciseId);
        validateTrainerCanModifyExercise(exercise, request.trainerId());

        exercise.setName(TextUtils.trimToEmpty(request.name()));
        exercise.setDetails(TextUtils.trimToNull(request.details()));
        exercise.setThumbnailUrl(TextUtils.trimToNull(request.thumbnailUrl()));
        exercise.setDemoVideoUrl(TextUtils.trimToNull(request.demoVideoUrl()));
        exercise.setMetadataJson(request.metadataJson());
        exercise.setUpdatedAt(LocalDateTime.now());

        return new ExerciseResponse(exerciseRepository.save(exercise));
    }

    public ExerciseResponse copyExercise(Long exerciseId, @Valid CopyExerciseRequest request) {
        Trainer trainer = getTrainerOrThrow(request.trainerId());
        Exercise source = getExerciseOrThrow(exerciseId);

        if (Boolean.TRUE.equals(source.getArchived())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archived exercises cannot be copied.");
        }

        LocalDateTime now = LocalDateTime.now();
        Exercise copy = new Exercise();
        copy.setTrainer(trainer);
        copy.setVisibility(ExerciseVisibility.TRAINER);
        copy.setName(source.getName());
        copy.setDetails(source.getDetails());
        copy.setThumbnailUrl(source.getThumbnailUrl());
        copy.setDemoVideoUrl(source.getDemoVideoUrl());
        copy.setMetadataJson(source.getMetadataJson());
        copy.setArchived(false);
        copy.setCreatedAt(now);
        copy.setUpdatedAt(now);

        return new ExerciseResponse(exerciseRepository.save(copy));
    }

    public void archiveExercise(Long exerciseId, Long trainerId) {
        getTrainerOrThrow(trainerId);
        Exercise exercise = getExerciseOrThrow(exerciseId);
        validateTrainerCanModifyExercise(exercise, trainerId);

        exercise.setArchived(true);
        exercise.setUpdatedAt(LocalDateTime.now());
        exerciseRepository.save(exercise);
    }

    public List<ExerciseResponse> getAvailableExercises(Long trainerId) {
        getTrainerOrThrow(trainerId);

        return exerciseRepository.findAvailableForTrainer(trainerId).stream()
                .map(ExerciseResponse::new)
                .toList();
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Validation
    //
    //---------------------------------------------------------------------------------------------------------

    private Trainer getTrainerOrThrow(Long trainerId) {
        return trainerRepository.findById(trainerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer with id " + trainerId + " not found"));
    }

    private Exercise getExerciseOrThrow(Long exerciseId) {
        return exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise with id " + exerciseId + " not found"));
    }

    private void validateTrainerCanModifyExercise(Exercise exercise, Long trainerId) {
        if (exercise.getVisibility() == ExerciseVisibility.GLOBAL) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Global exercises cannot be edited directly. Copy it to your library first.");
        }
        if (exercise.getTrainer() == null || !exercise.getTrainer().getId().equals(trainerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only modify exercises in your own library.");
        }
    }
}
