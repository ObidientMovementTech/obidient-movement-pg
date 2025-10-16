CREATE TABLE IF NOT EXISTS call_logs (
    id SERIAL PRIMARY KEY,
    voter_id INTEGER NOT NULL REFERENCES inec_voters (id),
    volunteer_id UUID NOT NULL REFERENCES users (id),
    call_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    call_duration INTEGER,
    call_outcome VARCHAR(50),
    notes TEXT,
    data_collected JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);