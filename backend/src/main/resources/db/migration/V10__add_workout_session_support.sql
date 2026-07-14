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