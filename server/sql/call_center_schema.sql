-- Call Center Database Schema
-- This schema supports the INEC voter data and call center functionality

-- Table for storing INEC registered voter data
CREATE TABLE inec_voters (
    id SERIAL PRIMARY KEY,
    state VARCHAR(100) NOT NULL,
    lga VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    polling_unit VARCHAR(200) NOT NULL,
    polling_unit_code VARCHAR(50),
    phone_number VARCHAR(20) NOT NULL,

-- Additional fields for call center data collection
full_name VARCHAR(200),
email_address VARCHAR(255),
gender VARCHAR(10),
age_group VARCHAR(20),

-- Call center tracking fields
called_recently BOOLEAN DEFAULT FALSE,
last_called_date TIMESTAMP,
confirmed_to_vote BOOLEAN DEFAULT NULL,
demands TEXT,
notes TEXT,
call_count INTEGER DEFAULT 0,

-- Metadata
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
imported_by INTEGER REFERENCES users (id),
last_updated_by INTEGER REFERENCES users (id),

-- Ensure unique phone numbers per polling unit
UNIQUE(phone_number, polling_unit_code) );

-- Table for call center assignments (volunteers to polling units)
CREATE TABLE call_center_assignments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    state VARCHAR(100) NOT NULL,
    lga VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    polling_unit VARCHAR(200) NOT NULL,
    polling_unit_code VARCHAR(50),

-- Assignment metadata
assigned_by INTEGER REFERENCES users (id),
assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
is_active BOOLEAN DEFAULT TRUE,

-- Ensure one volunteer per polling unit
UNIQUE(polling_unit_code, is_active) WHERE is_active = TRUE,
    -- Ensure one polling unit per volunteer
    UNIQUE(user_id, is_active) WHERE is_active = TRUE
);

-- Table for call logs/history
CREATE TABLE call_logs (
    id SERIAL PRIMARY KEY,
    voter_id INTEGER NOT NULL REFERENCES inec_voters (id),
    volunteer_id INTEGER NOT NULL REFERENCES users (id),
    call_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    call_duration INTEGER, -- in seconds
    call_outcome VARCHAR(50), -- 'answered', 'no_answer', 'busy', 'wrong_number', etc.
    notes TEXT,
    data_collected JSONB, -- flexible field for any additional data collected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_inec_voters_location ON inec_voters (
    state,
    lga,
    ward,
    polling_unit_code
);

CREATE INDEX idx_inec_voters_phone ON inec_voters (phone_number);

CREATE INDEX idx_inec_voters_called_recently ON inec_voters (
    called_recently,
    last_called_date
);

CREATE INDEX idx_call_assignments_user ON call_center_assignments (user_id, is_active);

CREATE INDEX idx_call_assignments_polling ON call_center_assignments (polling_unit_code, is_active);

CREATE INDEX idx_call_logs_voter ON call_logs (voter_id, call_date);

CREATE INDEX idx_call_logs_volunteer ON call_logs (volunteer_id, call_date);