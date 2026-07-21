package com.stugger.coachflow.entity.benchmark;

import com.stugger.coachflow.entity.exercise.ExerciseTrackingField;
import com.stugger.coachflow.entity.exercise.ExerciseUnit;
import lombok.Getter;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/**
 * @author Jake
 * @since July 10th, 2026
 */
@Getter
public enum ExerciseBenchmarkType {

    ONE_REP_MAX("1 Rep Max", "PERCENT_1RM", ExerciseTrackingField.WEIGHT, ExerciseTrackingField.REPS),

    FASTEST_TIME("Fastest Time", null, ExerciseTrackingField.TIME),
    MAX_DURATION("Max Duration", null, ExerciseTrackingField.TIME),

    ;

    private final String label;
    private final String trackingMode;
    private final ExerciseTrackingField valueTrackingField;
    private final Set<ExerciseTrackingField> requiredTrackingFields;

    ExerciseBenchmarkType(String label, String trackingMode, ExerciseTrackingField valueTrackingField, ExerciseTrackingField... additionalRequiredTrackingFields) {
        this.label = label;
        this.trackingMode = trackingMode;
        this.valueTrackingField = valueTrackingField;

        EnumSet<ExerciseTrackingField> requiredTrackingFields = EnumSet.of(valueTrackingField);
        Collections.addAll(requiredTrackingFields, additionalRequiredTrackingFields);
        this.requiredTrackingFields = Collections.unmodifiableSet(requiredTrackingFields);
    }

    public static ExerciseBenchmarkType getByTrackingMode(String trackingMode) {
        if (trackingMode != null) {
            for (ExerciseBenchmarkType exerciseBenchmarkType : ExerciseBenchmarkType.values()) {
                if (trackingMode.equals(exerciseBenchmarkType.getTrackingMode())) {
                    return exerciseBenchmarkType;
                }
            }
        }
        return null;
    }

    public boolean isSupportedBy(Set<ExerciseTrackingField> trackingFields) {
        return trackingFields.containsAll(requiredTrackingFields);
    }

    public boolean supportsUnit(ExerciseUnit unit) {
        Set<ExerciseUnit> supportedUnits = valueTrackingField.getUnits();
        if (supportedUnits.isEmpty()) {
            return unit == null;
        }
        return unit != null && supportedUnits.contains(unit);
    }
}
