import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Skeleton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Plus, Edit2, Trash2, Mail } from 'lucide-react';
import { getAllNewsletters, deleteNewsletter, type Newsletter } from '../../../services/newsletterService';

type StatusFilter = 'all' | 'draft' | 'published' | 'sent' | 'sending' | 'archived';

export default function NewsletterListPage() {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<Newsletter | null>(null);

  const loadNewsletters = useCallback(async () => {
    setLoading(true);
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const result = await getAllNewsletters(page, 20, status);
      setNewsletters(result.newsletters || []);
      setTotalPages(result.pages || 1);
    } catch (err) {
      console.error('Error loading newsletters:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadNewsletters();
  }, [loadNewsletters]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNewsletter(deleteTarget.id);
      setDeleteTarget(null);
      loadNewsletters();
    } catch (err) {
      console.error('Error deleting newsletter:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>Newsletter Management</Typography>
          <Typography variant="body2" color="text.secondary">Create, edit, and send newsletters to members.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => navigate('/pbx/newsletter/new')}
        >
          New Newsletter
        </Button>
      </Box>

      <Card>
        <Tabs
          value={statusFilter}
          onChange={(_, v) => { setStatusFilter(v); setPage(1); }}
          sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab label="All" value="all" />
          <Tab label="Draft" value="draft" />
          <Tab label="Published" value="published" />
          <Tab label="Sent" value="sent" />
          <Tab label="Sending" value="sending" />
          <Tab label="Archived" value="archived" />
        </Tabs>

        <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Stats</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : newsletters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">No newsletters found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                newsletters.map((nl) => (
                  <TableRow key={nl.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{nl.title}</Typography>
                      {nl.author_name && (
                        <Typography variant="caption" color="text.secondary">by {nl.author_name}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {nl.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={nl.status} />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {nl.status === 'sent' || nl.status === 'sending' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Mail size={14} />
                          <Typography variant="caption">
                            {nl.emails_sent}/{nl.total_recipients}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="caption">
                        {nl.sent_at
                          ? new Date(nl.sent_at).toLocaleDateString()
                          : new Date(nl.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        {(nl.status === 'draft' || nl.status === 'published') && (
                          <>
                            <IconButton size="small" onClick={() => navigate(`/pbx/newsletter/edit/${nl.id}`)}>
                              <Edit2 size={16} />
                            </IconButton>
                            {nl.status === 'draft' && (
                              <IconButton size="small" color="error" onClick={() => setDeleteTarget(nl)}>
                                <Trash2 size={16} />
                              </IconButton>
                            )}
                          </>
                        )}
                        {nl.status === 'sent' && (
                          <IconButton size="small" onClick={() => navigate(`/pbx/newsletter/edit/${nl.id}`)}>
                            <Edit2 size={16} />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        )}
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Newsletter</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function StatusChip({ status }: { status: string }) {
  const colorMap: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
    sent: 'success',
    published: 'info',
    draft: 'warning',
    sending: 'info',
    scheduled: 'info',
    archived: 'default',
  };
  return <Chip label={status} size="small" color={colorMap[status] || 'default'} variant="outlined" />;
}
