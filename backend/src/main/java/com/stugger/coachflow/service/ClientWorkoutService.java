package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.workout.*;
import com.stugger.coachflow.api.dto.response.workout.ClientWorkoutResponse;
import com.stugger.coachflow.entity.exercise.Exercise;
import com.stugger.coachflow.entity.exercise.ExerciseVisibility;
import com.stugger.coachflow.entity.person.Client;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.entity.workout.*;
import com.stugger.coachflow.repository.exercise.ExerciseRepository;
import com.stugger.coachflow.repository.person.ClientRepository;
import com.stugger.coachflow.repository.workout.ClientWorkoutItemRepository;
import com.stugger.coachflow.repository.workout.ClientWorkoutRepository;
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
 * @since June 30th, 2026
 */
@Service
public class ClientWorkoutService {

    private final ClientWorkoutRepository clientWorkoutRepository;
    private final WorkoutTemplateRepository workoutTemplateRepository;
    private final ClientWorkoutItemRepository clientWorkoutItemRepository;
    private final ClientRepository clientRepository;
    private final CurrentTrainerService currentTrainerService;
    private final ExerciseRepository exerciseRepository;

    private final WorkoutStructureValidator workoutStructureValidator;

    public ClientWorkoutService(ClientWorkoutRepository clientWorkoutRepository, ClientWorkoutItemRepository clientWorkoutItemRepository, WorkoutTemplateRepository workoutTemplateRepository,
                                ClientRepository clientRepository, CurrentTrainerService currentTrainerService, ExerciseRepository exerciseRepository,
                                WorkoutStructureValidator workoutStructureValidator) {
        this.clientWorkoutRepository = clientWorkoutRepository;
        this.clientWorkoutItemRepository = clientWorkoutItemRepository;
        this.workoutTemplateRepository = workoutTemplateRepository;
        this.clientRepository = clientRepository;
        this.currentTrainerService = currentTrainerService;
        this.exerciseRepository = exerciseRepository;
        this.workoutStructureValidator = workoutStructureValidator;
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Client Workouts
    //
    //---------------------------------------------------------------------------------------------------------

    @Transactional
    public ClientWorkoutResponse updateClientWorkout(Long clientWorkoutId, @Valid UpdateClientWorkoutRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        ClientWorkout clientWorkout = getClientWorkoutOrThrow(clientWorkoutId, trainer);

        LocalDateTime now = LocalDateTime.now();

        clientWorkout.setName(TextUtils.trimToEmpty(request.name()));
        clientWorkout.setDescription(TextUtils.trimToNull(request.description()));
        clientWorkout.setUpdatedAt(now);

        reconcileSections(clientWorkout, request.sections(), trainer.getId(), now);

        clientWorkoutRepository.saveAndFlush(clientWorkout);
        return new ClientWorkoutResponse(clientWorkout);
    }

    @Transactional
    public void deleteClientWorkout(Long clientWorkoutId) { // TODO archive once lifecycle or result records make hard deletion unsafe
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        ClientWorkout clientWorkout = getClientWorkoutOrThrow(clientWorkoutId, trainer);

        clientWorkoutRepository.delete(clientWorkout);
    }

    @Transactional(readOnly = true)
    public ClientWorkoutResponse getClientWorkout(Long clientWorkoutId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();

        return new ClientWorkoutResponse(getClientWorkoutOrThrow(clientWorkoutId, trainer));
    }

    /*
     * Initial Assessment Workout
     */

    @Transactional
    public ClientWorkoutResponse createInitialAssessmentWorkout(Long clientId, @Valid CreateClientWorkoutRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        Client client = getOwnedClientOrThrow(clientId, trainer);

        if (clientWorkoutRepository.existsByClientIdAndTrainerIdAndOriginAndArchivedAtNull(clientId, trainer.getId(), ClientWorkoutOrigin.INITIAL_ASSESSMENT)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An initial assessment workout already exists.");
        }

        WorkoutTemplate sourceTemplate = request.sourceWorkoutTemplateId() == null
                ? null
                : getAvailableWorkoutTemplateOrThrow(request.sourceWorkoutTemplateId(), trainer);

        LocalDateTime now = LocalDateTime.now();

        ClientWorkout clientWorkout = new ClientWorkout();
        clientWorkout.setTrainer(trainer);
        clientWorkout.setClient(client);
        clientWorkout.setSourceTemplate(sourceTemplate);
        clientWorkout.setOrigin(ClientWorkoutOrigin.INITIAL_ASSESSMENT);
        clientWorkout.setStatus(ClientWorkoutStatus.READY);
        clientWorkout.setName(TextUtils.trimToEmpty(request.name()));
        clientWorkout.setDescription(TextUtils.trimToNull(request.description()));
        clientWorkout.setStartedAt(null);
        clientWorkout.setCompletedAt(null);
        clientWorkout.setArchivedAt(null);
        clientWorkout.setCreatedAt(now);
        clientWorkout.setUpdatedAt(now);

        setSections(clientWorkout, request.sections(), trainer.getId(), now);

        return new ClientWorkoutResponse(clientWorkoutRepository.save(clientWorkout));
    }

    @Transactional(readOnly = true)
    public ClientWorkoutResponse getInitialAssessmentWorkout(Long clientId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        getOwnedClientOrThrow(clientId, trainer);

        ClientWorkout clientWorkout = clientWorkoutRepository.findFirstByClientIdAndTrainerIdAndOriginAndArchivedAtNullOrderByUpdatedAtDesc(clientId, trainer.getId(), ClientWorkoutOrigin.INITIAL_ASSESSMENT)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Initial assessment workout not found."));

        return new ClientWorkoutResponse(clientWorkout);
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Mapping
    //
    //---------------------------------------------------------------------------------------------------------

    /* Structure Update */

    private void reconcileSections(ClientWorkout clientWorkout, List<WorkoutSectionRequest> sectionRequests, Long trainerId, LocalDateTime now) {
        workoutStructureValidator.validate(sectionRequests);

        List<WorkoutSectionRequest> requests = sectionRequests == null ? List.of() : sectionRequests;

        Map<Long, ClientWorkoutSection> existingSectionsById = new HashMap<>();
        Map<Long, ClientWorkoutItem> existingItemsById = new HashMap<>();

        for (ClientWorkoutSection section : clientWorkout.getSections()) {
            existingSectionsById.put(section.getId(), section);
            for (ClientWorkoutItem item : section.getItems()) {
                existingItemsById.put(item.getId(), item);
            }
        }

        Set<Long> retainedSectionIds = new HashSet<>();
        List<ClientWorkoutSection> newSections = new ArrayList<>();

        /*
         * LinkedHashMap preserves request order while associating each resolved
         * section entity with the items it should contain after reconciliation.
         */
        Map<ClientWorkoutSection, List<WorkoutItemRequest>> itemRequestsBySection = new LinkedHashMap<>();

        for (WorkoutSectionRequest sectionRequest : requests) {
            ClientWorkoutSection section;
            if (sectionRequest.id() == null) {
                section = new ClientWorkoutSection();
                section.setClientWorkout(clientWorkout);
                section.setCreatedAt(now);
                newSections.add(section);
            } else {
                if (!retainedSectionIds.add(sectionRequest.id())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Section with id " + sectionRequest.id() + " was included more than once.");
                }
                section = existingSectionsById.get(sectionRequest.id());
                if (section == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Section with id " + sectionRequest.id() + " does not belong to client workout with id " + clientWorkout.getId() + ".");
                }
            }
            updateSection(section, sectionRequest, now);
            itemRequestsBySection.put(section, sectionRequest.items() == null ? List.of() : sectionRequest.items());
        }

        Set<ClientWorkoutItem> retainedItems = reconcileItems(clientWorkout, itemRequestsBySection, existingItemsById, trainerId, now);

        /*
         * Items omitted from the entire request are actual deletions.
         * Items assigned to another section remain retained and are merely removed from the old section's in-memory collection.
         */
        List<ClientWorkoutItem> removedItems = existingItemsById.values().stream()
                .filter(item -> !retainedItems.contains(item))
                .toList();

        Set<ClientWorkoutItem> removedItemSet = new HashSet<>(removedItems);

        for (ClientWorkoutSection existingSection : clientWorkout.getSections()) {
            existingSection.getItems().removeIf(item -> retainedItems.contains(item) && item.getClientWorkoutSection() != existingSection);
            existingSection.getItems().removeIf(removedItemSet::contains);
        }
        if (!removedItems.isEmpty()) {
            clientWorkoutItemRepository.deleteAll(removedItems);
        }
        clientWorkout.getSections().removeIf(section -> !retainedSectionIds.contains(section.getId()));
        clientWorkout.getSections().addAll(newSections);
        clientWorkout.getSections().sort(Comparator.comparing(ClientWorkoutSection::getPosition));
    }

    private void updateSection(ClientWorkoutSection section, WorkoutSectionRequest sectionRequest, LocalDateTime now) {
        section.setPosition(sectionRequest.position());
        section.setName(TextUtils.trimToNull(sectionRequest.name()));
        section.setSectionType(sectionRequest.sectionType());
        section.setNotes(TextUtils.trimToNull(sectionRequest.notes()));
        section.setUpdatedAt(now);
    }

    private Set<ClientWorkoutItem> reconcileItems(ClientWorkout clientWorkout, Map<ClientWorkoutSection, List<WorkoutItemRequest>> itemRequestsBySection, Map<Long, ClientWorkoutItem> existingItemsById,
                                                  Long trainerId, LocalDateTime now) {
        Set<Long> retainedItemIds = new HashSet<>();
        Set<ClientWorkoutItem> retainedItems = new HashSet<>();

        for (Map.Entry<ClientWorkoutSection, List<WorkoutItemRequest>> entry : itemRequestsBySection.entrySet()) {
            ClientWorkoutSection targetSection = entry.getKey();
            List<ClientWorkoutItem> desiredItems = new ArrayList<>();

            for (WorkoutItemRequest itemRequest : entry.getValue()) {
                ClientWorkoutItem item;
                if (itemRequest.id() == null) {
                    item = new ClientWorkoutItem();
                    item.setClientWorkoutSection(targetSection);
                    item.setCreatedAt(now);
                } else {
                    if (!retainedItemIds.add(itemRequest.id())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item with id " + itemRequest.id() + " was included more than once.");
                    }
                    item = existingItemsById.get(itemRequest.id());
                    if (item == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item with id " + itemRequest.id() + " does not belong to client workout with id " + clientWorkout.getId() + ".");
                    }
                    /*
                     * The owning side of the relationship determines the database foreign key.
                     * Changing this parent moves the existing item.
                     */
                    item.setClientWorkoutSection(targetSection);
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

    private void updateItem(ClientWorkoutItem item, WorkoutItemRequest itemRequest, Long trainerId, LocalDateTime now) {
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

    private void reconcileItemExercises(ClientWorkoutItem item, List<WorkoutItemExerciseRequest> itemExerciseRequests, Long trainerId, LocalDateTime now) {
        List<WorkoutItemExerciseRequest> requests = itemExerciseRequests == null ? List.of() : itemExerciseRequests;

        Map<Long, ClientWorkoutItemExercise> existingItemExercisesById = new HashMap<>();

        for (ClientWorkoutItemExercise itemExercise : item.getItemExercises()) {
            existingItemExercisesById.put(itemExercise.getId(), itemExercise);
        }

        Set<Long> retainedItemExerciseIds = new HashSet<>();
        List<ClientWorkoutItemExercise> newItemExercises = new ArrayList<>();

        for (WorkoutItemExerciseRequest itemExerciseRequest : requests) {
            ClientWorkoutItemExercise itemExercise;
            if (itemExerciseRequest.id() == null) {
                itemExercise = new ClientWorkoutItemExercise();
                itemExercise.setClientWorkoutItem(item);
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
        item.getItemExercises().sort(Comparator.comparing(ClientWorkoutItemExercise::getPosition));
    }

    private void updateItemExercise(ClientWorkoutItemExercise itemExercise, WorkoutItemExerciseRequest itemExerciseRequest, Long trainerId, LocalDateTime now) {
        itemExercise.setExercise(resolveStackExercise(itemExercise, itemExerciseRequest, trainerId));
        itemExercise.setPosition(itemExerciseRequest.position());
        itemExercise.setName(TextUtils.trimToNull(itemExerciseRequest.name()));
        itemExercise.setNotes(TextUtils.trimToNull(itemExerciseRequest.notes()));
        itemExercise.setConfigJson(itemExerciseRequest.configJson());
        itemExercise.setUpdatedAt(now);
    }

    /* Structure Create */

    private void setSections(ClientWorkout clientWorkout, List<WorkoutSectionRequest> sectionRequests, Long trainerId, LocalDateTime now) {
        workoutStructureValidator.validate(sectionRequests);
        if (sectionRequests == null) {
            return;
        }
        for (WorkoutSectionRequest sectionRequest : sectionRequests) {
            ClientWorkoutSection section = new ClientWorkoutSection();
            section.setClientWorkout(clientWorkout);
            section.setPosition(sectionRequest.position());
            section.setName(TextUtils.trimToNull(sectionRequest.name()));
            section.setSectionType(sectionRequest.sectionType());
            section.setNotes(TextUtils.trimToNull(sectionRequest.notes()));
            section.setCreatedAt(now);
            section.setUpdatedAt(now);

            setItems(section, sectionRequest.items(), trainerId, now);
            clientWorkout.getSections().add(section);
        }
    }

    private void setItems(ClientWorkoutSection section, List<WorkoutItemRequest> itemRequests, Long trainerId, LocalDateTime now) {
        if (itemRequests == null) {
            return;
        }
        for (WorkoutItemRequest itemRequest : itemRequests) {
            ClientWorkoutItem item = new ClientWorkoutItem();
            item.setClientWorkoutSection(section);
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

    private void setItemExercises(ClientWorkoutItem item, List<WorkoutItemExerciseRequest> itemExerciseRequests, Long trainerId, LocalDateTime now) {
        if (itemExerciseRequests == null) {
            return;
        }
        for (WorkoutItemExerciseRequest itemExerciseRequest : itemExerciseRequests) {
            ClientWorkoutItemExercise itemExercise = new ClientWorkoutItemExercise();
            itemExercise.setClientWorkoutItem(item);
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

    private Client getOwnedClientOrThrow(Long clientId, Trainer trainer) {
        return clientRepository.findByIdAndTrainer_Id(clientId, trainer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found."));
    }

    private ClientWorkout getClientWorkoutOrThrow(Long clientWorkoutId, Trainer trainer) {
        return clientWorkoutRepository.findByIdAndTrainer_Id(clientWorkoutId, trainer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client workout with id " + clientWorkoutId + " not found"));
    }

    private WorkoutTemplate getAvailableWorkoutTemplateOrThrow(Long workoutTemplateId, Trainer trainer) {
        WorkoutTemplate workoutTemplate = workoutTemplateRepository
                .findByIdAndTrainer_Id(workoutTemplateId, trainer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout template with id " + workoutTemplateId + " not found."));

        if (Boolean.TRUE.equals(workoutTemplate.getArchived())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Workout template with id " + workoutTemplateId + " is archived.");
        }

        return workoutTemplate;
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
