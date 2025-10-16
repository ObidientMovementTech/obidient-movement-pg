CREATE TABLE IF NOT EXISTS inec_voters (
    id SERIAL PRIMARY KEY,
    state VARCHAR(100) NOT NULL,
    lga VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    polling_unit VARCHAR(200) NOT NULL,
    polling_unit_code VARCHAR(50),
    phone_number VARCHAR(20) NOT NULL,
    full_name VARCHAR(200),
    email_address VARCHAR(255),
    gender VARCHAR(10),
    age_group VARCHAR(20),
    called_recently BOOLEAN DEFAULT FALSE,
    last_called_date TIMESTAMP,
    confirmed_to_vote BOOLEAN DEFAULT NULL,
    demands TEXT,
    notes TEXT,
    call_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imported_by UUID REFERENCES users (id),
    last_updated_by UUID REFERENCES users (id),
    CONSTRAINT unique_phone_per_polling_unit UNIQUE (
        phone_number,
        polling_unit_code
    )
);