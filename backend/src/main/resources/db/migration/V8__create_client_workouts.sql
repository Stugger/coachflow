-- -----------------------------------------------------------------------------------------------------------------
-- Based on workout_templates
-- -----------------------------------------------------------------------------------------------------------------

CREATE TABLE client_workouts (
    id BIGSERIAL PRIMARY KEY,

    trainer_id BIGINT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    source_workout_template_id BIGINT REFERENCES workout_templates(id) ON DELETE SET NULL,

    origin VARCHAR(32) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'DRAFT',

    name VARCHAR(255) NOT NULL,
    description TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP NULL,

    CONSTRAINT chk_client_workout_origin CHECK (
        origin IN ('ASSESSMENT', 'PROGRAM', 'ASSIGNMENT')
    ),
    CONSTRAINT chk_client_workout_status CHECK (
        status IN ('DRAFT', 'READY')
    )
);

CREATE INDEX idx_client_workouts_trainer_id ON client_workouts(trainer_id);
CREATE INDEX idx_client_workouts_client_id ON client_workouts(client_id);
CREATE INDEX idx_client_workouts_client_active_origin_updated ON client_workouts(client_id, origin, updated_at DESC)
    WHERE archived_at IS NULL;
CREATE INDEX idx_client_workouts_source_template_id ON client_workouts(source_workout_template_id)
    WHERE source_workout_template_id IS NOT NULL;


-- -----------------------------------------------------------------------------------------------------------------
-- Mirror of workout_template_sections
-- -----------------------------------------------------------------------------------------------------------------

CREATE TABLE client_workout_sections (
    id BIGSERIAL PRIMARY KEY,

    client_workout_id BIGINT NOT NULL REFERENCES client_workouts(id) ON DELETE CASCADE,

    position INTEGER NOT NULL,

    name VARCHAR(255),
    section_type VARCHAR(32) NOT NULL,

    notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_client_workout_sections_position UNIQUE (client_workout_id, position),
    CONSTRAINT chk_client_workout_sections_position_positive CHECK (position > 0),
    CONSTRAINT chk_client_workout_sections_type CHECK (
       section_type IN ('REGULAR', 'WARMUP', 'STRENGTH', 'CARDIO', 'MOBILITY', 'STABILITY', 'COOLDOWN', 'OTHER')
    )
);


-- -----------------------------------------------------------------------------------------------------------------
-- Mirror of workout_template_items
-- -----------------------------------------------------------------------------------------------------------------

CREATE TABLE client_workout_items (
    id BIGSERIAL PRIMARY KEY,

    client_workout_section_id BIGINT NOT NULL REFERENCES client_workout_sections(id) ON DELETE CASCADE,

    position INTEGER NOT NULL,

    item_type VARCHAR(32) NOT NULL,

    exercise_id BIGINT REFERENCES exercises(id),

    name VARCHAR(255),
    rounds INTEGER,

    notes TEXT,
    config_json JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_client_workout_items_position UNIQUE (client_workout_section_id, position),
    CONSTRAINT chk_client_workout_items_position_positive CHECK (position > 0),
    CONSTRAINT chk_client_workout_items_type CHECK (
        item_type IN ('EXERCISE', 'SUPERSET', 'TRISET', 'CIRCUIT')
    ),
    CONSTRAINT chk_client_workout_items_rounds_positive CHECK (
        rounds IS NULL OR rounds > 0
    ),
    CONSTRAINT chk_client_workout_items_source CHECK (
        (item_type = 'EXERCISE' AND exercise_id IS NOT NULL)
            OR
        (item_type IN ('SUPERSET', 'TRISET', 'CIRCUIT') AND exercise_id IS NULL)
    )
);

CREATE INDEX idx_client_workout_items_exercise_id ON client_workout_items(exercise_id) WHERE exercise_id IS NOT NULL;


-- -----------------------------------------------------------------------------------------------------------------
-- Mirror of workout_template_item_exercises
-- -----------------------------------------------------------------------------------------------------------------

CREATE TABLE client_workout_item_exercises (
    id BIGSERIAL PRIMARY KEY,

    client_workout_item_id BIGINT NOT NULL REFERENCES client_workout_items(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id),

    position INTEGER NOT NULL,

    name VARCHAR(255),

    notes TEXT,
    config_json JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_client_workout_item_exercises_position UNIQUE (client_workout_item_id, position),
    CONSTRAINT chk_client_workout_item_exercises_position_positive CHECK (position > 0)
);

CREATE INDEX idx_client_workout_item_exercises_exercise_id ON client_workout_item_exercises(exercise_id);