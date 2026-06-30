package com.stugger.coachflow.validation;

import com.stugger.coachflow.api.dto.request.workout.WorkoutItemExerciseRequest;
import com.stugger.coachflow.api.dto.request.workout.WorkoutItemRequest;
import com.stugger.coachflow.api.dto.request.workout.WorkoutSectionRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @author Jake
 * @since June 30th, 2026
 */
@Component
public class WorkoutStructureValidator {

    public void validate(List<WorkoutSectionRequest> sections) {
        validateSectionPositions(sections);

        if (sections == null) {
            return;
        }

        for (WorkoutSectionRequest section : sections) {
            if (section.sectionType() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Section type is required.");
            }

            validateItemPositions(section.items());

            if (section.items() == null) {
                continue;
            }

            for (WorkoutItemRequest item : section.items()) {
                validateItemStructure(item);
                validateItemExercisePositions(item.itemExercises());
            }
        }
    }

    private void validateSectionPositions(List<WorkoutSectionRequest> sections) {
        if (sections == null) {
            return;
        }

        Set<Integer> positions = new HashSet<>();

        for (WorkoutSectionRequest section : sections) {
            validatePositivePosition(section.position(), "Section position");

            if (!positions.add(section.position())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Section positions must be unique within a workout."
                );
            }
        }
    }

    private void validateItemPositions(List<WorkoutItemRequest> items) {
        if (items == null) {
            return;
        }

        Set<Integer> positions = new HashSet<>();

        for (WorkoutItemRequest item : items) {
            validatePositivePosition(item.position(), "Item position");

            if (!positions.add(item.position())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Item positions must be unique within a section."
                );
            }
        }
    }

    private void validateItemExercisePositions(List<WorkoutItemExerciseRequest> itemExercises) {
        if (itemExercises == null) {
            return;
        }

        Set<Integer> positions = new HashSet<>();

        for (WorkoutItemExerciseRequest itemExercise : itemExercises) {
            validatePositivePosition(itemExercise.position(), "Item exercise position");

            if (!positions.add(itemExercise.position())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Item exercise positions must be unique within an item."
                );
            }
        }
    }

    private void validatePositivePosition(Integer position, String label) {
        if (position == null || position <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    label + " must be positive."
            );
        }
    }

    private void validateItemStructure(WorkoutItemRequest item) {
        if (item.itemType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item type is required.");
        }

        int itemExerciseCount = item.itemExercises() == null
                ? 0
                : item.itemExercises().size();

        switch (item.itemType()) {
            case EXERCISE -> validateExerciseItem(item, itemExerciseCount);
            case SUPERSET -> validateGroupedItem(item, itemExerciseCount, 2, 2, "Supersets");
            case TRISET -> validateGroupedItem(item, itemExerciseCount, 3, 3, "Trisets");
            case CIRCUIT -> validateGroupedItem(item, itemExerciseCount, 2, null, "Circuits");
        }
    }

    private void validateExerciseItem(WorkoutItemRequest item, int itemExerciseCount) {
        if (item.exerciseId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Exercise items require exerciseId."
            );
        }

        if (itemExerciseCount > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Exercise items must not include child item exercises."
            );
        }

        if (item.rounds() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Exercise items must not set rounds."
            );
        }
    }

    private void validateGroupedItem(
            WorkoutItemRequest item,
            int itemExerciseCount,
            int minimumExercises,
            Integer exactExercises,
            String label
    ) {
        if (item.exerciseId() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    label + " must not set exerciseId."
            );
        }

        if (item.rounds() == null || item.rounds() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    label + " require rounds."
            );
        }

        if (exactExercises != null && itemExerciseCount != exactExercises) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    label + " require exactly " + exactExercises + " child exercises."
            );
        }

        if (exactExercises == null && itemExerciseCount < minimumExercises) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    label + " require at least " + minimumExercises + " child exercises."
            );
        }
    }
}