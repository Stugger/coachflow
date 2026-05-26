CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(16) NOT NULL CHECK (role IN ('ADMIN', 'TRAINER', 'CLIENT')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trainers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id),
    first_name VARCHAR(32) NOT NULL,
    last_name VARCHAR(32) NOT NULL,
    birth_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    trainer_id BIGINT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    user_id BIGINT UNIQUE REFERENCES users(id),
    first_name VARCHAR(32) NOT NULL,
    last_name VARCHAR(32) NOT NULL,
    preferred_name VARCHAR(32),
    email VARCHAR(255),
    phone VARCHAR(32),
    birth_date DATE,
    goals TEXT,
    limitations TEXT,
    general_notes TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trainers_user_id ON trainers(user_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_trainer_id ON clients(trainer_id);
CREATE INDEX idx_clients_last_name ON clients(last_name);