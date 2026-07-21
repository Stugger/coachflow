-- -----------------------------------------------------------------------------------------------------------------
-- Allow workout structures to be reconciled in place
-- -----------------------------------------------------------------------------------------------------------------
--
-- Workout templates and client workouts previously deleted and recreated their complete nested structures during updates.
--
-- Stable structure IDs require existing nodes to be updated and reordered in place.
-- Position constraints are deferred until transaction commit so nodes can temporarily
-- overlap positions while Hibernate applies a complete reorder.
-- -----------------------------------------------------------------------------------------------------------------


-- -----------------------------------------------------------------------------------------------------------------
-- Workout template positions
-- -----------------------------------------------------------------------------------------------------------------

ALTER TABLE workout_template_sections
    DROP CONSTRAINT uq_workout_template_sections_position,
        ADD CONSTRAINT uq_workout_template_sections_position
            UNIQUE (workout_template_id, position)
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE workout_template_items
    DROP CONSTRAINT uq_workout_template_items_position,
        ADD CONSTRAINT uq_workout_template_items_position
            UNIQUE (workout_template_section_id, position)
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE workout_template_item_exercises
    DROP CONSTRAINT uq_workout_template_item_exercises_position,
        ADD CONSTRAINT uq_workout_template_item_exercises_position
            UNIQUE (workout_template_item_id, position)
            DEFERRABLE INITIALLY DEFERRED;


-- -----------------------------------------------------------------------------------------------------------------
-- Client workout positions
-- -----------------------------------------------------------------------------------------------------------------

ALTER TABLE client_workout_sections
    DROP CONSTRAINT uq_client_workout_sections_position,
        ADD CONSTRAINT uq_client_workout_sections_position
            UNIQUE (client_workout_id, position)
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE client_workout_items
    DROP CONSTRAINT uq_client_workout_items_position,
        ADD CONSTRAINT uq_client_workout_items_position
            UNIQUE (client_workout_section_id, position)
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE client_workout_item_exercises
    DROP CONSTRAINT uq_client_workout_item_exercises_position,
        ADD CONSTRAINT uq_client_workout_item_exercises_position
            UNIQUE (client_workout_item_id, position)
            DEFERRABLE INITIALLY DEFERRED;


-- -----------------------------------------------------------------------------------------------------------------
-- Client workout lifecycle
-- -----------------------------------------------------------------------------------------------------------------
--
-- A client workout begins as a ready-to-perform workout, becomes the active
-- live workout when started, and becomes the completed workout record.
-- -----------------------------------------------------------------------------------------------------------------

ALTER TABLE client_workouts
    ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'READY',
    ADD COLUMN started_at TIMESTAMP,
    ADD COLUMN completed_at TIMESTAMP,

    ADD CONSTRAINT chk_client_workout_status CHECK (
        status IN ('READY', 'IN_PROGRESS', 'COMPLETED')
    ),

    ADD CONSTRAINT chk_client_workout_lifecycle CHECK (
        (status = 'READY'
            AND started_at IS NULL
            AND completed_at IS NULL)
        OR
        (status = 'IN_PROGRESS'
            AND started_at IS NOT NULL
            AND completed_at IS NULL)
        OR
        (status = 'COMPLETED'
            AND started_at IS NOT NULL
            AND completed_at IS NOT NULL)
    );

ALTER TABLE client_workouts
    ALTER COLUMN status DROP DEFAULT;


-- -----------------------------------------------------------------------------------------------------------------
-- Only one client workout may be in progress per client
-- -----------------------------------------------------------------------------------------------------------------

CREATE UNIQUE INDEX uq_client_workouts_one_in_progress_per_client
    ON client_workouts (client_id)
    WHERE status = 'IN_PROGRESS'
      AND archived_at IS NULL;


-- -----------------------------------------------------------------------------------------------------------------
-- Client workout performed set results
-- -----------------------------------------------------------------------------------------------------------------
--
-- Each row stores the actual values entered for one prescribed workout set.
--
-- A direct exercise result references client_workout_items.
-- An exercise inside a superset, triset, or circuit references client_workout_item_exercises.
--
-- values_json is organized by result side:
--
--     {
--         "default": {
--             "reps": 8,
--             "weight": 185
--         }
--     }
--
-- or, for each-side exercises:
--
--     {
--         "left": {
--             "reps": 8
--         },
--         "right": {
--             "reps": 7
--         }
--     }
--
-- completed_at remains null while values are merely autosaved. Once populated, the set
-- is considered completed and its structural workout configuration can no longer be changed.
-- -----------------------------------------------------------------------------------------------------------------

CREATE TABLE client_workout_set_results (
    id BIGSERIAL PRIMARY KEY,

    client_workout_id BIGINT NOT NULL REFERENCES client_workouts(id) ON DELETE CASCADE,

    client_workout_item_id BIGINT REFERENCES client_workout_items(id) ON DELETE CASCADE,

    client_workout_item_exercise_id BIGINT REFERENCES client_workout_item_exercises(id) ON DELETE CASCADE,

    set_key VARCHAR(64) NOT NULL,

    values_json JSONB NOT NULL DEFAULT '{}'::jsonb,

    notes TEXT,

    completed_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_client_workout_set_results_exercise_source CHECK (
        num_nonnulls(
                client_workout_item_id,
                client_workout_item_exercise_id
        ) = 1
    ),

    CONSTRAINT chk_client_workout_set_results_values_object CHECK (
        jsonb_typeof(values_json) = 'object'
    )
);

CREATE INDEX idx_client_workout_set_results_workout_id ON client_workout_set_results(client_workout_id);

CREATE UNIQUE INDEX uq_client_workout_set_results_direct_set ON client_workout_set_results(
        client_workout_item_id,
        set_key
    )
    WHERE client_workout_item_id IS NOT NULL;

CREATE UNIQUE INDEX uq_client_workout_set_results_stack_set ON client_workout_set_results(
        client_workout_item_exercise_id,
        set_key
    )
    WHERE client_workout_item_exercise_id IS NOT NULL;

CREATE INDEX idx_client_workout_set_results_completed_workout ON client_workout_set_results(client_workout_id)
    WHERE completed_at IS NOT NULL;


-- -----------------------------------------------------------------------------------------------------------------
-- Client workout benchmark snapshots
-- -----------------------------------------------------------------------------------------------------------------
--
-- Benchmark-based workout targets must remain stable after a live session is
-- completed, even if the client's current benchmark is later changed or removed.
--
-- One immutable snapshot is retained for each benchmark type used by an exercise in a client workout.
-- Missing snapshots may be added while the workout remains in progress when its structure gains a new benchmark-based target.
-- -----------------------------------------------------------------------------------------------------------------

CREATE TABLE client_workout_benchmark_snapshots (
    id BIGSERIAL PRIMARY KEY,

    client_workout_id BIGINT NOT NULL REFERENCES client_workouts(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id),
    source_benchmark_id BIGINT REFERENCES client_exercise_benchmarks(id) ON DELETE SET NULL,

    benchmark_type VARCHAR(64) NOT NULL,
    value NUMERIC(12, 3) NOT NULL,
    unit VARCHAR(32),
    basis VARCHAR(32) NOT NULL,

    achieved_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_client_workout_benchmark_snapshot UNIQUE (client_workout_id, exercise_id, benchmark_type),

    CONSTRAINT chk_client_workout_benchmark_snapshot_value_positive CHECK (
        value > 0
    )
);

CREATE INDEX idx_client_workout_benchmark_snapshots_workout_id ON client_workout_benchmark_snapshots(client_workout_id);