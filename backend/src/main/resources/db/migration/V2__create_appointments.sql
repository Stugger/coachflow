CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,

    trainer_id BIGINT NOT NULL REFERENCES trainers(id),
    client_id BIGINT NOT NULL REFERENCES clients(id),

    title VARCHAR(255),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_appointments_trainer_start ON appointments(trainer_id, start_time);
CREATE INDEX idx_appointments_client_start ON appointments(client_id, start_time);
CREATE INDEX idx_appointments_status ON appointments(status);