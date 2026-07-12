CREATE TABLE client_exercise_benchmarks (
    id BIGSERIAL PRIMARY KEY,

    trainer_id BIGINT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,

    benchmark_type VARCHAR(64) NOT NULL,
    value NUMERIC(12, 3) NOT NULL,
    unit VARCHAR(32),
    basis VARCHAR(32) NOT NULL,

    achieved_at TIMESTAMP NOT NULL,
    notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_client_exercise_benchmarks_value_positive CHECK (
        value > 0
    )
);

CREATE INDEX idx_client_exercise_benchmarks_trainer_id ON client_exercise_benchmarks(trainer_id);

CREATE INDEX idx_client_exercise_benchmarks_exercise_id ON client_exercise_benchmarks(exercise_id);

CREATE INDEX idx_client_exercise_benchmarks_lookup ON client_exercise_benchmarks (
    client_id,
    exercise_id,
    benchmark_type,
    achieved_at DESC,
    created_at DESC,
    id DESC
);
