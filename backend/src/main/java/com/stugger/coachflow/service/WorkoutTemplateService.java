package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.workout.CreateWorkoutTemplateRequest;
import com.stugger.coachflow.api.dto.request.workout.UpdateWorkoutTemplateRequest;
import com.stugger.coachflow.api.dto.request.workout.WorkoutTemplateItemExerciseRequest;
import com.stugger.coachflow.api.dto.request.workout.WorkoutTemplateItemRequest;
import com.stugger.coachflow.api.dto.request.workout.WorkoutTemplateSectionRequest;
import com.stugger.coachflow.api.dto.response.workout.WorkoutTemplateResponse;
import com.stugger.coachflow.entity.exercise.Exercise;
import com.stugger.coachflow.entity.exercise.ExerciseVisibility;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.entity.workout.WorkoutTemplate;
import com.stugger.coachflow.entity.workout.WorkoutTemplateItem;
import com.stugger.coachflow.entity.workout.WorkoutTemplateItemExercise;
import com.stugger.coachflow.entity.workout.WorkoutTemplateItemType;
import com.stugger.coachflow.entity.workout.WorkoutTemplateSection;
import com.stugger.coachflow.repository.exercise.ExerciseRepository;
import com.stugger.coachflow.repository.person.TrainerRepository;
import com.stugger.coachflow.repository.workout.WorkoutTemplateRepository;
import com.stugger.coachflow.util.TextUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @author Jake
 * @since June 15th, 2026
 */
@Service
public class WorkoutTemplateService {

    private final WorkoutTemplateRepository workoutTemplateRepository;
    private final TrainerRepository trainerRepository;
    private final ExerciseRepository exerciseRepository;

    public WorkoutTemplateService(WorkoutTemplateRepository workoutTemplateRepository, TrainerRepository trainerRepository, ExerciseRepository exerciseRepository) {
        this.workoutTemplateRepository = workoutTemplateRepository;
        this.trainerRepository = trainerRepository;
        this.exerciseRepository = exerciseRepository;
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Workout Templates
    //
    //---------------------------------------------------------------------------------------------------------

    @Transactional
    public WorkoutTemplateResponse createWorkoutTemplate(@Valid CreateWorkoutTemplateRequest request) {
        Trainer trainer = getTrainerOrThrow(request.trainerId());
        LocalDateTime now = LocalDateTime.now();

        WorkoutTemplate workoutTemplate = new WorkoutTemplate();
        workoutTemplate.setTrainer(trainer);
        workoutTemplate.setName(TextUtils.trimToEmpty(request.name()));
        workoutTemplate.setDescription(TextUtils.trimToNull(request.description()));
        workoutTemplate.setArchived(false);
        workoutTemplate.setCreatedAt(now);
        workoutTemplate.setUpdatedAt(now);

        setSections(workoutTemplate, request.sections(), request.trainerId(), now);

        return new WorkoutTemplateResponse(workoutTemplateRepository.save(workoutTemplate));
    }

    @Transactional
    public WorkoutTemplateResponse updateWorkoutTemplate(Long workoutTemplateId, @Valid UpdateWorkoutTemplateRequest request) {
        getTrainerOrThrow(request.trainerId());
        WorkoutTemplate workoutTemplate = getWorkoutTemplateOrThrow(workoutTemplateId);
        validateTrainerOwnsTemplate(workoutTemplate, request.trainerId());

        workoutTemplate.setName(TextUtils.trimToEmpty(request.name()));
        workoutTemplate.setDescription(TextUtils.trimToNull(request.description()));
        workoutTemplate.setUpdatedAt(LocalDateTime.now());

        workoutTemplate.getSections().clear();
        workoutTemplateRepository.saveAndFlush(workoutTemplate);
        setSections(workoutTemplate, request.sections(), request.trainerId(), LocalDateTime.now());

        return new WorkoutTemplateResponse(workoutTemplateRepository.save(workoutTemplate));
    }

    @Transactional
    public void archiveWorkoutTemplate(Long workoutTemplateId, Long trainerId) {
        getTrainerOrThrow(trainerId);
        WorkoutTemplate workoutTemplate = getWorkoutTemplateOrThrow(workoutTemplateId);
        validateTrainerOwnsTemplate(workoutTemplate, trainerId);

        workoutTemplate.setArchived(true);
        workoutTemplate.setUpdatedAt(LocalDateTime.now());
        workoutTemplateRepository.save(workoutTemplate);
    }

    @Transactional(readOnly = true)
    public WorkoutTemplateResponse getWorkoutTemplate(Long workoutTemplateId, Long trainerId) {
        getTrainerOrThrow(trainerId);
        WorkoutTemplate workoutTemplate = getWorkoutTemplateOrThrow(workoutTemplateId);
        validateTrainerOwnsTemplate(workoutTemplate, trainerId);

        return new WorkoutTemplateResponse(workoutTemplate);
    }

    @Transactional(readOnly = true)
    public List<WorkoutTemplateResponse> getTrainerWorkoutTemplates(Long trainerId) {
        getTrainerOrThrow(trainerId);

        return workoutTemplateRepository.findByTrainerIdAndArchivedFalseOrderByNameAsc(trainerId).stream()
                .map(WorkoutTemplateResponse::new)
                .toList();
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Mapping
    //
    //---------------------------------------------------------------------------------------------------------

    private void setSections(WorkoutTemplate workoutTemplate, List<WorkoutTemplateSectionRequest> sectionRequests, Long trainerId, LocalDateTime now) {
        validateSectionPositions(sectionRequests);

        if (sectionRequests == null) {
            return;
        }

        for (WorkoutTemplateSectionRequest sectionRequest : sectionRequests) {
            if (sectionRequest.sectionType() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Section type is required.");
            }

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

    private void setItems(WorkoutTemplateSection section, List<WorkoutTemplateItemRequest> itemRequests, Long trainerId, LocalDateTime now) {
        validateItemPositions(itemRequests);

        if (itemRequests == null) {
            return;
        }

        for (WorkoutTemplateItemRequest itemRequest : itemRequests) {
            validateItemStructure(itemRequest);

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

    private void setItemExercises(WorkoutTemplateItem item, List<WorkoutTemplateItemExerciseRequest> itemExerciseRequests, Long trainerId, LocalDateTime now) {
        validateItemExercisePositions(itemExerciseRequests);

        if (itemExerciseRequests == null) {
            return;
        }

        for (WorkoutTemplateItemExerciseRequest itemExerciseRequest : itemExerciseRequests) {
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

    private Exercise resolveDirectExercise(WorkoutTemplateItemRequest itemRequest, Long trainerId) {
        if (itemRequest.itemType() != WorkoutTemplateItemType.EXERCISE) {
            return null;
        }
        return getAvailableExerciseOrThrow(itemRequest.exerciseId(), trainerId);
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

    private WorkoutTemplate getWorkoutTemplateOrThrow(Long workoutTemplateId) {
        return workoutTemplateRepository.findById(workoutTemplateId)
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
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only use global exercises or exercises in your own library.");
    }

    private void validateTrainerOwnsTemplate(WorkoutTemplate workoutTemplate, Long trainerId) {
        if (!workoutTemplate.getTrainer().getId().equals(trainerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only modify workout templates in your own library.");
        }
    }

    private void validateSectionPositions(List<WorkoutTemplateSectionRequest> sections) {
        if (sections == null) {
            return;
        }

        Set<Integer> positions = new HashSet<>();
        for (WorkoutTemplateSectionRequest section : sections) {
            validatePositivePosition(section.position(), "Section position");
            if (!positions.add(section.position())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Section positions must be unique within a workout template.");
            }
        }
    }

    private void validateItemPositions(List<WorkoutTemplateItemRequest> items) {
        if (items == null) {
            return;
        }

        Set<Integer> positions = new HashSet<>();
        for (WorkoutTemplateItemRequest item : items) {
            validatePositivePosition(item.position(), "Item position");
            if (!positions.add(item.position())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item positions must be unique within a section.");
            }
        }
    }

    private void validateItemExercisePositions(List<WorkoutTemplateItemExerciseRequest> itemExercises) {
        if (itemExercises == null) {
            return;
        }

        Set<Integer> positions = new HashSet<>();
        for (WorkoutTemplateItemExerciseRequest itemExercise : itemExercises) {
            validatePositivePosition(itemExercise.position(), "Item exercise position");
            if (!positions.add(itemExercise.position())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item exercise positions must be unique within an item.");
            }
        }
    }

    private void validatePositivePosition(Integer position, String label) {
        if (position == null || position <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " must be positive.");
        }
    }

    private void validateItemStructure(WorkoutTemplateItemRequest item) {
        if (item.itemType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item type is required.");
        }

        int itemExerciseCount = item.itemExercises() == null ? 0 : item.itemExercises().size();

        switch (item.itemType()) {
            case EXERCISE -> validateExerciseItem(item, itemExerciseCount);
            case SUPERSET -> validateGroupedItem(item, itemExerciseCount, 2, 2, "Supersets");
            case TRISET -> validateGroupedItem(item, itemExerciseCount, 3, 3, "Trisets");
            case CIRCUIT -> validateGroupedItem(item, itemExerciseCount, 2, null, "Circuits");
        }
    }

    private void validateExerciseItem(WorkoutTemplateItemRequest item, int itemExerciseCount) {
        if (item.exerciseId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exercise items require exerciseId.");
        }
        if (itemExerciseCount > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exercise items must not include child item exercises.");
        }
        if (item.rounds() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exercise items must not set rounds.");
        }
    }

    private void validateGroupedItem(WorkoutTemplateItemRequest item, int itemExerciseCount, int minimumExercises, Integer exactExercises, String label) {
        if (item.exerciseId() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " must not set exerciseId.");
        }
        if (item.rounds() == null || item.rounds() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " require rounds.");
        }
        if (exactExercises != null && itemExerciseCount != exactExercises) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " require exactly " + exactExercises + " child exercises.");
        }
        if (exactExercises == null && itemExerciseCount < minimumExercises) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " require at least " + minimumExercises + " child exercises.");
        }
    }
}
