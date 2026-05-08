-- Involvement interests — tracks get-involved form submissions
CREATE TABLE IF NOT EXISTS involvement_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('volunteer', 'vote_protection_officer', 'donor')),
    state VARCHAR(100),
    lga VARCHAR(100),
    ward VARCHAR(200),
    is_diaspora BOOLEAN DEFAULT FALSE,
    country VARCHAR(100),
    skills TEXT[],
    experience_level VARCHAR(50),
    contribution_type VARCHAR(50),
    message TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'active', 'declined')),
    admin_notes TEXT,
    contacted_by UUID REFERENCES users(id),
    contacted_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_involvement_interests_email ON involvement_interests(email);
CREATE INDEX idx_involvement_interests_role ON involvement_interests(role);
CREATE INDEX idx_involvement_interests_status ON involvement_interests(status);
CREATE INDEX idx_involvement_interests_state ON involvement_interests(state);
CREATE INDEX idx_involvement_interests_created_at ON involvement_interests(created_at);
