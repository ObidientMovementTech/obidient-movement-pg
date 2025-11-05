import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// All routes require admin authentication
router.use(protect, isAdmin);

/**
 * GET /api/parties
 * Get all political parties (global parties only)
 */
router.get('/', async (req, res) => {
  try {
    const partiesQuery = `
      SELECT * FROM election_parties
      WHERE election_id IS NULL
      ORDER BY display_order ASC, party_name ASC
    `;

    const result = await query(partiesQuery);

    res.json({
      success: true,
      data: {
        parties: result.rows
      }
    });
  } catch (error) {
    console.error('Error fetching parties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parties',
      error: error.message
    });
  }
});

/**
 * POST /api/parties
 * Create a new political party (global - not tied to specific election)
 */
router.post('/', async (req, res) => {
  try {
    const { party_code, party_name, display_name, display_order, color } = req.body;

    // Validation
    if (!party_code || !party_name || !display_name) {
      return res.status(400).json({
        success: false,
        message: 'Party code, name, and display name are required'
      });
    }

    // Check if party code already exists (for global parties where election_id is null)
    const existingParty = await query(
      'SELECT id FROM election_parties WHERE party_code = $1 AND election_id IS NULL',
      [party_code.toUpperCase()]
    );

    if (existingParty.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A party with this code already exists'
      });
    }

    const partyId = uuidv4();

    const insertQuery = `
      INSERT INTO election_parties (
        id, election_id, party_code, party_name, display_name, display_order, color
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      partyId,
      null, // election_id is null for global parties
      party_code.toUpperCase(),
      party_name,
      display_name,
      display_order || 0,
      color || '#10B981'
    ]);

    res.status(201).json({
      success: true,
      message: 'Party created successfully',
      data: {
        party: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Error creating party:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create party',
      error: error.message
    });
  }
});

/**
 * PUT /api/parties/:partyId
 * Update a political party
 */
router.put('/:partyId', async (req, res) => {
  try {
    const { partyId } = req.params;
    const { party_code, party_name, display_name, display_order, color } = req.body;

    // Check if party exists
    const existingParty = await query(
      'SELECT id FROM election_parties WHERE id = $1',
      [partyId]
    );

    if (existingParty.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Party not found'
      });
    }

    // If party_code is being updated, check for duplicates
    if (party_code) {
      const duplicateCheck = await query(
        'SELECT id FROM election_parties WHERE party_code = $1 AND id != $2',
        [party_code.toUpperCase(), partyId]
      );

      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'A party with this code already exists'
        });
      }
    }

    const updateQuery = `
      UPDATE election_parties
      SET 
        party_code = COALESCE($1, party_code),
        party_name = COALESCE($2, party_name),
        display_name = COALESCE($3, display_name),
        display_order = COALESCE($4, display_order),
        color = COALESCE($5, color),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;

    const result = await query(updateQuery, [
      party_code ? party_code.toUpperCase() : null,
      party_name,
      display_name,
      display_order !== undefined ? display_order : null,
      color,
      partyId
    ]);

    res.json({
      success: true,
      message: 'Party updated successfully',
      data: {
        party: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Error updating party:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update party',
      error: error.message
    });
  }
});

/**
 * DELETE /api/parties/:partyId
 * Delete a political party
 */
router.delete('/:partyId', async (req, res) => {
  try {
    const { partyId } = req.params;

    // Check if party exists
    const existingParty = await query(
      'SELECT id FROM election_parties WHERE id = $1',
      [partyId]
    );

    if (existingParty.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Party not found'
      });
    }

    // Delete party (cascading will handle election_party_aliases)
    await query('DELETE FROM election_parties WHERE id = $1', [partyId]);

    res.json({
      success: true,
      message: 'Party deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting party:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete party',
      error: error.message
    });
  }
});

/**
 * GET /api/parties/:partyId/aliases
 * Get aliases for a party
 */
router.get('/:partyId/aliases', async (req, res) => {
  try {
    const { partyId } = req.params;

    const aliasesQuery = `
      SELECT * FROM election_party_aliases
      WHERE party_id = $1
      ORDER BY created_at DESC
    `;

    const result = await query(aliasesQuery, [partyId]);

    res.json({
      success: true,
      data: {
        aliases: result.rows
      }
    });
  } catch (error) {
    console.error('Error fetching party aliases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch party aliases',
      error: error.message
    });
  }
});

/**
 * POST /api/parties/:partyId/aliases
 * Add an alias to a party
 */
router.post('/:partyId/aliases', async (req, res) => {
  try {
    const { partyId } = req.params;
    const { alias } = req.body;

    if (!alias) {
      return res.status(400).json({
        success: false,
        message: 'Alias is required'
      });
    }

    // Check if party exists
    const existingParty = await query(
      'SELECT id FROM election_parties WHERE id = $1',
      [partyId]
    );

    if (existingParty.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Party not found'
      });
    }

    const aliasId = uuidv4();

    const insertQuery = `
      INSERT INTO election_party_aliases (id, party_id, alias)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await query(insertQuery, [aliasId, partyId, alias]);

    res.status(201).json({
      success: true,
      message: 'Alias added successfully',
      data: {
        alias: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Error adding party alias:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add party alias',
      error: error.message
    });
  }
});

export default router;
