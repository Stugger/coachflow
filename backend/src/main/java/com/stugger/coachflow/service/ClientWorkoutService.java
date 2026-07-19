package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.workout.*;
import com.stugger.coachflow.api.dto.response.workout.*;
import com.stugger.coachflow.entity.exercise.Exercise;
import com.stugger.coachflow.entity.exercise.ExerciseVisibility;
import com.stugger.coachflow.entity.person.Client;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.entity.workout.*;
import com.stugger.coachflow.repository.exercise.ExerciseRepository;
import com.stugger.coachflow.repository.person.ClientRepository;
import com.stugger.coachflow.repository.workout.ClientWorkoutItemRepository;
import com.stugger.coachflow.repository.workout.ClientWorkoutRepository;
import com.stugger.coachflow.repository.workout.ClientWorkoutSetResultRepository;
import com.stugger.coachflow.repository.workout.WorkoutTemplateRepository;
import com.stugger.coachflow.security.CurrentTrainerService;
import com.stugger.coachflow.util.TextUtils;
import com.stugger.coachflow.validation.WorkoutStructureValidator;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDateTime;
import java.util.*;

/**
 * @author Jake
 * @since June 30th, 2026
 */
@Service
public class ClientWorkoutService {

    private final ClientWorkoutRepository clientWorkoutRepository;
    private final ClientWorkoutItemRepository clientWorkoutItemRepository;
    private final ClientWorkoutSetResultRepository clientWorkoutSetResultRepository;

    private final WorkoutTemplateRepository workoutTemplateRepository;
    private final ExerciseRepository exerciseRepository;

    private final ClientRepository clientRepository;
    private final CurrentTrainerService currentTrainerService;

    private final WorkoutStructureValidator workoutStructureValidator;

    private final JsonMapper jsonMapper;

    public ClientWorkoutService(ClientWorkoutRepository clientWorkoutRepository, ClientWorkoutItemRepository clientWorkoutItemRepository, ClientWorkoutSetResultRepository clientWorkoutSetResultRepository,
                                WorkoutTemplateRepository workoutTemplateRepository, ExerciseRepository exerciseRepository,
                                ClientRepository clientRepository, CurrentTrainerService currentTrainerService,
                                WorkoutStructureValidator workoutStructureValidator, JsonMapper jsonMapper) {
        this.clientWorkoutRepository = clientWorkoutRepository;
        this.clientWorkoutItemRepository = clientWorkoutItemRepository;
        this.clientWorkoutSetResultRepository = clientWorkoutSetResultRepository;
        this.workoutTemplateRepository = workoutTemplateRepository;
        this.exerciseRepository = exerciseRepository;
        this.clientRepository = clientRepository;
        this.currentTrainerService = currentTrainerService;
        this.workoutStructureValidator = workoutStructureValidator;
        this.jsonMapper = jsonMapper;
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

        if (clientWorkout.getStatus() == ClientWorkoutStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Completed client workout records cannot be edited.");
        }

        LocalDateTime now = LocalDateTime.now();

        clientWorkout.setName(TextUtils.trimToEmpty(request.name()));
        clientWorkout.setDescription(TextUtils.trimToNull(request.description()));
        clientWorkout.setUpdatedAt(now);

        reconcileSections(clientWorkout, request.sections(), trainer.getId(), now);

        clientWorkoutRepository.saveAndFlush(clientWorkout);
        return new ClientWorkoutResponse(clientWorkout);
    }

    @Transactional
    public void deleteClientWorkout(Long clientWorkoutId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        ClientWorkout clientWorkout = getClientWorkoutOrThrow(clientWorkoutId, trainer);

        switch (clientWorkout.getStatus()) {
            case READY -> clientWorkoutRepository.delete(clientWorkout);
            case IN_PROGRESS -> throw new ResponseStatusException(HttpStatus.CONFLICT, "In-progress client workouts must be cancelled before they can be deleted.");
            case COMPLETED -> {
                LocalDateTime now = LocalDateTime.now();
                clientWorkout.setArchivedAt(now);
                clientWorkout.setUpdatedAt(now);
            }
        }
    }

    @Transactional(readOnly = true)
    public ClientWorkoutResponse getClientWorkout(Long clientWorkoutId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();

        return new ClientWorkoutResponse(getClientWorkoutOrThrow(clientWorkoutId, trainer));
    }

    @Transactional(readOnly = true)
    public ClientWorkoutSessionResponse getClientWorkoutSession(Long clientWorkoutId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();

        ClientWorkout clientWorkout = getClientWorkoutOrThrow(clientWorkoutId, trainer);

        if (clientWorkout.getStatus() == ClientWorkoutStatus.READY) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Client workout has not been started.");
        }

        List<ClientWorkoutSetResult> results = clientWorkoutSetResultRepository.findAllByClientWorkout_Id(clientWorkoutId);

        return new ClientWorkoutSessionResponse(clientWorkout, results);
    }

    @Transactional
    public ClientWorkoutResponse startClientWorkout(Long clientWorkoutId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        ClientWorkout clientWorkout = getClientWorkoutOrThrow(clientWorkoutId, trainer);

        if (clientWorkout.getArchivedAt() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archived client workouts cannot be started.");
        }

        /*
         * Starting the same workout more than once is idempotent.
         * This handles double clicks and repeated start requests safely.
         */
        if (clientWorkout.getStatus() == ClientWorkoutStatus.IN_PROGRESS) {
            return new ClientWorkoutResponse(clientWorkout);
        }

        if (clientWorkout.getStatus() == ClientWorkoutStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Completed client workouts cannot be started.");
        }

        ClientWorkout activeWorkout = clientWorkoutRepository
                .findFirstByClientIdAndTrainerIdAndStatusAndArchivedAtNull(clientWorkout.getClient().getId(), trainer.getId(), ClientWorkoutStatus.IN_PROGRESS)
                .orElse(null);

        if (activeWorkout != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This client already has a workout in progress: " + activeWorkout.getName() + ".");
        }

        LocalDateTime now = LocalDateTime.now();

        clientWorkout.setStatus(ClientWorkoutStatus.IN_PROGRESS);
        clientWorkout.setStartedAt(now);
        clientWorkout.setCompletedAt(null);
        clientWorkout.setUpdatedAt(now);

        try {
            clientWorkoutRepository.saveAndFlush(clientWorkout);
        } catch (DataIntegrityViolationException exception) {
            /*
             * The partial unique index protects against concurrent requests from
             * multiple tabs or devices that both passed the application-level check.
             */
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This client already has a workout in progress.", exception);
        }

        return new ClientWorkoutResponse(clientWorkout);
    }

    @Transactional
    public Optional<ClientWorkoutSetResultResponse> saveClientWorkoutSetResult(Long clientWorkoutId, @Valid SaveClientWorkoutSetResultRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();

        ClientWorkout clientWorkout = getClientWorkoutOrThrow(clientWorkoutId, trainer);

        if (clientWorkout.getArchivedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Archived workout records cannot be updated.");
        }

        if (clientWorkout.getStatus() != ClientWorkoutStatus.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Set results can only be updated while a workout is in progress.");
        }

        ClientWorkoutResultTarget target = resolveResultTarget(clientWorkout, request);

        ParsedWorkoutConfig config = parseWorkoutConfig(target.configJson());

        String setKey = request.setKey().trim();

        if (!config.setKeys().contains(setKey)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Set with key " + setKey + " does not exist for the selected exercise.");
        }

        String normalizedValuesJson = validateAndNormalizeResultValues(request.valuesJson(), config);

        String notes = TextUtils.trimToNull(request.notes());

        Optional<ClientWorkoutSetResult> existingResult = findSetResult(clientWorkoutId, target, setKey);

        boolean hasValues = !normalizedValuesJson.equals("{}");
        boolean shouldRetainResult = hasValues || notes != null || request.completed();

        if (!shouldRetainResult) {
            existingResult.ifPresent(clientWorkoutSetResultRepository::delete);
            return Optional.empty();
        }

        LocalDateTime now = LocalDateTime.now();

        ClientWorkoutSetResult result = existingResult.orElseGet(() -> {
            ClientWorkoutSetResult newResult = new ClientWorkoutSetResult();

            newResult.setClientWorkout(clientWorkout);
            newResult.setClientWorkoutItem(target.item());
            newResult.setClientWorkoutItemExercise(target.itemExercise());
            newResult.setSetKey(setKey);
            newResult.setCreatedAt(now);

            return newResult;
        });

        result.setValuesJson(normalizedValuesJson);
        result.setNotes(notes);
        result.setCompletedAt(request.completed() ? now : null);
        result.setUpdatedAt(now);

        ClientWorkoutSetResult savedResult = clientWorkoutSetResultRepository.saveAndFlush(result);

        return Optional.of(new ClientWorkoutSetResultResponse(savedResult));
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

    private ClientWorkoutResultTarget resolveResultTarget(ClientWorkout clientWorkout, SaveClientWorkoutSetResultRequest request) {
        boolean hasDirectItem = request.clientWorkoutItemId() != null;
        boolean hasStackExercise = request.clientWorkoutItemExerciseId() != null;

        if (hasDirectItem == hasStackExercise) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exactly one workout item or workout item exercise is required.");
        }

        for (ClientWorkoutSection section : clientWorkout.getSections()) {
            for (ClientWorkoutItem item : section.getItems()) {
                if (hasDirectItem && Objects.equals(item.getId(), request.clientWorkoutItemId())) {
                    if (item.getItemType() != WorkoutItemType.EXERCISE || item.getExercise() == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The selected workout item is not a direct exercise.");
                    }
                    return new ClientWorkoutResultTarget(item, null, item.getConfigJson());
                }

                if (hasStackExercise) {
                    for (ClientWorkoutItemExercise itemExercise : item.getItemExercises()) {
                        if (Objects.equals(itemExercise.getId(), request.clientWorkoutItemExerciseId())) {
                            return new ClientWorkoutResultTarget(null, itemExercise, itemExercise.getConfigJson());
                        }
                    }
                }
            }
        }

        String targetLabel = hasDirectItem
                ? "Workout item with id " + request.clientWorkoutItemId()
                : "Workout item exercise with id " + request.clientWorkoutItemExerciseId();

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, targetLabel + " does not belong to client workout with id " + clientWorkout.getId() + ".");
    }

    private Optional<ClientWorkoutSetResult> findSetResult(Long clientWorkoutId, ClientWorkoutResultTarget target, String setKey) {
        if (target.item() != null) {
            return clientWorkoutSetResultRepository.findByClientWorkout_IdAndClientWorkoutItem_IdAndSetKey(clientWorkoutId, target.item().getId(), setKey);
        }
        return clientWorkoutSetResultRepository.findByClientWorkout_IdAndClientWorkoutItemExercise_IdAndSetKey(clientWorkoutId, target.itemExercise().getId(), setKey);
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

    private String validateAndNormalizeResultValues(String valuesJson, ParsedWorkoutConfig config) {
        JsonNode valuesNode;

        if (valuesJson == null || valuesJson.isBlank()) {
            valuesNode = jsonMapper.createObjectNode();
        } else {
            try {
                valuesNode = jsonMapper.readTree(valuesJson);
            } catch (JacksonException exception) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Set result values must contain valid JSON.", exception);
            }
        }

        if (valuesNode == null || !valuesNode.isObject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Set result values must be a JSON object.");
        }

        Set<String> allowedSideKeys = config.eachSide()
                ? Set.of("default", "left", "right")
                : Set.of("default");

        if (config.eachSide()) {
            boolean hasSharedValues = valuesNode.has("default");
            boolean hasSeparateValues = valuesNode.has("left") || valuesNode.has("right");

            if (hasSharedValues && hasSeparateValues) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each-side results must contain either shared default values or separate left and right values, not both.");
            }
        }

        for (Map.Entry<String, JsonNode> sideEntry : valuesNode.properties()) {
            String sideKey = sideEntry.getKey();
            JsonNode sideValues = sideEntry.getValue();

            if (!allowedSideKeys.contains(sideKey)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, config.eachSide()
                        ? "Each-side results may only contain default, or left and right values."
                        : "Standard results may only contain default values.");
            }
            if (!sideValues.isObject()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Values for " + sideKey + " must be a JSON object.");
            }

            for (Map.Entry<String, JsonNode> valueEntry : sideValues.properties()) {
                String fieldKey = valueEntry.getKey();

                if (!config.inputFieldKeys().contains(fieldKey)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tracking field " + fieldKey + " is not configured as an input for this exercise.");
                }
                if (valueEntry.getValue().isNull()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tracking field values cannot be null.");
                }
            }
        }

        try {
            return jsonMapper.writeValueAsString(valuesNode);
        } catch (JacksonException exception) {
            throw new IllegalStateException("Failed to serialize validated set result values.", exception);
        }
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Parsing - TODO likely extract and use during workout building for full enforcement of valid config
    //
    //---------------------------------------------------------------------------------------------------------

    private ParsedWorkoutConfig parseWorkoutConfig(String configJson) {
        JsonNode configNode;

        try {
            configNode = jsonMapper.readTree(configJson);
        } catch (JacksonException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Workout exercise configuration is invalid.", exception);
        }

        if (configNode == null || !configNode.isObject()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Workout exercise configuration is invalid.");
        }

        boolean eachSide = configNode.path("eachSide").asBoolean(false);

        Set<String> setKeys = new HashSet<>();

        JsonNode setsNode = configNode.path("sets");
        if (setsNode.isArray()) {
            for (JsonNode setNode : setsNode) {
                String setKey = TextUtils.trimToNull(setNode.path("setKey").asString(null));
                if (setKey != null) {
                    setKeys.add(setKey);
                }
            }
        }

        Set<String> inputFieldKeys = new HashSet<>();

        JsonNode trackingFieldsNode = configNode.path("trackingFields");

        if (trackingFieldsNode.isArray()) {
            for (JsonNode trackingFieldNode : trackingFieldsNode) {
                String fieldKey = TextUtils.trimToNull(trackingFieldNode.path("key").asString(null));
                // notes is a prescribed informational field, it renders its target as read-only session guidance and is not an actual result input.
                if (fieldKey != null && !fieldKey.equals("notes")) {
                    inputFieldKeys.add(fieldKey);
                }
            }
        }

        return new ParsedWorkoutConfig(eachSide, Set.copyOf(setKeys), Set.copyOf(inputFieldKeys));
    }

    private record ParsedWorkoutConfig(
            boolean eachSide,
            Set<String> setKeys,
            Set<String> inputFieldKeys
    ) {
    }

    private record ClientWorkoutResultTarget(
            ClientWorkoutItem item,
            ClientWorkoutItemExercise itemExercise,
            String configJson
    ) {
    }
}
