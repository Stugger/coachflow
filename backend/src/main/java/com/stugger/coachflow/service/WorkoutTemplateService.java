package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.workout.CreateWorkoutTemplateRequest;
import com.stugger.coachflow.api.dto.request.workout.UpdateWorkoutTemplateRequest;
import com.stugger.coachflow.api.dto.request.workout.WorkoutItemExerciseRequest;
import com.stugger.coachflow.api.dto.request.workout.WorkoutItemRequest;
import com.stugger.coachflow.api.dto.request.workout.WorkoutSectionRequest;
import com.stugger.coachflow.api.dto.response.workout.WorkoutTemplateResponse;
import com.stugger.coachflow.api.dto.response.workout.WorkoutTemplateSummaryResponse;
import com.stugger.coachflow.entity.exercise.Exercise;
import com.stugger.coachflow.entity.exercise.ExerciseVisibility;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.entity.workout.WorkoutTemplate;
import com.stugger.coachflow.entity.workout.WorkoutTemplateItem;
import com.stugger.coachflow.entity.workout.WorkoutTemplateItemExercise;
import com.stugger.coachflow.entity.workout.WorkoutItemType;
import com.stugger.coachflow.entity.workout.WorkoutTemplateSection;
import com.stugger.coachflow.repository.exercise.ExerciseRepository;
import com.stugger.coachflow.repository.workout.WorkoutTemplateRepository;
import com.stugger.coachflow.security.CurrentTrainerService;
import com.stugger.coachflow.util.TextUtils;
import com.stugger.coachflow.validation.WorkoutStructureValidator;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

/**
 * @author Jake
 * @since June 15th, 2026
 */
@Service
public class WorkoutTemplateService {

    private final WorkoutTemplateRepository workoutTemplateRepository;
    private final CurrentTrainerService currentTrainerService;
    private final ExerciseRepository exerciseRepository;

    private final WorkoutStructureValidator workoutStructureValidator;

    public WorkoutTemplateService(WorkoutTemplateRepository workoutTemplateRepository, CurrentTrainerService currentTrainerService, ExerciseRepository exerciseRepository,
                                  WorkoutStructureValidator workoutStructureValidator) {
        this.workoutTemplateRepository = workoutTemplateRepository;
        this.currentTrainerService = currentTrainerService;
        this.exerciseRepository = exerciseRepository;
        this.workoutStructureValidator = workoutStructureValidator;
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Workout Templates
    //
    //---------------------------------------------------------------------------------------------------------

    @Transactional
    public WorkoutTemplateResponse createWorkoutTemplate(@Valid CreateWorkoutTemplateRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        LocalDateTime now = LocalDateTime.now();

        WorkoutTemplate workoutTemplate = new WorkoutTemplate();
        workoutTemplate.setTrainer(trainer);
        workoutTemplate.setName(TextUtils.trimToEmpty(request.name()));
        workoutTemplate.setDescription(TextUtils.trimToNull(request.description()));
        workoutTemplate.setArchived(false);
        workoutTemplate.setCreatedAt(now);
        workoutTemplate.setUpdatedAt(now);

        setSections(workoutTemplate, request.sections(), trainer.getId(), now);

        return new WorkoutTemplateResponse(workoutTemplateRepository.save(workoutTemplate));
    }

    @Transactional
    public WorkoutTemplateResponse updateWorkoutTemplate(Long workoutTemplateId, @Valid UpdateWorkoutTemplateRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        WorkoutTemplate workoutTemplate = getWorkoutTemplateOrThrow(workoutTemplateId, trainer);

        LocalDateTime now = LocalDateTime.now();

        workoutTemplate.setName(TextUtils.trimToEmpty(request.name()));
        workoutTemplate.setDescription(TextUtils.trimToNull(request.description()));
        workoutTemplate.setUpdatedAt(now);

        workoutTemplate.getSections().clear();
        workoutTemplateRepository.saveAndFlush(workoutTemplate);
        setSections(workoutTemplate, request.sections(), trainer.getId(), now);

        return new WorkoutTemplateResponse(workoutTemplateRepository.save(workoutTemplate));
    }

    @Transactional
    public void archiveWorkoutTemplate(Long workoutTemplateId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        WorkoutTemplate workoutTemplate = getWorkoutTemplateOrThrow(workoutTemplateId, trainer);

        workoutTemplate.setArchived(true);
        workoutTemplate.setUpdatedAt(LocalDateTime.now());
        workoutTemplateRepository.save(workoutTemplate);
    }

    @Transactional(readOnly = true)
    public WorkoutTemplateResponse getWorkoutTemplate(Long workoutTemplateId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();

        return new WorkoutTemplateResponse(getWorkoutTemplateOrThrow(workoutTemplateId, trainer));
    }

    @Transactional(readOnly = true)
    public List<WorkoutTemplateSummaryResponse> getWorkoutTemplateSummaries() {
        Trainer trainer = currentTrainerService.getCurrentTrainer();

        return workoutTemplateRepository
                .findByTrainerIdAndArchivedFalseOrderByUpdatedAtDesc(trainer.getId())
                .stream()
                .map(this::toWorkoutTemplateSummary)
                .toList();
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Mapping
    //
    //---------------------------------------------------------------------------------------------------------

    private WorkoutTemplateSummaryResponse toWorkoutTemplateSummary(WorkoutTemplate workoutTemplate) {
        Set<String> exerciseNames = new LinkedHashSet<>();
        int exerciseCount = 0;

        for (WorkoutTemplateSection section : workoutTemplate.getSections()) {
            for (WorkoutTemplateItem item : section.getItems()) {
                if (item.getExercise() != null) {
                    exerciseCount++;
                    exerciseNames.add(getExerciseDisplayName(item.getName(), item.getExercise()));
                    continue;
                }
                for (WorkoutTemplateItemExercise itemExercise : item.getItemExercises()) {
                    exerciseCount++;
                    exerciseNames.add(getExerciseDisplayName(itemExercise.getName(), itemExercise.getExercise()));
                }
            }
        }

        return new WorkoutTemplateSummaryResponse(
                workoutTemplate,
                List.copyOf(exerciseNames),
                exerciseCount
        );
    }

    private String getExerciseDisplayName(String nameOverride, Exercise exercise) {
        String trimmedOverride = TextUtils.trimToNull(nameOverride);

        return trimmedOverride != null
                ? trimmedOverride
                : exercise.getName();
    }

    private void setSections(WorkoutTemplate workoutTemplate, List<WorkoutSectionRequest> sectionRequests, Long trainerId, LocalDateTime now) {
        workoutStructureValidator.validate(sectionRequests);

        if (sectionRequests == null) {
            return;
        }

        for (WorkoutSectionRequest sectionRequest : sectionRequests) {
            WorkoutTemplateSection section = new WorkoutTemplateSection();
            section.setWorkoutTemplate(workoutTemplate);
            section.setPosition(sectionRequest.position());
            section.setName(TextUtils.trimToNull(sectionRequest.name()));
            section.setSectionType(sectionRequest.sectionType());
            section.setNotes(TextUtils.trimToNull(sectionRequest.notes()));
            section.setCreatedAt(now);
            section.setUpdatedAt(now);

            setItems(section, sectionRequest.items(), trainerId, now);
            workoutTemplate.getSections().add(section);
        }
    }

    private void setItems(WorkoutTemplateSection section, List<WorkoutItemRequest> itemRequests, Long trainerId, LocalDateTime now) {
        if (itemRequests == null) {
            return;
        }

        for (WorkoutItemRequest itemRequest : itemRequests) {
            WorkoutTemplateItem item = new WorkoutTemplateItem();
            item.setWorkoutTemplateSection(section);
            item.setPosition(itemRequest.position());
            item.setItemType(itemRequest.itemType());
            item.setExercise(resolveDirectExercise(itemRequest, trainerId));
            item.setName(TextUtils.trimToNull(itemRequest.name()));
            item.setRounds(itemRequest.rounds());
            item.setNotes(TextUtils.trimToNull(itemRequest.notes()));
            item.setConfigJson(itemRequest.configJson());
            item.setCreatedAt(now);
            item.setUpdatedAt(now);

            setItemExercises(item, itemRequest.itemExercises(), trainerId, now);
            section.getItems().add(item);
        }
    }

    private void setItemExercises(WorkoutTemplateItem item, List<WorkoutItemExerciseRequest> itemExerciseRequests, Long trainerId, LocalDateTime now) {
        if (itemExerciseRequests == null) {
            return;
        }

        for (WorkoutItemExerciseRequest itemExerciseRequest : itemExerciseRequests) {
            WorkoutTemplateItemExercise itemExercise = new WorkoutTemplateItemExercise();
            itemExercise.setWorkoutTemplateItem(item);
            itemExercise.setExercise(getAvailableExerciseOrThrow(itemExerciseRequest.exerciseId(), trainerId));
            itemExercise.setPosition(itemExerciseRequest.position());
            itemExercise.setName(TextUtils.trimToNull(itemExerciseRequest.name()));
            itemExercise.setNotes(TextUtils.trimToNull(itemExerciseRequest.notes()));
            itemExercise.setConfigJson(itemExerciseRequest.configJson());
            itemExercise.setCreatedAt(now);
            itemExercise.setUpdatedAt(now);
            item.getItemExercises().add(itemExercise);
        }
    }

    private Exercise resolveDirectExercise(WorkoutItemRequest itemRequest, Long trainerId) {
        if (itemRequest.itemType() != WorkoutItemType.EXERCISE) {
            return null;
        }
        return getAvailableExerciseOrThrow(itemRequest.exerciseId(), trainerId);
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Validation
    //
    //---------------------------------------------------------------------------------------------------------

    private WorkoutTemplate getWorkoutTemplateOrThrow(Long workoutTemplateId, Trainer trainer) {
        return workoutTemplateRepository.findByIdAndTrainer_Id(workoutTemplateId, trainer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout template with id " + workoutTemplateId + " not found"));
    }

    private Exercise getAvailableExerciseOrThrow(Long exerciseId, Long trainerId) {
        if (exerciseId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exercise is required.");
        }

        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise with id " + exerciseId + " not found"));

        if (Boolean.TRUE.equals(exercise.getArchived())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exercise with id " + exerciseId + " is archived");
        }
        if (exercise.getVisibility() == ExerciseVisibility.GLOBAL) {
            return exercise;
        }
        if (exercise.getTrainer() != null && exercise.getTrainer().getId().equals(trainerId)) {
            return exercise;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Exercise not found.");
    }

}
