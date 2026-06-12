import BankAccount from '../models/bankAccount.model.js';

// ──── Public: Get accounts visible on landing page ────
export const getPublicBankAccounts = async (_req, res) => {
  try {
    const accounts = await BankAccount.getPublic();
    res.json({ success: true, accounts });
  } catch (error) {
    console.error('getPublicBankAccounts error:', error);
    res.status(500).json({ message: 'Failed to fetch bank accounts' });
  }
};

// ──── Admin: Get all active accounts ────
export const getAllBankAccounts = async (_req, res) => {
  try {
    const accounts = await BankAccount.getAll();
    res.json({ success: true, accounts });
  } catch (error) {
    console.error('getAllBankAccounts error:', error);
    res.status(500).json({ message: 'Failed to fetch bank accounts' });
  }
};

// ──── Admin: Get single account ────
export const getBankAccountById = async (req, res) => {
  try {
    const account = await BankAccount.getById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    res.json({ success: true, account });
  } catch (error) {
    console.error('getBankAccountById error:', error);
    res.status(500).json({ message: 'Failed to fetch bank account' });
  }
};

// ──── Admin: Create account ────
export const createBankAccount = async (req, res) => {
  try {
    const { account_name, account_number, bank_name, currency, account_type } = req.body;

    if (!account_name?.trim() || !account_number?.trim() || !bank_name?.trim()) {
      return res.status(400).json({ message: 'Account name, number, and bank name are required' });
    }

    if (account_type && !['local', 'international'].includes(account_type)) {
      return res.status(400).json({ message: 'Account type must be "local" or "international"' });
    }

    if (currency && !/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({ message: 'Currency must be a valid 3-letter code (e.g. NGN, USD)' });
    }

    const account = await BankAccount.create({
      account_name: account_name.trim(),
      account_number: account_number.trim(),
      bank_name: bank_name.trim(),
      bank_code: req.body.bank_code?.trim() || null,
      currency: currency || 'NGN',
      account_type: account_type || 'local',
      swift_code: req.body.swift_code?.trim() || null,
      routing_number: req.body.routing_number?.trim() || null,
      country: req.body.country?.trim() || 'Nigeria',
      description: req.body.description?.trim() || null,
      show_on_landing: req.body.show_on_landing || false,
      display_order: req.body.display_order || 0,
    });

    res.status(201).json({ success: true, account });
  } catch (error) {
    console.error('createBankAccount error:', error);
    res.status(500).json({ message: 'Failed to create bank account' });
  }
};

// ──── Admin: Update account ────
export const updateBankAccount = async (req, res) => {
  try {
    const { account_name, account_number, bank_name, currency, account_type } = req.body;

    if (!account_name?.trim() || !account_number?.trim() || !bank_name?.trim()) {
      return res.status(400).json({ message: 'Account name, number, and bank name are required' });
    }

    if (account_type && !['local', 'international'].includes(account_type)) {
      return res.status(400).json({ message: 'Account type must be "local" or "international"' });
    }

    if (currency && !/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({ message: 'Currency must be a valid 3-letter code (e.g. NGN, USD)' });
    }

    const account = await BankAccount.update(req.params.id, {
      account_name: account_name.trim(),
      account_number: account_number.trim(),
      bank_name: bank_name.trim(),
      bank_code: req.body.bank_code?.trim() || null,
      currency: currency || 'NGN',
      account_type: account_type || 'local',
      swift_code: req.body.swift_code?.trim() || null,
      routing_number: req.body.routing_number?.trim() || null,
      country: req.body.country?.trim() || 'Nigeria',
      description: req.body.description?.trim() || null,
      show_on_landing: req.body.show_on_landing ?? false,
      display_order: req.body.display_order ?? 0,
    });

    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json({ success: true, account });
  } catch (error) {
    console.error('updateBankAccount error:', error);
    res.status(500).json({ message: 'Failed to update bank account' });
  }
};

// ──── Admin: Toggle visibility ────
export const toggleBankAccountVisibility = async (req, res) => {
  try {
    const { show_on_landing } = req.body;

    if (typeof show_on_landing !== 'boolean') {
      return res.status(400).json({ message: 'show_on_landing must be a boolean' });
    }

    const account = await BankAccount.toggleVisibility(req.params.id, show_on_landing);
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json({ success: true, account });
  } catch (error) {
    console.error('toggleBankAccountVisibility error:', error);
    res.status(500).json({ message: 'Failed to update visibility' });
  }
};

// ──── Admin: Update display order ────
export const updateBankAccountOrder = async (req, res) => {
  try {
    const { display_order } = req.body;

    if (typeof display_order !== 'number' || display_order < 0) {
      return res.status(400).json({ message: 'display_order must be a non-negative number' });
    }

    const account = await BankAccount.updateOrder(req.params.id, display_order);
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json({ success: true, account });
  } catch (error) {
    console.error('updateBankAccountOrder error:', error);
    res.status(500).json({ message: 'Failed to update display order' });
  }
};

// ──── Admin: Delete (soft) ────
export const deleteBankAccount = async (req, res) => {
  try {
    const deleted = await BankAccount.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    res.json({ success: true, message: 'Bank account deleted' });
  } catch (error) {
    console.error('deleteBankAccount error:', error);
    res.status(500).json({ message: 'Failed to delete bank account' });
  }
};
