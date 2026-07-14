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
import com.stugger.coachflow.entity.workout.*;
import com.stugger.coachflow.repository.exercise.ExerciseRepository;
import com.stugger.coachflow.repository.workout.WorkoutTemplateItemRepository;
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
    private final WorkoutTemplateItemRepository workoutTemplateItemRepository;
    private final CurrentTrainerService currentTrainerService;
    private final ExerciseRepository exerciseRepository;

    private final WorkoutStructureValidator workoutStructureValidator;

    public WorkoutTemplateService(WorkoutTemplateRepository workoutTemplateRepository, WorkoutTemplateItemRepository workoutTemplateItemRepository,
                                  CurrentTrainerService currentTrainerService, ExerciseRepository exerciseRepository,
                                  WorkoutStructureValidator workoutStructureValidator) {
        this.workoutTemplateRepository = workoutTemplateRepository;
        this.workoutTemplateItemRepository = workoutTemplateItemRepository;
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

        reconcileSections(workoutTemplate, request.sections(), trainer.getId(), now);

        return new WorkoutTemplateResponse(workoutTemplateRepository.saveAndFlush(workoutTemplate));
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
        return trimmedOverride != null ? trimmedOverride : exercise.getName();
    }

    /* Structure Update */

    private void reconcileSections(WorkoutTemplate workoutTemplate, List<WorkoutSectionRequest> sectionRequests, Long trainerId, LocalDateTime now) {
        workoutStructureValidator.validate(sectionRequests);

        List<WorkoutSectionRequest> requests = sectionRequests == null ? List.of() : sectionRequests;

        Map<Long, WorkoutTemplateSection> existingSectionsById = new HashMap<>();
        Map<Long, WorkoutTemplateItem> existingItemsById = new HashMap<>();

        for (WorkoutTemplateSection section : workoutTemplate.getSections()) {
            existingSectionsById.put(section.getId(), section);
            for (WorkoutTemplateItem item : section.getItems()) {
                existingItemsById.put(item.getId(), item);
            }
        }

        Set<Long> retainedSectionIds = new HashSet<>();
        List<WorkoutTemplateSection> newSections = new ArrayList<>();

        /*
         * LinkedHashMap preserves request order while associating each resolved
         * section entity with the items it should contain after reconciliation.
         */
        Map<WorkoutTemplateSection, List<WorkoutItemRequest>> itemRequestsBySection = new LinkedHashMap<>();

        for (WorkoutSectionRequest sectionRequest : requests) {
            WorkoutTemplateSection section;
            if (sectionRequest.id() == null) {
                section = new WorkoutTemplateSection();
                section.setWorkoutTemplate(workoutTemplate);
                section.setCreatedAt(now);
                newSections.add(section);
            } else {
                if (!retainedSectionIds.add(sectionRequest.id())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Section with id " + sectionRequest.id() + " was included more than once.");
                }
                section = existingSectionsById.get(sectionRequest.id());
                if (section == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Section with id " + sectionRequest.id() + " does not belong to workout template with id " + workoutTemplate.getId() + ".");
                }
            }
            updateSection(section, sectionRequest, now);
            itemRequestsBySection.put(section, sectionRequest.items() == null ? List.of() : sectionRequest.items());
        }

        Set<WorkoutTemplateItem> retainedItems = reconcileItems(workoutTemplate, itemRequestsBySection, existingItemsById, trainerId, now);

        /*
         * Items omitted from the entire request are actual deletions.
         * Items assigned to another section remain retained and are merely removed from the old section's in-memory collection.
         */
        List<WorkoutTemplateItem> removedItems = existingItemsById.values().stream()
                .filter(item -> !retainedItems.contains(item))
                .toList();

        Set<WorkoutTemplateItem> removedItemSet = new HashSet<>(removedItems);

        for (WorkoutTemplateSection existingSection : workoutTemplate.getSections()) {
            existingSection.getItems().removeIf(item -> retainedItems.contains(item) && item.getWorkoutTemplateSection() != existingSection);
            existingSection.getItems().removeIf(removedItemSet::contains);
        }
        if (!removedItems.isEmpty()) {
            workoutTemplateItemRepository.deleteAll(removedItems);
        }
        workoutTemplate.getSections().removeIf(section -> !retainedSectionIds.contains(section.getId()));
        workoutTemplate.getSections().addAll(newSections);
        workoutTemplate.getSections().sort(Comparator.comparing(WorkoutTemplateSection::getPosition));
    }

    private void updateSection(WorkoutTemplateSection section, WorkoutSectionRequest sectionRequest, LocalDateTime now) {
        section.setPosition(sectionRequest.position());
        section.setName(TextUtils.trimToNull(sectionRequest.name()));
        section.setSectionType(sectionRequest.sectionType());
        section.setNotes(TextUtils.trimToNull(sectionRequest.notes()));
        section.setUpdatedAt(now);
    }

    private Set<WorkoutTemplateItem> reconcileItems(WorkoutTemplate workoutTemplate, Map<WorkoutTemplateSection, List<WorkoutItemRequest>> itemRequestsBySection, Map<Long, WorkoutTemplateItem> existingItemsById,
                                                  Long trainerId, LocalDateTime now) {
        Set<Long> retainedItemIds = new HashSet<>();
        Set<WorkoutTemplateItem> retainedItems = new HashSet<>();

        for (Map.Entry<WorkoutTemplateSection, List<WorkoutItemRequest>> entry : itemRequestsBySection.entrySet()) {
            WorkoutTemplateSection targetSection = entry.getKey();
            List<WorkoutTemplateItem> desiredItems = new ArrayList<>();

            for (WorkoutItemRequest itemRequest : entry.getValue()) {
                WorkoutTemplateItem item;
                if (itemRequest.id() == null) {
                    item = new WorkoutTemplateItem();
                    item.setWorkoutTemplateSection(targetSection);
                    item.setCreatedAt(now);
                } else {
                    if (!retainedItemIds.add(itemRequest.id())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item with id " + itemRequest.id() + " was included more than once.");
                    }
                    item = existingItemsById.get(itemRequest.id());
                    if (item == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item with id " + itemRequest.id() + " does not belong to workout template with id " + workoutTemplate.getId() + ".");
                    }
                    /*
                     * The owning side of the relationship determines the database foreign key.
                     * Changing this parent moves the existing item.
                     */
                    item.setWorkoutTemplateSection(targetSection);
                }
                updateItem(item, itemRequest, trainerId, now);
                desiredItems.add(item);
                retainedItems.add(item);
            }
            /*
             * orphanRemoval is intentionally disabled for this collection.
             * We can therefore rebuild the in-memory membership safely while preserving entities that moved from another section.
             */
            targetSection.getItems().clear();
            targetSection.getItems().addAll(desiredItems);
        }

        return retainedItems;
    }

    private void updateItem(WorkoutTemplateItem item, WorkoutItemRequest itemRequest, Long trainerId, LocalDateTime now) {
        item.setPosition(itemRequest.position());
        item.setItemType(itemRequest.itemType());
        item.setExercise(resolveDirectExercise(item, itemRequest, trainerId));
        item.setName(TextUtils.trimToNull(itemRequest.name()));
        item.setRounds(itemRequest.rounds());
        item.setNotes(TextUtils.trimToNull(itemRequest.notes()));
        item.setConfigJson(itemRequest.configJson());
        item.setUpdatedAt(now);
        reconcileItemExercises(item, itemRequest.itemExercises(), trainerId, now);
    }

    private void reconcileItemExercises(WorkoutTemplateItem item, List<WorkoutItemExerciseRequest> itemExerciseRequests, Long trainerId, LocalDateTime now) {
        List<WorkoutItemExerciseRequest> requests = itemExerciseRequests == null ? List.of() : itemExerciseRequests;

        Map<Long, WorkoutTemplateItemExercise> existingItemExercisesById = new HashMap<>();

        for (WorkoutTemplateItemExercise itemExercise : item.getItemExercises()) {
            existingItemExercisesById.put(itemExercise.getId(), itemExercise);
        }

        Set<Long> retainedItemExerciseIds = new HashSet<>();
        List<WorkoutTemplateItemExercise> newItemExercises = new ArrayList<>();

        for (WorkoutItemExerciseRequest itemExerciseRequest : requests) {
            WorkoutTemplateItemExercise itemExercise;
            if (itemExerciseRequest.id() == null) {
                itemExercise = new WorkoutTemplateItemExercise();
                itemExercise.setWorkoutTemplateItem(item);
                itemExercise.setCreatedAt(now);
                newItemExercises.add(itemExercise);
            } else {
                if (!retainedItemExerciseIds.add(itemExerciseRequest.id())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item exercise with id " + itemExerciseRequest.id() + " was included more than once.");
                }
                itemExercise = existingItemExercisesById.get(
                        itemExerciseRequest.id()
                );
                if (itemExercise == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item exercise with id " + itemExerciseRequest.id() + " does not belong to workout item with id " + item.getId() + ".");
                }
            }
            updateItemExercise(itemExercise, itemExerciseRequest, trainerId, now);
        }
        /*
         * Existing stack exercises omitted from the request are deleted through orphan removal.
         * Exercises that remain retain their database identities.
         */
        item.getItemExercises().removeIf(itemExercise -> itemExercise.getId() != null && !retainedItemExerciseIds.contains(itemExercise.getId()));
        item.getItemExercises().addAll(newItemExercises);
        item.getItemExercises().sort(Comparator.comparing(WorkoutTemplateItemExercise::getPosition));
    }

    private void updateItemExercise(WorkoutTemplateItemExercise itemExercise, WorkoutItemExerciseRequest itemExerciseRequest, Long trainerId, LocalDateTime now) {
        itemExercise.setExercise(resolveStackExercise(itemExercise, itemExerciseRequest, trainerId));
        itemExercise.setPosition(itemExerciseRequest.position());
        itemExercise.setName(TextUtils.trimToNull(itemExerciseRequest.name()));
        itemExercise.setNotes(TextUtils.trimToNull(itemExerciseRequest.notes()));
        itemExercise.setConfigJson(itemExerciseRequest.configJson());
        itemExercise.setUpdatedAt(now);
    }

    /* Structure Create */

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
            item.setExercise(resolveDirectExercise(item, itemRequest, trainerId));
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
            itemExercise.setExercise(resolveStackExercise(itemExercise, itemExerciseRequest, trainerId));
            itemExercise.setPosition(itemExerciseRequest.position());
            itemExercise.setName(TextUtils.trimToNull(itemExerciseRequest.name()));
            itemExercise.setNotes(TextUtils.trimToNull(itemExerciseRequest.notes()));
            itemExercise.setConfigJson(itemExerciseRequest.configJson());
            itemExercise.setCreatedAt(now);
            itemExercise.setUpdatedAt(now);
            item.getItemExercises().add(itemExercise);
        }
    }

    /*
     * Exercise Resolve:
     * An exercise may be archived after the workout was created.
     * Keeping that existing reference is allowed, while selecting a different exercise must pass the normal availability checks.
     */

    private Exercise resolveDirectExercise(AbstractWorkoutItem existingItem, WorkoutItemRequest itemRequest, Long trainerId) {
        if (itemRequest.itemType() != WorkoutItemType.EXERCISE) {
            return null;
        }
        if (existingItem.getExercise() != null && Objects.equals(existingItem.getExercise().getId(), itemRequest.exerciseId())) {
            return existingItem.getExercise();
        }
        return getAvailableExerciseOrThrow(itemRequest.exerciseId(), trainerId);
    }

    private Exercise resolveStackExercise(AbstractWorkoutItemExercise existingItemExercise, WorkoutItemExerciseRequest itemExerciseRequest, Long trainerId) {
        if (existingItemExercise.getExercise() != null && Objects.equals(existingItemExercise.getExercise().getId(), itemExerciseRequest.exerciseId())) {
            return existingItemExercise.getExercise();
        }
        return getAvailableExerciseOrThrow(itemExerciseRequest.exerciseId(), trainerId);
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
