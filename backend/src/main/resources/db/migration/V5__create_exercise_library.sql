CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,

    trainer_id BIGINT REFERENCES trainers(id) ON DELETE CASCADE,
    visibility VARCHAR(32) NOT NULL,

    name VARCHAR(255) NOT NULL,
    details TEXT,
    thumbnail_url TEXT,
    demo_video_url TEXT,
    metadata_json JSONB,

    archived BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_exercises_visibility CHECK (visibility IN ('GLOBAL', 'TRAINER')),
    CONSTRAINT chk_exercises_owner CHECK (
        (visibility = 'GLOBAL' AND trainer_id IS NULL)
        OR
        (visibility = 'TRAINER' AND trainer_id IS NOT NULL)
    )
);

CREATE INDEX idx_exercises_trainer_id ON exercises(trainer_id);
CREATE INDEX idx_exercises_visibility ON exercises(visibility);
CREATE INDEX idx_exercises_archived ON exercises(archived);
CREATE INDEX idx_exercises_name_lower ON exercises(LOWER(name));
CREATE INDEX idx_exercises_metadata_json ON exercises USING GIN (metadata_json);
