package com.stugger.coachflow.entity.exercise;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * @author Jake
 * @since July 10th, 2026
 */
@Getter
@RequiredArgsConstructor
public enum ExerciseUnit {

    LB("lb"),
    KG("kg"),
    SECONDS("sec"),
    MILES("mi"),
    KILOMETERS("km"),
    METERS("m"),
    FEET("ft"),
    INCHES("in"),
    MPH("mph"),
    PERCENT("%"),

    ;

    private final String label;

}
