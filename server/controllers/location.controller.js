import { pool } from '../config/db.js';

/**
 * Get all distinct states from inec_voters table
 * Optimized for large datasets using DISTINCT with index
 */
export const getAvailableStates = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT state 
      FROM inec_voters 
      WHERE state IS NOT NULL 
      ORDER BY state ASC
    `);

    const states = result.rows.map(row => row.state);

    res.json({
      success: true,
      states,
      count: states.length
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available states'
    });
  }
};

/**
 * Get all distinct LGAs for a specific state
 * Optimized for large datasets with WHERE clause and index
 */
export const getLgasForState = async (req, res) => {
  try {
    const { state } = req.params;

    if (!state) {
      return res.status(400).json({
        success: false,
        error: 'State parameter is required'
      });
    }

    const result = await pool.query(`
      SELECT DISTINCT lga 
      FROM inec_voters 
      WHERE state = $1 AND lga IS NOT NULL 
      ORDER BY lga ASC
    `, [state]);

    const lgas = result.rows.map(row => row.lga);

    res.json({
      success: true,
      state,
      lgas,
      count: lgas.length
    });
  } catch (error) {
    console.error('Error fetching LGAs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch LGAs for the specified state'
    });
  }
};

/**
 * Get voter count for a specific state and LGAs
 * Helps admins see how many people will receive the campaign
 */
export const getVoterCount = async (req, res) => {
  try {
    const { state, lgas } = req.body;

    if (!state || !Array.isArray(lgas) || lgas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'State and LGAs array are required'
      });
    }

    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM inec_voters
      WHERE state = $1 
        AND lga = ANY($2)
        AND phone_number IS NOT NULL
        AND phone_number != ''
    `, [state, lgas]);

    res.json({
      success: true,
      state,
      lgas,
      voterCount: parseInt(result.rows[0].count)
    });
  } catch (error) {
    console.error('Error counting voters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to count voters'
    });
  }
};
