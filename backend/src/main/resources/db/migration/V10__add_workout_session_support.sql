-- -----------------------------------------------------------------------------------------------------------------
-- Allow workout structures to be reconciled in place
-- -----------------------------------------------------------------------------------------------------------------
--
-- Workout templates and client workouts previously deleted and recreated their
-- complete nested structures during updates.
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