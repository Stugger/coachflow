ALTER TABLE clients
    DROP COLUMN goals,
    DROP COLUMN limitations,
    DROP COLUMN general_notes,
    ADD COLUMN gender VARCHAR(32);

CREATE TABLE client_intakes (
    id BIGSERIAL PRIMARY KEY,

    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    trainer_id BIGINT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,

    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    current_step VARCHAR(64),

    goals_json JSONB,
    training_history_json JSONB,
    medical_history_json JSONB,
    injuries_limitations_json JSONB,
    lifestyle_json JSONB,
    preferences_json JSONB,
    parq_json JSONB,

    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_client_intakes_client_id ON client_intakes(client_id);
CREATE INDEX idx_client_intakes_trainer_id ON client_intakes(trainer_id);
CREATE INDEX idx_client_intakes_status ON client_intakes(status);

CREATE TABLE client_assessments (
    id BIGSERIAL PRIMARY KEY,

    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    trainer_id BIGINT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,

    type VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    current_step VARCHAR(64),

    assessment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trainer_notes TEXT,

    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_client_assessments_client_id ON client_assessments(client_id);
CREATE INDEX idx_client_assessments_trainer_id ON client_assessments(trainer_id);
CREATE INDEX idx_client_assessments_status ON client_assessments(status);
CREATE INDEX idx_client_assessments_type ON client_assessments(type);

CREATE TABLE assessment_entries (
    id BIGSERIAL PRIMARY KEY,

    assessment_id BIGINT NOT NULL REFERENCES client_assessments(id) ON DELETE CASCADE,

    category VARCHAR(32) NOT NULL,
    label VARCHAR(255) NOT NULL,
    value_number NUMERIC(10, 2),
    value_text VARCHAR(255),
    unit VARCHAR(64),
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    metadata_json JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessment_entries_assessment_id ON assessment_entries(assessment_id);
CREATE INDEX idx_assessment_entries_category ON assessment_entries(category);

CREATE TABLE assessment_templates (
    id BIGSERIAL PRIMARY KEY,

    trainer_id BIGINT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    default_template BOOLEAN NOT NULL DEFAULT FALSE,
    archived BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessment_templates_trainer_id ON assessment_templates(trainer_id);
CREATE INDEX idx_assessment_templates_trainer_default ON assessment_templates(trainer_id, default_template, archived);

CREATE TABLE assessment_template_entries (
     id BIGSERIAL PRIMARY KEY,

     template_id BIGINT NOT NULL REFERENCES assessment_templates(id) ON DELETE CASCADE,

     category VARCHAR(32) NOT NULL,
     label VARCHAR(255) NOT NULL,
     unit VARCHAR(64),
     sort_order INTEGER NOT NULL DEFAULT 0,
     metadata_json JSONB,

     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessment_template_entries_template_id ON assessment_template_entries(template_id);
CREATE INDEX idx_assessment_template_entries_category ON assessment_template_entries(category);