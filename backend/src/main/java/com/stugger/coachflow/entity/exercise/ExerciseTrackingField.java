package com.stugger.coachflow.entity.exercise;

import lombok.Getter;

import java.util.Arrays;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;

/**
 * @author Jake
 * @since July 10th, 2026
 */
@Getter
public enum ExerciseTrackingField { //reflective of frontend exercise-tracking-fields.js

    REPS("reps"),
    WEIGHT("weight", ExerciseUnit.LB, ExerciseUnit.KG),
    TIME("time", ExerciseUnit.SECONDS),
    DISTANCE("distance", ExerciseUnit.MILES, ExerciseUnit.KILOMETERS, ExerciseUnit.METERS, ExerciseUnit.FEET),
    SPEED("speed", ExerciseUnit.MPH),
    INCLINE("incline", ExerciseUnit.PERCENT),
    HEIGHT("height", ExerciseUnit.FEET, ExerciseUnit.INCHES),
    RESISTANCE("resistance", ExerciseUnit.LB, ExerciseUnit.KG),
    RPE("rpe"),
    REST("rest", ExerciseUnit.SECONDS),
    NOTES("notes"),

    ;

    private final String key;
    private final Set<ExerciseUnit> units;

    ExerciseTrackingField(String key, ExerciseUnit... units) {
        this.key = key;
        this.units = units.length == 0
                ? Set.of()
                : Collections.unmodifiableSet(EnumSet.copyOf(Arrays.asList(units)));
    }

    public static Optional<ExerciseTrackingField> findByKey(String key) {
        return Arrays.stream(values())
                .filter(field -> field.key.equals(key))
                .findFirst();
    }
}
