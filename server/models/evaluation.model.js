import { query, getClient } from '../config/db.js';

class Evaluation {
  constructor(evaluationData) {
    Object.assign(this, evaluationData);
  }

  // Create a new evaluation
  static async create(evaluationData) {
    const {
      assessor,
      candidate,
      scores,
      finalScore
    } = evaluationData;

    const result = await query(
      `INSERT INTO evaluations (
        "assessorFullName", "assessorEmail", "assessorPhone", "assessorOrganisation", 
        "assessorState", "assessorVotingExperience", "assessorDesignation", "assessorOtherDesignation",
        "candidateName", "candidatePosition", "candidateParty", "candidateState",
        "capacityScore", "competenceScore", "characterScore", "finalScore"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        assessor.fullName,
        assessor.email,
        assessor.phone,
        assessor.organisation,
        assessor.state,
        assessor.votingExperience,
        assessor.designation,
        assessor.otherDesignation,
        candidate.candidateName,
        candidate.position,
        candidate.party,
        candidate.state,
        scores.capacity,
        scores.competence,
        scores.character,
        finalScore
      ]
    );

    return new Evaluation(result.rows[0]);
  }

  // Find evaluation by ID
  static async findById(id) {
    const result = await query('SELECT * FROM evaluations WHERE id = $1', [id]);

    if (result.rows.length === 0) return null;

    return this._formatEvaluation(result.rows[0]);
  }

  // Find all evaluations with pagination
  static async findAll(options = {}) {
    const {
      limit = 20,
      offset = 0,
      orderBy = 'createdAt',
      orderDirection = 'DESC'
    } = options;

    const result = await query(
      `SELECT * FROM evaluations 
       ORDER BY "${orderBy}" ${orderDirection}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows.map(row => this._formatEvaluation(row));
  }

  // Find evaluations by candidate
  static async findByCandidate(candidateName, candidatePosition, candidateState, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const result = await query(
      `SELECT * FROM evaluations 
       WHERE "candidateName" = $1 AND "candidatePosition" = $2 AND "candidateState" = $3
       ORDER BY "createdAt" DESC
       LIMIT $4 OFFSET $5`,
      [candidateName, candidatePosition, candidateState, limit, offset]
    );

    return result.rows.map(row => this._formatEvaluation(row));
  }

  // Find evaluations by assessor email
  static async findByAssessor(assessorEmail, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const result = await query(
      `SELECT * FROM evaluations 
       WHERE "assessorEmail" = $1
       ORDER BY "createdAt" DESC
       LIMIT $2 OFFSET $3`,
      [assessorEmail, limit, offset]
    );

    return result.rows.map(row => this._formatEvaluation(row));
  }

  // Get evaluation statistics for a candidate
  static async getCandidateStats(candidateName, candidatePosition, candidateState) {
    const result = await query(
      `SELECT 
        COUNT(*) as "totalEvaluations",
        AVG("finalScore") as "averageScore",
        AVG("capacityScore") as "averageCapacity",
        AVG("competenceScore") as "averageCompetence", 
        AVG("characterScore") as "averageCharacter",
        MIN("finalScore") as "minScore",
        MAX("finalScore") as "maxScore"
       FROM evaluations 
       WHERE "candidateName" = $1 AND "candidatePosition" = $2 AND "candidateState" = $3`,
      [candidateName, candidatePosition, candidateState]
    );

    const stats = result.rows[0];

    // Convert string values to numbers and round averages
    return {
      totalEvaluations: parseInt(stats.totalEvaluations),
      averageScore: stats.averageScore ? Math.round(parseFloat(stats.averageScore) * 100) / 100 : 0,
      averageCapacity: stats.averageCapacity ? Math.round(parseFloat(stats.averageCapacity) * 100) / 100 : 0,
      averageCompetence: stats.averageCompetence ? Math.round(parseFloat(stats.averageCompetence) * 100) / 100 : 0,
      averageCharacter: stats.averageCharacter ? Math.round(parseFloat(stats.averageCharacter) * 100) / 100 : 0,
      minScore: stats.minScore ? parseInt(stats.minScore) : 0,
      maxScore: stats.maxScore ? parseInt(stats.maxScore) : 0
    };
  }

  // Get evaluations by score range
  static async findByScoreRange(minScore, maxScore, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const result = await query(
      `SELECT * FROM evaluations 
       WHERE "finalScore" BETWEEN $1 AND $2
       ORDER BY "finalScore" DESC, "createdAt" DESC
       LIMIT $3 OFFSET $4`,
      [minScore, maxScore, limit, offset]
    );

    return result.rows.map(row => this._formatEvaluation(row));
  }

  // Get top-rated candidates
  static async getTopCandidates(state = null, position = null, options = {}) {
    const { limit = 10 } = options;

    let whereClause = '';
    let values = [];
    let paramCount = 1;

    if (state) {
      whereClause += `WHERE "candidateState" = $${paramCount}`;
      values.push(state);
      paramCount++;
    }

    if (position) {
      whereClause += whereClause ? ` AND "candidatePosition" = $${paramCount}` : `WHERE "candidatePosition" = $${paramCount}`;
      values.push(position);
      paramCount++;
    }

    const result = await query(
      `SELECT 
        "candidateName",
        "candidatePosition", 
        "candidateParty",
        "candidateState",
        COUNT(*) as "evaluationCount",
        AVG("finalScore") as "averageScore",
        AVG("capacityScore") as "averageCapacity",
        AVG("competenceScore") as "averageCompetence",
        AVG("characterScore") as "averageCharacter"
       FROM evaluations 
       ${whereClause}
       GROUP BY "candidateName", "candidatePosition", "candidateParty", "candidateState"
       ORDER BY "averageScore" DESC
       LIMIT $${paramCount}`,
      [...values, limit]
    );

    return result.rows.map(row => ({
      candidateName: row.candidateName,
      candidatePosition: row.candidatePosition,
      candidateParty: row.candidateParty,
      candidateState: row.candidateState,
      evaluationCount: parseInt(row.evaluationCount),
      averageScore: Math.round(parseFloat(row.averageScore) * 100) / 100,
      averageCapacity: Math.round(parseFloat(row.averageCapacity) * 100) / 100,
      averageCompetence: Math.round(parseFloat(row.averageCompetence) * 100) / 100,
      averageCharacter: Math.round(parseFloat(row.averageCharacter) * 100) / 100
    }));
  }

  // Search evaluations
  static async search(searchOptions = {}) {
    const {
      candidateName,
      candidatePosition,
      candidateState,
      assessorState,
      assessorDesignation,
      minScore,
      maxScore,
      limit = 20,
      offset = 0
    } = searchOptions;

    let whereClause = '';
    let values = [];
    let paramCount = 1;
    let conditions = [];

    if (candidateName) {
      conditions.push(`"candidateName" ILIKE $${paramCount}`);
      values.push(`%${candidateName}%`);
      paramCount++;
    }

    if (candidatePosition) {
      conditions.push(`"candidatePosition" = $${paramCount}`);
      values.push(candidatePosition);
      paramCount++;
    }

    if (candidateState) {
      conditions.push(`"candidateState" = $${paramCount}`);
      values.push(candidateState);
      paramCount++;
    }

    if (assessorState) {
      conditions.push(`"assessorState" = $${paramCount}`);
      values.push(assessorState);
      paramCount++;
    }

    if (assessorDesignation) {
      conditions.push(`"assessorDesignation" = $${paramCount}`);
      values.push(assessorDesignation);
      paramCount++;
    }

    if (minScore !== undefined) {
      conditions.push(`"finalScore" >= $${paramCount}`);
      values.push(minScore);
      paramCount++;
    }

    if (maxScore !== undefined) {
      conditions.push(`"finalScore" <= $${paramCount}`);
      values.push(maxScore);
      paramCount++;
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const result = await query(
      `SELECT * FROM evaluations 
       ${whereClause}
       ORDER BY "createdAt" DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return result.rows.map(row => this._formatEvaluation(row));
  }

  // Delete evaluation
  static async deleteById(id) {
    const result = await query(
      'DELETE FROM evaluations WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows.length > 0 ? this._formatEvaluation(result.rows[0]) : null;
  }

  // Get evaluation count
  static async getCount(filters = {}) {
    const { candidateState, candidatePosition, assessorState } = filters;

    let whereClause = '';
    let values = [];
    let paramCount = 1;
    let conditions = [];

    if (candidateState) {
      conditions.push(`"candidateState" = $${paramCount}`);
      values.push(candidateState);
      paramCount++;
    }

    if (candidatePosition) {
      conditions.push(`"candidatePosition" = $${paramCount}`);
      values.push(candidatePosition);
      paramCount++;
    }

    if (assessorState) {
      conditions.push(`"assessorState" = $${paramCount}`);
      values.push(assessorState);
      paramCount++;
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const result = await query(
      `SELECT COUNT(*) as count FROM evaluations ${whereClause}`,
      values
    );

    return parseInt(result.rows[0].count);
  }

  // Helper method to format evaluation data to match Mongoose structure
  static _formatEvaluation(row) {
    return new Evaluation({
      id: row.id,
      assessor: {
        fullName: row.assessorFullName,
        email: row.assessorEmail,
        phone: row.assessorPhone,
        organisation: row.assessorOrganisation,
        state: row.assessorState,
        votingExperience: row.assessorVotingExperience,
        designation: row.assessorDesignation,
        otherDesignation: row.assessorOtherDesignation
      },
      candidate: {
        candidateName: row.candidateName,
        position: row.candidatePosition,
        party: row.candidateParty,
        state: row.candidateState
      },
      scores: {
        capacity: row.capacityScore,
        competence: row.competenceScore,
        character: row.characterScore
      },
      finalScore: row.finalScore,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }

  // Instance method to save changes
  async save() {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    // Extract fields from nested objects for updates
    if (this.assessor) {
      const assessorFields = ['fullName', 'email', 'phone', 'organisation', 'state', 'votingExperience', 'designation', 'otherDesignation'];
      assessorFields.forEach(field => {
        if (this.assessor[field] !== undefined) {
          updateFields.push(`"assessor${field.charAt(0).toUpperCase() + field.slice(1)}" = $${paramCount}`);
          values.push(this.assessor[field]);
          paramCount++;
        }
      });
    }

    if (this.candidate) {
      const candidateFields = ['candidateName', 'position', 'party', 'state'];
      candidateFields.forEach(field => {
        if (this.candidate[field] !== undefined) {
          const dbField = field === 'position' ? 'candidatePosition' :
            field === 'state' ? 'candidateState' :
              field === 'candidateName' ? 'candidateName' : `candidate${field.charAt(0).toUpperCase() + field.slice(1)}`;
          updateFields.push(`"${dbField}" = $${paramCount}`);
          values.push(this.candidate[field]);
          paramCount++;
        }
      });
    }

    if (this.scores) {
      ['capacity', 'competence', 'character'].forEach(field => {
        if (this.scores[field] !== undefined) {
          updateFields.push(`"${field}Score" = $${paramCount}`);
          values.push(this.scores[field]);
          paramCount++;
        }
      });
    }

    if (this.finalScore !== undefined) {
      updateFields.push(`"finalScore" = $${paramCount}`);
      values.push(this.finalScore);
      paramCount++;
    }

    if (updateFields.length === 0) return this;

    updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    values.push(this.id);

    const updateQuery = `
      UPDATE evaluations 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    Object.assign(this, Evaluation._formatEvaluation(result.rows[0]));
    return this;
  }

  // Convert to plain object (like Mongoose toObject)
  toObject() {
    return { ...this };
  }
}

export default Evaluation;

