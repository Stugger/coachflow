CREATE TABLE workout_templates (
    id BIGSERIAL PRIMARY KEY,

    trainer_id BIGINT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,

    archived BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_templates_trainer_id ON workout_templates(trainer_id);
CREATE INDEX idx_workout_templates_archived ON workout_templates(archived);
CREATE INDEX idx_workout_templates_name_lower ON workout_templates(LOWER(name));


CREATE TABLE workout_template_sections (
    id BIGSERIAL PRIMARY KEY,

    workout_template_id BIGINT NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,

    position INTEGER NOT NULL,

    name VARCHAR(255),
    section_type VARCHAR(32) NOT NULL,

    notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_workout_template_sections_position UNIQUE (workout_template_id, position),
    CONSTRAINT chk_workout_template_sections_position_positive CHECK (position > 0),
    CONSTRAINT chk_workout_template_sections_type CHECK (
       section_type IN ('WORKOUT', 'WARMUP', 'STRENGTH', 'CARDIO', 'MOBILITY', 'STABILITY', 'COOLDOWN', 'OTHER')
    )
);

CREATE INDEX idx_workout_template_sections_template_id ON workout_template_sections(workout_template_id);
CREATE INDEX idx_workout_template_sections_type ON workout_template_sections(section_type);


CREATE TABLE workout_template_items (
    id BIGSERIAL PRIMARY KEY,

    workout_template_section_id BIGINT NOT NULL REFERENCES workout_template_sections(id) ON DELETE CASCADE,

    position INTEGER NOT NULL,

    item_type VARCHAR(32) NOT NULL,

    exercise_id BIGINT REFERENCES exercises(id),

    name VARCHAR(255),
    rounds INTEGER,

    notes TEXT,
    config_json JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_workout_template_items_position UNIQUE (workout_template_section_id, position),
    CONSTRAINT chk_workout_template_items_position_positive CHECK (position > 0),
    CONSTRAINT chk_workout_template_items_type CHECK (
        item_type IN ('EXERCISE', 'SUPERSET', 'TRISET', 'CIRCUIT')
    ),
    CONSTRAINT chk_workout_template_items_rounds_positive CHECK (
        rounds IS NULL OR rounds > 0
    ),
    CONSTRAINT chk_workout_template_items_source CHECK (
        (item_type = 'EXERCISE' AND exercise_id IS NOT NULL)
            OR
        (item_type IN ('SUPERSET', 'TRISET', 'CIRCUIT') AND exercise_id IS NULL)
    )
);

CREATE INDEX idx_workout_template_items_section_id ON workout_template_items(workout_template_section_id);
CREATE INDEX idx_workout_template_items_exercise_id ON workout_template_items(exercise_id);
CREATE INDEX idx_workout_template_items_item_type ON workout_template_items(item_type);
CREATE INDEX idx_workout_template_items_config_json ON workout_template_items USING GIN (config_json);


CREATE TABLE workout_template_item_exercises (
    id BIGSERIAL PRIMARY KEY,

    workout_template_item_id BIGINT NOT NULL REFERENCES workout_template_items(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id),

    position INTEGER NOT NULL,

    notes TEXT,
    config_json JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_workout_template_item_exercises_position UNIQUE (workout_template_item_id, position),
    CONSTRAINT chk_workout_template_item_exercises_position_positive CHECK (position > 0)
);

CREATE INDEX idx_workout_template_item_exercises_item_id ON workout_template_item_exercises(workout_template_item_id);
CREATE INDEX idx_workout_template_item_exercises_exercise_id ON workout_template_item_exercises(exercise_id);
CREATE INDEX idx_workout_template_item_exercises_config_json ON workout_template_item_exercises USING GIN (config_json);