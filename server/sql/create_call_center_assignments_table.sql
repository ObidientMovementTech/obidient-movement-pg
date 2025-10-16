CREATE TABLE IF NOT EXISTS call_center_assignments (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id),
    state VARCHAR(100) NOT NULL,
    lga VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    polling_unit VARCHAR(200) NOT NULL,
    polling_unit_code VARCHAR(50),
    assigned_by UUID REFERENCES users (id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);