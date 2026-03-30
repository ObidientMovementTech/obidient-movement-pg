import { query } from '../config/db.js';

// ──── Get a public setting by key (no auth required) ────
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const result = await query('SELECT value FROM app_settings WHERE key = $1', [key]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    res.json({ success: true, key, value: result.rows[0].value });
  } catch (error) {
    console.error('getSetting error:', error);
    res.status(500).json({ message: 'Failed to fetch setting' });
  }
};

// ──── Update a setting (admin only) ────
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (typeof value !== 'string') {
      return res.status(400).json({ message: 'Value must be a string' });
    }

    const result = await query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
       RETURNING *`,
      [key, value]
    );

    res.json({ success: true, setting: result.rows[0] });
  } catch (error) {
    console.error('updateSetting error:', error);
    res.status(500).json({ message: 'Failed to update setting' });
  }
};

// ──── Get all settings (admin only) ────
export const getAllSettings = async (_req, res) => {
  try {
    const result = await query('SELECT * FROM app_settings ORDER BY key');
    res.json({ success: true, settings: result.rows });
  } catch (error) {
    console.error('getAllSettings error:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
};
