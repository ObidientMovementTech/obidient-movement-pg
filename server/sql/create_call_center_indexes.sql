-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inec_voters_location ON inec_voters (
    state,
    lga,
    ward,
    polling_unit_code
);

CREATE INDEX IF NOT EXISTS idx_inec_voters_phone ON inec_voters (phone_number);

CREATE INDEX IF NOT EXISTS idx_inec_voters_called_recently ON inec_voters (
    called_recently,
    last_called_date
);

CREATE INDEX IF NOT EXISTS idx_call_assignments_user ON call_center_assignments (user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_call_assignments_polling ON call_center_assignments (polling_unit_code, is_active);

CREATE INDEX IF NOT EXISTS idx_call_logs_voter ON call_logs (voter_id, call_date);

CREATE INDEX IF NOT EXISTS idx_call_logs_volunteer ON call_logs (volunteer_id, call_date);