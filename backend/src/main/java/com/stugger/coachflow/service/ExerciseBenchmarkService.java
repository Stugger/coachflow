package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.benchmark.CreateExerciseBenchmarkRequest;
import com.stugger.coachflow.api.dto.request.benchmark.UpdateExerciseBenchmarkRequest;
import com.stugger.coachflow.api.dto.response.benchmark.ExerciseBenchmarkResponse;
import com.stugger.coachflow.entity.benchmark.ClientExerciseBenchmark;
import com.stugger.coachflow.entity.benchmark.ExerciseBenchmarkBasis;
import com.stugger.coachflow.entity.benchmark.ExerciseBenchmarkType;
import com.stugger.coachflow.entity.exercise.Exercise;
import com.stugger.coachflow.entity.exercise.ExerciseTrackingField;
import com.stugger.coachflow.entity.exercise.ExerciseUnit;
import com.stugger.coachflow.entity.exercise.ExerciseVisibility;
import com.stugger.coachflow.entity.person.Client;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.repository.benchmark.ClientExerciseBenchmarkRepository;
import com.stugger.coachflow.repository.exercise.ExerciseRepository;
import com.stugger.coachflow.repository.person.ClientRepository;
import com.stugger.coachflow.security.CurrentTrainerService;
import com.stugger.coachflow.util.TextUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * @author Jake
 * @since July 10th, 2026
 */
@Service
public class ExerciseBenchmarkService {

    private final ClientExerciseBenchmarkRepository benchmarkRepository;
    private final ClientRepository clientRepository;
    private final ExerciseRepository exerciseRepository;
    private final CurrentTrainerService currentTrainerService;

    public ExerciseBenchmarkService(ClientExerciseBenchmarkRepository benchmarkRepository, ClientRepository clientRepository, ExerciseRepository exerciseRepository, CurrentTrainerService currentTrainerService) {
        this.benchmarkRepository = benchmarkRepository;
        this.clientRepository = clientRepository;
        this.exerciseRepository = exerciseRepository;
        this.currentTrainerService = currentTrainerService;
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Exercise Benchmarks
    //
    //---------------------------------------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ExerciseBenchmarkResponse> getCurrentClientExerciseBenchmarks(Long clientId, Set<Long> exerciseIds) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        getOwnedClientOrThrow(clientId, trainer);

        List<ClientExerciseBenchmark> benchmarks;

        if (exerciseIds == null) {
            benchmarks = benchmarkRepository.findLatestForClient(clientId, trainer.getId());
        } else if (exerciseIds.isEmpty()) {
            benchmarks = List.of();
        } else {
            benchmarks = benchmarkRepository.findLatestForClientAndExercises(clientId, trainer.getId(), exerciseIds);
        }

        return benchmarks.stream()
                .map(ExerciseBenchmarkResponse::new)
                .sorted(CURRENT_BENCHMARK_ORDER)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExerciseBenchmarkResponse> getAllClientExerciseBenchmarks(Long clientId, Set<Long> exerciseIds, ExerciseBenchmarkType benchmarkType) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        getOwnedClientOrThrow(clientId, trainer);

        List<ClientExerciseBenchmark> benchmarks;

        if (exerciseIds == null) {
            benchmarks = benchmarkRepository.findAllByClient_IdAndTrainer_IdOrderByExercise_NameAsc(clientId, trainer.getId());
        } else if (exerciseIds.isEmpty()) {
            benchmarks = List.of();
        } else {
            benchmarks = benchmarkRepository.findAllByClient_IdAndTrainer_IdAndExercise_IdInOrderByExercise_NameAsc(clientId, trainer.getId(), exerciseIds);
        }

        Stream<ClientExerciseBenchmark> stream = benchmarks.stream();

        if (benchmarkType != null) {
            stream = stream.filter(benchmark -> benchmark.getBenchmarkType().equals(benchmarkType));
        }

        return stream
                .map(ExerciseBenchmarkResponse::new)
                .sorted(BENCHMARK_HISTORY_ORDER)
                .toList();
    }

    @Transactional
    public ExerciseBenchmarkResponse createClientExerciseBenchmark(Long clientId, @Valid CreateExerciseBenchmarkRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        Client client = getOwnedClientOrThrow(clientId, trainer);
        Exercise exercise = getAvailableExerciseOrThrow(request.exerciseId(), trainer.getId());

        validateExerciseSupportsBenchmark(exercise, request.benchmarkType());
        validateBenchmarkUnit(request.benchmarkType(), request.unit());

        LocalDateTime now = LocalDateTime.now();

        ClientExerciseBenchmark benchmark = new ClientExerciseBenchmark();
        benchmark.setTrainer(trainer);
        benchmark.setClient(client);
        benchmark.setExercise(exercise);
        benchmark.setBenchmarkType(request.benchmarkType());
        benchmark.setValue(request.value());
        benchmark.setUnit(request.unit());
        benchmark.setBasis(ExerciseBenchmarkBasis.MANUAL);
        benchmark.setAchievedAt(request.achievedAt());
        benchmark.setNotes(TextUtils.trimToNull(request.notes()));
        benchmark.setCreatedAt(now);
        benchmark.setUpdatedAt(now);

        return new ExerciseBenchmarkResponse(benchmarkRepository.save(benchmark));
    }

    @Transactional
    public ExerciseBenchmarkResponse updateClientExerciseBenchmark(Long clientId, Long benchmarkId, @Valid UpdateExerciseBenchmarkRequest request) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        getOwnedClientOrThrow(clientId, trainer);

        ClientExerciseBenchmark benchmark = getOwnedBenchmarkOrThrow(benchmarkId, clientId, trainer);
        validateBenchmarkUnit(benchmark.getBenchmarkType(), request.unit());

        benchmark.setValue(request.value());
        benchmark.setUnit(request.unit());
        benchmark.setAchievedAt(request.achievedAt());
        benchmark.setNotes(TextUtils.trimToNull(request.notes()));
        benchmark.setUpdatedAt(LocalDateTime.now());

        return new ExerciseBenchmarkResponse(benchmarkRepository.save(benchmark));
    }

    @Transactional
    public void deleteClientExerciseBenchmark(Long clientId, Long benchmarkId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        getOwnedClientOrThrow(clientId, trainer);

        ClientExerciseBenchmark benchmark = getOwnedBenchmarkOrThrow(benchmarkId, clientId, trainer);
        benchmarkRepository.delete(benchmark);
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

    private ClientExerciseBenchmark getOwnedBenchmarkOrThrow(Long benchmarkId, Long clientId, Trainer trainer) {
        return benchmarkRepository.findByIdAndClient_IdAndTrainer_Id(benchmarkId, clientId, trainer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise benchmark not found."));
    }

    private Exercise getAvailableExerciseOrThrow(Long exerciseId, Long trainerId) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise with id " + exerciseId + " not found."));

        if (Boolean.TRUE.equals(exercise.getArchived())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exercise with id " + exerciseId + " is archived.");
        }
        if (exercise.getVisibility() == ExerciseVisibility.GLOBAL) {
            return exercise;
        }
        if (exercise.getTrainer() != null && exercise.getTrainer().getId().equals(trainerId)) {
            return exercise;
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise with id " + exerciseId + " not found.");
    }

    private void validateExerciseSupportsBenchmark(Exercise exercise, ExerciseBenchmarkType benchmarkType) {
        Set<ExerciseTrackingField> trackingFields = exerciseRepository.findDefaultTrackingFieldKeysById(exercise.getId())
                .stream()
                .map(ExerciseTrackingField::findByKey)
                .flatMap(Optional::stream)
                .collect(Collectors.toUnmodifiableSet());

        if (!benchmarkType.isSupportedBy(trackingFields)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exercise.getName() + " does not support the " + benchmarkType.getLabel() + " benchmark.");
        }
    }

    private void validateBenchmarkUnit(ExerciseBenchmarkType benchmarkType, ExerciseUnit unit) {
        if (!benchmarkType.supportsUnit(unit)) {
            if (unit == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A unit is required by the " + benchmarkType.getLabel() + " benchmark.");
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, unit + " is not supported by the " + benchmarkType.getLabel() + " benchmark.");
        }
    }

    private static final Comparator<ExerciseBenchmarkResponse> CURRENT_BENCHMARK_ORDER =
            Comparator.comparing((ExerciseBenchmarkResponse response) -> response.exercise().name(), String.CASE_INSENSITIVE_ORDER)
                    .thenComparing(response -> response.benchmarkType().name());

    private static final Comparator<ExerciseBenchmarkResponse> BENCHMARK_HISTORY_ORDER =
            Comparator.comparing((ExerciseBenchmarkResponse response) -> response.exercise().name(), String.CASE_INSENSITIVE_ORDER)
                    .thenComparing(response -> response.benchmarkType().name())
                    .thenComparing(ExerciseBenchmarkResponse::achievedAt, Comparator.reverseOrder())
                    .thenComparing(ExerciseBenchmarkResponse::createdAt, Comparator.reverseOrder())
                    .thenComparing(ExerciseBenchmarkResponse::id, Comparator.reverseOrder());
}
