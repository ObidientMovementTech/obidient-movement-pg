import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import {
  getPublicBankAccounts,
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  toggleBankAccountVisibility,
  updateBankAccountOrder,
  deleteBankAccount,
} from '../controllers/bankAccount.controller.js';

const router = express.Router();

// Public: Get bank accounts shown on landing page
router.get('/public', getPublicBankAccounts);

// Admin routes (all require auth + admin)
router.get('/', protect, isAdmin, getAllBankAccounts);
router.get('/:id', protect, isAdmin, getBankAccountById);
router.post('/', protect, isAdmin, createBankAccount);
router.put('/:id', protect, isAdmin, updateBankAccount);
router.patch('/:id/visibility', protect, isAdmin, toggleBankAccountVisibility);
router.patch('/:id/order', protect, isAdmin, updateBankAccountOrder);
router.delete('/:id', protect, isAdmin, deleteBankAccount);

export default router;
