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
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { getAllPosts, deletePost, publishPost, unpublishPost, type BlogPost } from '../../../services/blogService';

type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

export default function BlogListPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const result = await getAllPosts(page, 20, status);
      setPosts(result.posts || []);
      setTotalPages(result.pages || 1);
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handlePublishToggle = async (post: BlogPost) => {
    try {
      if (post.status === 'published') {
        await unpublishPost(post.id);
      } else {
        await publishPost(post.id);
      }
      loadPosts();
    } catch (err) {
      console.error('Error toggling publish:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePost(deleteTarget.id);
      setDeleteTarget(null);
      loadPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>Blog Management</Typography>
          <Typography variant="body2">Create, edit, and manage blog posts.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => navigate('/pbx/blog/new')}
        >
          New Post
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
          <Tab label="Archived" value="archived" />
        </Tabs>

        <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">No posts found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{post.title}</Typography>
                      {post.author_name && (
                        <Typography variant="caption" color="text.secondary">by {post.author_name}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Chip label={post.category || 'Uncategorized'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <StatusChip status={post.status} />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="caption">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : new Date(post.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <IconButton size="small" onClick={() => navigate(`/pbx/blog/edit/${post.id}`)}>
                          <Edit2 size={16} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handlePublishToggle(post)}>
                          {post.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(post)}>
                          <Trash2 size={16} />
                        </IconButton>
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
        <DialogTitle>Delete Post</DialogTitle>
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
  const colorMap: Record<string, 'success' | 'warning' | 'default'> = {
    published: 'success',
    draft: 'warning',
    archived: 'default',
  };
  return <Chip label={status} size="small" color={colorMap[status] || 'default'} variant="outlined" />;
}
