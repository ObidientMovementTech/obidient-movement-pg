-- Election Monitoring Database Schema - UPDATED VERSION
-- This file creates comprehensive tables for the Vote Protection Officer monitoring system
-- Updated to match all data points from form components

-- ================================
-- POLLING UNIT INFORMATION TABLE
-- ================================
CREATE TABLE IF NOT EXISTS polling_unit_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id VARCHAR(255) UNIQUE NOT NULL,
    monitor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

-- Basic Polling Unit Details (from PUInfoForm)
polling_unit_code VARCHAR(255) NOT NULL, -- 'code' field
polling_unit_name TEXT NOT NULL, -- 'name' field
ward_code VARCHAR(255),
ward_name VARCHAR(255) NOT NULL, -- 'ward' field
lga_code VARCHAR(255),
lga_name VARCHAR(255) NOT NULL, -- 'lga' field
state_code VARCHAR(255),
state_name VARCHAR(255) NOT NULL, -- 'state' field

-- Location Data
gps_coordinates TEXT, -- 'gpsCoordinates' field from geolocation
location_type VARCHAR(100), -- 'locationType' field
location_other TEXT, -- 'locationOther' field when locationType is 'Other'

-- Monitor Information (from user profile/form)
monitor_name VARCHAR(255) NOT NULL,
monitor_phone VARCHAR(50) NOT NULL,
monitor_email VARCHAR(255) NOT NULL,
team_size INTEGER DEFAULT 1,
special_notes TEXT,

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- OFFICER ARRIVAL REPORTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS officer_arrival_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id VARCHAR(255) NOT NULL REFERENCES polling_unit_submissions(submission_id) ON DELETE CASCADE,

-- Arrival Tracking (from ArrivalTracking.tsx)
first_arrival_time TIME, -- auto-generated
last_arrival_time TIME, -- 'lastArrivalTime' field
on_time_status VARCHAR(50), -- 'onTimeStatus' field: 'Yes', 'Late', 'Too Early'
proof_types TEXT [], -- 'proofTypes' array: ['Time-stamped Photo', 'Bodycam Footage', etc]
arrival_notes TEXT, -- 'arrivalNotes' field

-- INEC Officer Identity (from INECIdentityVerification.tsx)
officer_names JSONB, -- structured as {po: {name: '', photo: ''}, apo1: {name: '', photo: ''}, etc}

-- Contextual Information (from ContextualNotes.tsx)
voting_started VARCHAR(10), -- 'votingStarted' field
actual_start_time TIME, -- 'actualStartTime' field
materials_verification JSONB, -- materials checklist
security_presence VARCHAR(10), -- security verification
setup_completion_time TIME,
contextual_notes TEXT,

-- Photo Evidence
arrival_photos TEXT [], -- array of photo file paths/URLs
officer_photos JSONB, -- {po_photo: '', apo1_photo: '', etc}

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- RESULT TRACKING REPORTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS result_tracking_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id VARCHAR(255) NOT NULL REFERENCES polling_unit_submissions(submission_id) ON DELETE CASCADE,

-- Polling Unit Info (from PollingUnitInfo.tsx in result-tracking)
polling_info JSONB, -- comprehensive polling unit details

-- Result Details (from PUResultDetails.tsx)
registered_voters INTEGER, -- 'registered' field
accredited_voters INTEGER, -- 'accredited' field
valid_votes INTEGER, -- 'valid' field
rejected_votes INTEGER, -- 'rejected' field
total_votes_cast INTEGER, -- 'total' field

-- Party Results (from PUResultDetails.tsx)
votes_per_party JSONB, -- array: [{party: 'LP', votes: 0}, {party: 'APC', votes: 0}, etc]

-- Result Evidence (from ResultEvidenceUpload.tsx)
ec8a_photos TEXT [], -- uploaded result form photos
announcement_videos TEXT [], -- recorded announcement videos
result_sheet_photos TEXT [], -- result sheet documentation
wall_posting_photos TEXT [], -- photos of results posted

-- Additional Result Data
result_announced_by VARCHAR(255), -- officer who announced
announcement_time TIMESTAMPTZ,
party_agents_present JSONB, -- [{name: '', party: '', present: boolean}]
discrepancies_noted TEXT,
result_upload_status VARCHAR(50),
additional_notes TEXT,

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- INCIDENT REPORTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id VARCHAR(255) NOT NULL REFERENCES polling_unit_submissions(submission_id) ON DELETE CASCADE,

-- Incident Basics (from IncidentBasics.tsx)
officer_name_or_id VARCHAR(255), -- 'officerNameOrId' field
incident_date DATE, -- 'incidentDate' field
incident_start_time TIME, -- 'incidentStart' field
incident_end_time TIME, -- 'incidentEnd' field
capture_method TEXT [], -- 'captureMethod' array: ['Mobile Camera', 'Body Camera', etc]
weather_conditions VARCHAR(255), -- 'conditions' field

-- Incident Details (from IncidentDetails.tsx)
incident_type VARCHAR(100) NOT NULL,
severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
irregularities TEXT [], -- array of irregularity types
incident_narrative TEXT NOT NULL, -- detailed description
perpetrators TEXT, -- who was involved
victims TEXT, -- who was affected
officials_present TEXT, -- officials present during incident

-- Witness Information (from WitnessInfo.tsx)
witnesses JSONB, -- array: [{name: '', phone: '', consent: ''}]

-- Escalation Report (from EscalationReport.tsx)
reported_to_authorities VARCHAR(255), -- 'reportedToAuthorities' field
authority_response TEXT,
follow_up_required BOOLEAN DEFAULT false,
additional_notes TEXT, -- 'additionalNotes' field

-- Evidence Files
evidence_photos TEXT [], -- incident photos
evidence_videos TEXT [], -- incident videos
evidence_documents TEXT [], -- related documents

-- Status and Resolution
incident_resolved BOOLEAN DEFAULT false,
resolution_notes TEXT,
escalation_level VARCHAR(50) DEFAULT 'local',

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- SUBMISSION STATUS TRACKING TABLE
-- ================================
CREATE TABLE IF NOT EXISTS submission_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id VARCHAR(255) UNIQUE NOT NULL REFERENCES polling_unit_submissions(submission_id) ON DELETE CASCADE,

-- Form Completion Status
polling_unit_submitted BOOLEAN DEFAULT false,
officer_arrival_submitted BOOLEAN DEFAULT false,
result_tracking_submitted BOOLEAN DEFAULT false,
incident_count INTEGER DEFAULT 0,

-- Workflow Status
current_phase VARCHAR(50) DEFAULT 'setup', -- 'setup', 'voting', 'counting', 'completed'
workflow_completed BOOLEAN DEFAULT false,
quality_check_passed BOOLEAN DEFAULT false,

-- Timestamps
first_submission_at TIMESTAMPTZ,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    completion_time TIMESTAMPTZ
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================
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

-- ================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all main tables
CREATE TRIGGER update_polling_unit_submissions_updated_at BEFORE UPDATE ON polling_unit_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_officer_arrival_reports_updated_at BEFORE UPDATE ON officer_arrival_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_result_tracking_reports_updated_at BEFORE UPDATE ON result_tracking_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incident_reports_updated_at BEFORE UPDATE ON incident_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update submission status when forms are completed
CREATE OR REPLACE FUNCTION update_submission_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update submission status when officer arrival report is inserted
    IF TG_TABLE_NAME = 'officer_arrival_reports' THEN
        INSERT INTO submission_status (submission_id, officer_arrival_submitted, last_updated_at)
        VALUES (NEW.submission_id, true, NOW())
        ON CONFLICT (submission_id) 
        DO UPDATE SET 
            officer_arrival_submitted = true,
            last_updated_at = NOW();
    END IF;
    
    -- Update submission status when result tracking report is inserted
    IF TG_TABLE_NAME = 'result_tracking_reports' THEN
        INSERT INTO submission_status (submission_id, result_tracking_submitted, last_updated_at)
        VALUES (NEW.submission_id, true, NOW())
        ON CONFLICT (submission_id) 
        DO UPDATE SET 
            result_tracking_submitted = true,
            last_updated_at = NOW();
    END IF;
    
    -- Update incident count when incident report is inserted
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

-- Apply status update triggers
CREATE TRIGGER trigger_update_officer_arrival_status AFTER INSERT ON officer_arrival_reports FOR EACH ROW EXECUTE FUNCTION update_submission_status();

CREATE TRIGGER trigger_update_result_tracking_status AFTER INSERT ON result_tracking_reports FOR EACH ROW EXECUTE FUNCTION update_submission_status();

CREATE TRIGGER trigger_update_incident_status AFTER INSERT ON incident_reports FOR EACH ROW EXECUTE FUNCTION update_submission_status();

-- ================================
-- INITIAL STATUS RECORD TRIGGER
-- ================================
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