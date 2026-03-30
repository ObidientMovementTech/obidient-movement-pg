import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowLeft, Save, Upload, Send } from 'lucide-react';
import RichTextEditor from '../../../components/inputs/RichTextEditor';
import { BLOG_CATEGORIES } from '../../../constants/blogCategories';
import {
  createPost,
  updatePost,
  publishPost,
  uploadBlogImage,
  type BlogPost,
} from '../../../services/blogService';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function BlogEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [postStatus, setPostStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingPost, setLoadingPost] = useState(false);

  useEffect(() => {
    if (id) {
      loadExistingPost(id);
    }
  }, [id]);

  async function loadExistingPost(postId: string) {
    setLoadingPost(true);
    try {
      // Fetch post by ID via admin endpoint
      const res = await axios.get(`${API_BASE}/api/blog/admin/posts`, {
        params: { page: 1, limit: 100 },
        withCredentials: true,
      });
      const post = (res.data.posts || []).find((p: BlogPost) => p.id === postId);
      if (post) {
        setTitle(post.title);
        setContent(post.content || '');
        setExcerpt(post.excerpt || '');
        setCategory(post.category || '');
        setTags(post.tags || []);
        setFeaturedImageUrl(post.featured_image_url || '');
        setPostStatus(post.status || 'draft');
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Failed to load post.');
    } finally {
      setLoadingPost(false);
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
        featuredImageUrl: featuredImageUrl || undefined,
      };

      if (isEditing && id) {
        await updatePost(id, data);
        setSuccess('Post updated successfully.');
      } else {
        const result = await createPost(data);
        setSuccess('Post created successfully.');
        // Navigate to edit mode so further saves act as updates
        navigate(`/pbx/blog/edit/${result.post.id}`, { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save post.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setPublishing(true);
    setError('');
    setSuccess('');
    try {
      const data = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
        featuredImageUrl: featuredImageUrl || undefined,
      };

      let postId = id;
      if (isEditing && id) {
        await updatePost(id, data);
      } else {
        const result = await createPost(data);
        postId = result.post.id;
        navigate(`/pbx/blog/edit/${postId}`, { replace: true });
      }

      await publishPost(postId!);
      setPostStatus('published');
      setSuccess('Post published successfully!');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to publish post.');
    } finally {
      setPublishing(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadBlogImage(file);
    return result.url;
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadBlogImage(file);
      setFeaturedImageUrl(result.url);
    } catch (err) {
      setError('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  if (loadingPost) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/pbx/blog')}
          color="inherit"
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flex: 1 }}>
          {isEditing ? 'Edit Post' : 'New Post'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Save size={18} />}
          onClick={handleSave}
          disabled={saving || publishing}
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<Send size={18} />}
          onClick={handlePublish}
          disabled={saving || publishing}
        >
          {publishing ? 'Publishing...' : postStatus === 'published' ? 'Update & Publish' : 'Publish'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Main content area */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Post Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                placeholder="Enter a compelling title..."
              />
              <TextField
                label="Excerpt (optional)"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Short summary shown in post listings..."
                slotProps={{ htmlInput: { maxLength: 300 } }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Content</Typography>
              <RichTextEditor
                content={content}
                onChange={setContent}
                onImageUpload={handleImageUpload}
                placeholder="Write your blog post content here..."
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Category */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                  {BLOG_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Tags</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  fullWidth
                />
                <Button variant="outlined" size="small" onClick={addTag} sx={{ minWidth: 'auto' }}>+</Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" onDelete={() => removeTag(tag)} />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Featured Image</Typography>
              {featuredImageUrl && (
                <Box
                  component="img"
                  src={featuredImageUrl}
                  alt="Featured"
                  sx={{ width: '100%', borderRadius: 2, mb: 1.5, maxHeight: 200, objectFit: 'cover' }}
                />
              )}
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={uploading ? <CircularProgress size={16} /> : <Upload size={16} />}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : featuredImageUrl ? 'Change Image' : 'Upload Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                />
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
