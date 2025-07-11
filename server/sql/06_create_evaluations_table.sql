-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    
    -- Assessor information
    assessorFullName VARCHAR(255) NOT NULL,
    assessorEmail VARCHAR(255) NOT NULL,
    assessorPhone VARCHAR(20) NOT NULL,
    assessorOrganisation VARCHAR(255),
    assessorState VARCHAR(100) NOT NULL,
    assessorVotingExperience VARCHAR(50) NOT NULL CHECK (assessorVotingExperience IN ('First-time voter', 'Con-current voter', 'Not Interested in voting')),
    assessorDesignation VARCHAR(100) NOT NULL CHECK (assessorDesignation IN (
        'Electoral Commission Official',
        'Political Party Representative',
        'Civil Society Organisation Representative',
        'Academic/Researcher',
        'Independent Evaluator',
        'Citizen',
        'Other'
    )),
    assessorOtherDesignation VARCHAR(255), -- Only used when designation is 'Other'
    
    -- Candidate information
    candidateName VARCHAR(255) NOT NULL,
    candidatePosition VARCHAR(255) NOT NULL,
    candidateParty VARCHAR(255),
    candidateState VARCHAR(100) NOT NULL,
    
    -- Scoring information
    capacityScore INTEGER NOT NULL CHECK (capacityScore >= 0 AND capacityScore <= 100),
    competenceScore INTEGER NOT NULL CHECK (competenceScore >= 0 AND competenceScore <= 100),
    characterScore INTEGER NOT NULL CHECK (characterScore >= 0 AND characterScore <= 100),
    finalScore INTEGER NOT NULL CHECK (finalScore >= 0 AND finalScore <= 100),
    
    -- Timestamps
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_evaluations_candidate ON evaluations(candidateName, candidatePosition, candidateState);
CREATE INDEX IF NOT EXISTS idx_evaluations_assessor_email ON evaluations(assessorEmail);
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON evaluations(createdAt);
CREATE INDEX IF NOT EXISTS idx_evaluations_final_score ON evaluations(finalScore);

-- Add trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_evaluations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_evaluations_updated_at
    BEFORE UPDATE ON evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_evaluations_updated_at();
