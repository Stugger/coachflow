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

    ONE_REP_MAX("1 Rep Max", ExerciseTrackingField.WEIGHT, ExerciseTrackingField.REPS),

    FASTEST_TIME("Fastest Time", ExerciseTrackingField.TIME),
    MAX_DURATION("Max Duration", ExerciseTrackingField.TIME),

    ;

    private final String label;
    private final ExerciseTrackingField valueTrackingField;
    private final Set<ExerciseTrackingField> requiredTrackingFields;

    ExerciseBenchmarkType(String label, ExerciseTrackingField valueTrackingField, ExerciseTrackingField... additionalRequiredTrackingFields) {
        this.label = label;
        this.valueTrackingField = valueTrackingField;

        EnumSet<ExerciseTrackingField> requiredTrackingFields = EnumSet.of(valueTrackingField);
        Collections.addAll(requiredTrackingFields, additionalRequiredTrackingFields);
        this.requiredTrackingFields = Collections.unmodifiableSet(requiredTrackingFields);
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
