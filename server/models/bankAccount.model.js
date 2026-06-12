import { query } from '../config/db.js';

class BankAccount {
  constructor(data) {
    Object.assign(this, data);
  }

  // Get all accounts (admin)
  static async getAll() {
    const result = await query(
      `SELECT * FROM bank_accounts WHERE is_active = true ORDER BY display_order ASC, created_at DESC`
    );
    return result.rows;
  }

  // Get public accounts (show_on_landing = true)
  static async getPublic() {
    const result = await query(
      `SELECT id, account_name, account_number, bank_name, bank_code, currency, account_type,
              swift_code, routing_number, country, description, display_order
       FROM bank_accounts
       WHERE show_on_landing = true AND is_active = true
       ORDER BY display_order ASC, created_at DESC`
    );
    return result.rows;
  }

  // Get by ID
  static async getById(id) {
    const result = await query('SELECT * FROM bank_accounts WHERE id = $1 AND is_active = true', [id]);
    return result.rows[0] || null;
  }

  // Create
  static async create(data) {
    const {
      account_name, account_number, bank_name, bank_code, currency,
      account_type, swift_code, routing_number, country, description,
      show_on_landing, display_order
    } = data;

    const result = await query(
      `INSERT INTO bank_accounts (
        account_name, account_number, bank_name, bank_code, currency,
        account_type, swift_code, routing_number, country, description,
        show_on_landing, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        account_name, account_number, bank_name, bank_code || null,
        currency || 'NGN', account_type || 'local', swift_code || null,
        routing_number || null, country || 'Nigeria', description || null,
        show_on_landing || false, display_order || 0
      ]
    );
    return result.rows[0];
  }

  // Update
  static async update(id, data) {
    const {
      account_name, account_number, bank_name, bank_code, currency,
      account_type, swift_code, routing_number, country, description,
      show_on_landing, display_order
    } = data;

    const result = await query(
      `UPDATE bank_accounts SET
        account_name = $1, account_number = $2, bank_name = $3,
        bank_code = $4, currency = $5, account_type = $6,
        swift_code = $7, routing_number = $8, country = $9,
        description = $10, show_on_landing = $11, display_order = $12,
        updated_at = NOW()
      WHERE id = $13 AND is_active = true
      RETURNING *`,
      [
        account_name, account_number, bank_name, bank_code || null,
        currency || 'NGN', account_type || 'local', swift_code || null,
        routing_number || null, country || 'Nigeria', description || null,
        show_on_landing ?? false, display_order ?? 0, id
      ]
    );
    return result.rows[0] || null;
  }

  // Toggle visibility
  static async toggleVisibility(id, show_on_landing) {
    const result = await query(
      `UPDATE bank_accounts SET show_on_landing = $1, updated_at = NOW()
       WHERE id = $2 AND is_active = true RETURNING *`,
      [show_on_landing, id]
    );
    return result.rows[0] || null;
  }

  // Update display order
  static async updateOrder(id, display_order) {
    const result = await query(
      `UPDATE bank_accounts SET display_order = $1, updated_at = NOW()
       WHERE id = $2 AND is_active = true RETURNING *`,
      [display_order, id]
    );
    return result.rows[0] || null;
  }

  // Soft delete
  static async delete(id) {
    const result = await query(
      `UPDATE bank_accounts SET is_active = false, updated_at = NOW()
       WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rowCount > 0;
  }
}

export default BankAccount;
