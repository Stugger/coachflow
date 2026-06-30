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
import java.util.List;

/**
 * @author Jake
 * @since June 30th, 2026
 */
@Service
public class ClientWorkoutService {

    private final ClientWorkoutRepository clientWorkoutRepository;
    private final WorkoutTemplateRepository workoutTemplateRepository;
    private final ClientRepository clientRepository;
    private final CurrentTrainerService currentTrainerService;
    private final ExerciseRepository exerciseRepository;

    private final WorkoutStructureValidator workoutStructureValidator;

    public ClientWorkoutService(ClientWorkoutRepository clientWorkoutRepository, WorkoutTemplateRepository workoutTemplateRepository,
                                ClientRepository clientRepository, CurrentTrainerService currentTrainerService, ExerciseRepository exerciseRepository,
                                WorkoutStructureValidator workoutStructureValidator) {
        this.clientWorkoutRepository = clientWorkoutRepository;
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

        clientWorkout.getSections().clear();
        clientWorkoutRepository.saveAndFlush(clientWorkout);
        setSections(clientWorkout, request.sections(), trainer.getId(), now);

        return new ClientWorkoutResponse(clientWorkoutRepository.save(clientWorkout));
    }

    @Transactional
    public void deleteClientWorkout(Long clientWorkoutId) { //TODO delete if no references to a WorkoutSession otherwise set archivedAt
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        ClientWorkout clientWorkout = getClientWorkoutOrThrow(clientWorkoutId, trainer);

        clientWorkoutRepository.delete(clientWorkout);
    }

    @Transactional(readOnly = true)
    public ClientWorkoutResponse getClientWorkout(Long clientWorkoutId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();

        return new ClientWorkoutResponse(getClientWorkoutOrThrow(clientWorkoutId, trainer));
    }

    @Transactional(readOnly = true)
    public List<ClientWorkoutResponse> getClientWorkoutsOfOriginByClientId(Long clientId, ClientWorkoutOrigin origin) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        getOwnedClientOrThrow(clientId, trainer);
        return clientWorkoutRepository.findByClientIdAndTrainerIdAndOriginAndArchivedAtNullOrderByUpdatedAtDesc(clientId, trainer.getId(), origin)
                .stream()
                .map(ClientWorkoutResponse::new)
                .toList();
    }

    /*
     * Create Workouts
     */

    @Transactional
    public ClientWorkoutResponse createAssessmentWorkout(Long clientId, @Valid CreateClientWorkoutRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        Client client = getOwnedClientOrThrow(clientId, trainer);

        WorkoutTemplate sourceTemplate = request.sourceWorkoutTemplateId() == null
                ? null
                : getAvailableWorkoutTemplateOrThrow(request.sourceWorkoutTemplateId(), trainer);

        LocalDateTime now = LocalDateTime.now();

        ClientWorkout clientWorkout = new ClientWorkout();
        clientWorkout.setTrainer(trainer);
        clientWorkout.setClient(client);
        clientWorkout.setSourceTemplate(sourceTemplate);
        clientWorkout.setOrigin(ClientWorkoutOrigin.ASSESSMENT);
        clientWorkout.setName(TextUtils.trimToEmpty(request.name()));
        clientWorkout.setDescription(TextUtils.trimToNull(request.description()));
        clientWorkout.setArchivedAt(null);
        clientWorkout.setCreatedAt(now);
        clientWorkout.setUpdatedAt(now);

        setSections(clientWorkout, request.sections(), trainer.getId(), now);

        return new ClientWorkoutResponse(clientWorkoutRepository.save(clientWorkout));
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Mapping
    //
    //---------------------------------------------------------------------------------------------------------

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

    private void setItemExercises(ClientWorkoutItem item, List<WorkoutItemExerciseRequest> itemExerciseRequests, Long trainerId, LocalDateTime now) {
        if (itemExerciseRequests == null) {
            return;
        }

        for (WorkoutItemExerciseRequest itemExerciseRequest : itemExerciseRequests) {
            ClientWorkoutItemExercise itemExercise = new ClientWorkoutItemExercise();
            itemExercise.setClientWorkoutItem(item);
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
