CREATE TABLE IF NOT EXISTS polling_unit_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    submission_id VARCHAR(255) UNIQUE NOT NULL,
    monitor_user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    polling_unit_code VARCHAR(255) NOT NULL,
    polling_unit_name TEXT NOT NULL,
    ward_code VARCHAR(255),
    ward_name VARCHAR(255) NOT NULL,
    lga_code VARCHAR(255),
    lga_name VARCHAR(255) NOT NULL,
    state_code VARCHAR(255),
    state_name VARCHAR(255) NOT NULL,
    gps_coordinates TEXT,
    location_type VARCHAR(100),
    location_other TEXT,
    monitor_name VARCHAR(255) NOT NULL,
    monitor_phone VARCHAR(50) NOT NULL,
    monitor_email VARCHAR(255) NOT NULL,
    team_size INTEGER DEFAULT 1,
    special_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS officer_arrival_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    submission_id VARCHAR(255) REFERENCES polling_unit_submissions (submission_id) ON DELETE CASCADE,
    first_arrival_time TIME,
    last_arrival_time TIME,
    on_time_status VARCHAR(50),
    proof_types TEXT [],
    arrival_notes TEXT,
    officer_names JSONB,
    voting_started VARCHAR(10),
    actual_start_time TIME,
    materials_verification JSONB,
    security_presence VARCHAR(10),
    setup_completion_time TIME,
    contextual_notes TEXT,
    arrival_photos TEXT [],
    officer_photos JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS result_tracking_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    submission_id VARCHAR(255) REFERENCES polling_unit_submissions (submission_id) ON DELETE CASCADE,
    polling_info JSONB,
    registered_voters INTEGER,
    accredited_voters INTEGER,
    valid_votes INTEGER,
    rejected_votes INTEGER,
    total_votes_cast INTEGER,
    votes_per_party JSONB,
    ec8a_photos TEXT [],
    announcement_videos TEXT [],
    result_sheet_photos TEXT [],
    wall_posting_photos TEXT [],
    result_announced_by VARCHAR(255),
    announcement_time TIMESTAMPTZ,
    party_agents_present JSONB,
    discrepancies_noted TEXT,
    result_upload_status VARCHAR(50),
    additional_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    submission_id VARCHAR(255) REFERENCES polling_unit_submissions (submission_id) ON DELETE CASCADE,
    officer_name_or_id VARCHAR(255),
    incident_date DATE,
    incident_start_time TIME,
    incident_end_time TIME,
    capture_method TEXT [],
    weather_conditions VARCHAR(255),
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    irregularities TEXT [],
    incident_narrative TEXT NOT NULL,
    perpetrators TEXT,
    victims TEXT,
    officials_present TEXT,
    witnesses JSONB,
    reported_to_authorities VARCHAR(255),
    authority_response TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    additional_notes TEXT,
    evidence_photos TEXT [],
    evidence_videos TEXT [],
    evidence_documents TEXT [],
    incident_resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    escalation_level VARCHAR(50) DEFAULT 'local',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    submission_id VARCHAR(255) UNIQUE NOT NULL REFERENCES polling_unit_submissions (submission_id) ON DELETE CASCADE,
    polling_unit_submitted BOOLEAN DEFAULT false,
    officer_arrival_submitted BOOLEAN DEFAULT false,
    result_tracking_submitted BOOLEAN DEFAULT false,
    incident_count INTEGER DEFAULT 0,
    current_phase VARCHAR(50) DEFAULT 'setup',
    workflow_completed BOOLEAN DEFAULT false,
    quality_check_passed BOOLEAN DEFAULT false,
    first_submission_at TIMESTAMPTZ,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    completion_time TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_polling_submissions_monitor ON polling_unit_submissions (monitor_user_id);

CREATE INDEX IF NOT EXISTS idx_polling_submissions_code ON polling_unit_submissions (polling_unit_code);

CREATE INDEX IF NOT EXISTS idx_polling_submissions_location ON polling_unit_submissions (
    state_name,
    lga_name,
    ward_name
);

CREATE INDEX IF NOT EXISTS idx_polling_submissions_created ON polling_unit_submissions (created_at);

CREATE INDEX IF NOT EXISTS idx_officer_arrival_submission ON officer_arrival_reports (submission_id);

CREATE INDEX IF NOT EXISTS idx_officer_arrival_time ON officer_arrival_reports (last_arrival_time);

CREATE INDEX IF NOT EXISTS idx_result_tracking_submission ON result_tracking_reports (submission_id);

CREATE INDEX IF NOT EXISTS idx_result_tracking_announced ON result_tracking_reports (announcement_time);

CREATE INDEX IF NOT EXISTS idx_incident_reports_submission ON incident_reports (submission_id);

CREATE INDEX IF NOT EXISTS idx_incident_reports_type ON incident_reports (incident_type);

CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON incident_reports (severity);

CREATE INDEX IF NOT EXISTS idx_incident_reports_date ON incident_reports (incident_date);

CREATE INDEX IF NOT EXISTS idx_submission_status_phase ON submission_status (current_phase);

CREATE INDEX IF NOT EXISTS idx_submission_status_completed ON submission_status (workflow_completed);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_polling_unit_submissions_updated_at BEFORE UPDATE ON polling_unit_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_officer_arrival_reports_updated_at BEFORE UPDATE ON officer_arrival_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_result_tracking_reports_updated_at BEFORE UPDATE ON result_tracking_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incident_reports_updated_at BEFORE UPDATE ON incident_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_submission_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'officer_arrival_reports' THEN
        INSERT INTO submission_status (submission_id, officer_arrival_submitted, last_updated_at)
        VALUES (NEW.submission_id, true, NOW())
        ON CONFLICT (submission_id) 
        DO UPDATE SET 
            officer_arrival_submitted = true,
            last_updated_at = NOW();
    END IF;
    
    IF TG_TABLE_NAME = 'result_tracking_reports' THEN
        INSERT INTO submission_status (submission_id, result_tracking_submitted, last_updated_at)
        VALUES (NEW.submission_id, true, NOW())
        ON CONFLICT (submission_id) 
        DO UPDATE SET 
            result_tracking_submitted = true,
            last_updated_at = NOW();
    END IF;
    
    IF TG_TABLE_NAME = 'incident_reports' THEN
        INSERT INTO submission_status (submission_id, incident_count, last_updated_at)
        VALUES (NEW.submission_id, 1, NOW())
        ON CONFLICT (submission_id) 
        DO UPDATE SET 
            incident_count = submission_status.incident_count + 1,
            last_updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_officer_arrival_status AFTER INSERT ON officer_arrival_reports FOR EACH ROW EXECUTE FUNCTION update_submission_status();

CREATE TRIGGER trigger_update_result_tracking_status AFTER INSERT ON result_tracking_reports FOR EACH ROW EXECUTE FUNCTION update_submission_status();

CREATE TRIGGER trigger_update_incident_status AFTER INSERT ON incident_reports FOR EACH ROW EXECUTE FUNCTION update_submission_status();

CREATE OR REPLACE FUNCTION create_initial_submission_status()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO submission_status (
        submission_id, 
        polling_unit_submitted, 
        first_submission_at,
        last_updated_at
    )
    VALUES (
        NEW.submission_id, 
        true, 
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_initial_status 
    AFTER INSERT ON polling_unit_submissions 
    FOR EACH ROW EXECUTE FUNCTION create_initial_submission_status();