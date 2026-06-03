package com.stugger.coachflow.entity.assessment;

/**
 * @author Jake
 * @since June 2nd, 2026
 */
public enum AssessmentStep {
    CHECK_IN, //only relevant to re-assessments (skipped on initial)
    MEASUREMENTS,
    MOVEMENTS,
    NOTES,
    COMPLETED
}