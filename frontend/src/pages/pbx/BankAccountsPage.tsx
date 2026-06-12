import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';
import { Plus, Pencil, Trash2, Eye, EyeOff, Landmark } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface BankAccount {
  id: number;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_code: string | null;
  currency: string;
  account_type: 'local' | 'international';
  swift_code: string | null;
  routing_number: string | null;
  country: string;
  description: string | null;
  show_on_landing: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EMPTY_FORM: Omit<BankAccount, 'id' | 'is_active' | 'created_at' | 'updated_at'> = {
  account_name: '',
  account_number: '',
  bank_name: '',
  bank_code: '',
  currency: 'NGN',
  account_type: 'local',
  swift_code: '',
  routing_number: '',
  country: 'Nigeria',
  description: '',
  show_on_landing: false,
  display_order: 0,
};

const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'GHS', 'KES', 'ZAR'];

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/bank-accounts`, { withCredentials: true });
      setAccounts(res.data.accounts);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleOpenCreate = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setDialogMode('create');
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (account: BankAccount) => {
    setFormData({
      account_name: account.account_name,
      account_number: account.account_number,
      bank_name: account.bank_name,
      bank_code: account.bank_code || '',
      currency: account.currency,
      account_type: account.account_type,
      swift_code: account.swift_code || '',
      routing_number: account.routing_number || '',
      country: account.country,
      description: account.description || '',
      show_on_landing: account.show_on_landing,
      display_order: account.display_order,
    });
    setEditingId(account.id);
    setDialogMode('edit');
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.account_name.trim() || !formData.account_number.trim() || !formData.bank_name.trim()) {
      setFormError('Account name, number, and bank name are required.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (dialogMode === 'create') {
        await axios.post(`${API}/api/bank-accounts`, formData, { withCredentials: true });
        setSuccessMsg('Bank account created successfully');
      } else {
        await axios.put(`${API}/api/bank-accounts/${editingId}`, formData, { withCredentials: true });
        setSuccessMsg('Bank account updated successfully');
      }
      setDialogOpen(false);
      fetchAccounts();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save bank account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisibility = async (account: BankAccount) => {
    try {
      await axios.patch(
        `${API}/api/bank-accounts/${account.id}/visibility`,
        { show_on_landing: !account.show_on_landing },
        { withCredentials: true }
      );
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, show_on_landing: !a.show_on_landing } : a))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle visibility');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/bank-accounts/${deletingId}`, { withCredentials: true });
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setSuccessMsg('Bank account deleted');
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete bank account');
    } finally {
      setDeleting(false);
    }
  };

  // Clear success message after 3s
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Bank Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage donation bank accounts displayed on the Get Involved page.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={handleOpenCreate}
          sx={{ textTransform: 'none' }}
        >
          Add Account
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : accounts.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Landmark size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <Typography variant="h6" color="text.secondary">
            No bank accounts added yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add bank accounts to display on the Get Involved page for donations.
          </Typography>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={handleOpenCreate} sx={{ textTransform: 'none' }}>
            Add First Account
          </Button>
        </Card>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Bank</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Account</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Currency</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Visible</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Order</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {account.bank_name}
                    </Typography>
                    {account.country !== 'Nigeria' && (
                      <Typography variant="caption" color="text.secondary">
                        {account.country}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{account.account_name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {account.account_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.account_type}
                      size="small"
                      color={account.account_type === 'local' ? 'success' : 'info'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={account.currency} size="small" variant="filled" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={account.show_on_landing ? 'Visible on landing page' : 'Hidden from landing page'}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleVisibility(account)}
                        color={account.show_on_landing ? 'success' : 'default'}
                      >
                        {account.show_on_landing ? <Eye size={18} /> : <EyeOff size={18} />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{account.display_order}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenEdit(account)}>
                        <Pencil size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setDeletingId(account.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? 'Add Bank Account' : 'Edit Bank Account'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Account Name *"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              fullWidth
              size="small"
              placeholder="e.g. Obidient Movement Nigeria"
            />
            <TextField
              label="Account Number *"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              fullWidth
              size="small"
              placeholder="e.g. 0123456789 or IBAN"
            />
            <TextField
              label="Bank Name *"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              fullWidth
              size="small"
              placeholder="e.g. Zenith Bank"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Account Type"
                value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value as 'local' | 'international' })}
                size="small"
                sx={{ flex: 1 }}
              >
                <MenuItem value="local">Local</MenuItem>
                <MenuItem value="international">International</MenuItem>
              </TextField>
              <TextField
                select
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                size="small"
                sx={{ flex: 1 }}
              >
                {CURRENCIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              label="Bank Code / Sort Code"
              value={formData.bank_code}
              onChange={(e) => setFormData({ ...formData, bank_code: e.target.value })}
              fullWidth
              size="small"
              placeholder="Optional"
            />

            {formData.account_type === 'international' && (
              <>
                <TextField
                  label="SWIFT / BIC Code"
                  value={formData.swift_code}
                  onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
                  fullWidth
                  size="small"
                  placeholder="e.g.ABORNGLA"
                />
                <TextField
                  label="Routing Number"
                  value={formData.routing_number}
                  onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                  fullWidth
                  size="small"
                  placeholder="For US transfers"
                />
              </>
            )}

            <TextField
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              fullWidth
              size="small"
            />

            <TextField
              label="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="e.g. For diaspora USD donations"
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Display Order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                size="small"
                sx={{ width: 120 }}
                inputProps={{ min: 0 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.show_on_landing}
                    onChange={(e) => setFormData({ ...formData, show_on_landing: e.target.checked })}
                    color="success"
                  />
                }
                label="Show on Get Involved page"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : dialogMode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs">
        <DialogTitle>Delete Bank Account?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will remove the bank account from the list. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
