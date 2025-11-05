import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * GET /api/elections/:electionId/parties
 * Get all parties linked to an election
 * Accessible by any authenticated user (for result submission)
 */
router.get('/:electionId/parties', protect, async (req, res) => {
  try {
    const { electionId } = req.params;

    console.log('🔍 GET /:electionId/parties called');
    console.log('🔍 electionId param:', electionId);
    console.log('🔍 electionId type:', typeof electionId);

    const partiesQuery = `
      SELECT * 
      FROM election_parties
      WHERE election_id = $1
      ORDER BY display_order ASC, party_name ASC
    `;

    console.log('🔍 Executing query:', partiesQuery);
    console.log('🔍 Query params:', [electionId]);

    const result = await query(partiesQuery, [electionId]);

    console.log('✅ Query result rows:', result.rows.length);
    console.log('✅ Query result:', result.rows);

    // Transform snake_case to camelCase for frontend
    const transformedParties = result.rows.map(party => ({
      id: party.id,
      partyCode: party.party_code,
      partyName: party.party_name,
      displayName: party.display_name,
      color: party.color,
      displayOrder: party.display_order,
      metadata: party.metadata || {},
      electionId: party.election_id
    }));

    res.json({
      success: true,
      data: {
        parties: transformedParties
      }
    });
  } catch (error) {
    console.error('❌ Error fetching election parties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch election parties',
      error: error.message
    });
  }
});

/**
 * POST /api/elections/:electionId/parties
 * Link parties to an election by creating election-specific party records
 * Body: { party_ids: [...] }
 * Admin only
 */
router.post('/:electionId/parties', protect, isAdmin, async (req, res) => {
  try {
    const { electionId } = req.params;
    const { party_ids } = req.body;

    if (!party_ids || !Array.isArray(party_ids) || party_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Party IDs array is required'
      });
    }

    // Check if election exists
    const electionCheck = await query(
      'SELECT election_id FROM elections WHERE election_id = $1',
      [electionId]
    );

    if (electionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // First, remove existing party links for this election
    await query(
      'DELETE FROM election_parties WHERE election_id = $1',
      [electionId]
    );

    // For each party ID (which are global parties with election_id = NULL),
    // create a new election-specific party record
    const insertPromises = party_ids.map(async (globalPartyId) => {
      // Get the global party details
      const globalParty = await query(
        'SELECT * FROM election_parties WHERE id = $1 AND election_id IS NULL',
        [globalPartyId]
      );

      if (globalParty.rows.length === 0) {
        console.warn(`Global party ${globalPartyId} not found`);
        return null;
      }

      const party = globalParty.rows[0];
      const newPartyId = uuidv4();

      // Create an election-specific copy of this party
      return query(
        `INSERT INTO election_parties (
          id, election_id, party_code, party_name, display_name, display_order, color, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING`,
        [
          newPartyId,
          electionId,
          party.party_code,
          party.party_name,
          party.display_name,
          party.display_order,
          party.color,
          JSON.stringify({ global_party_id: globalPartyId })
        ]
      );
    });

    await Promise.all(insertPromises.filter(p => p !== null));

    res.json({
      success: true,
      message: 'Parties linked to election successfully'
    });
  } catch (error) {
    console.error('Error linking parties to election:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link parties to election',
      error: error.message
    });
  }
});

/**
 * DELETE /api/elections/:electionId/parties/:partyId
 * Remove a party from an election
 * Admin only
 */
router.delete('/:electionId/parties/:partyId', protect, isAdmin, async (req, res) => {
  try {
    const { electionId, partyId } = req.params;

    await query(
      'DELETE FROM election_parties WHERE election_id = $1 AND id = $2',
      [electionId, partyId]
    );

    res.json({
      success: true,
      message: 'Party removed from election successfully'
    });
  } catch (error) {
    console.error('Error removing party from election:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove party from election',
      error: error.message
    });
  }
});

export default router;
