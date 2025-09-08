import { useState, useEffect, useRef } from "react";
import {
  getMobileFeeds,
  createMobileFeed,
  updateMobileFeed,
  deleteMobileFeed,
  MobileFeed,
  CreateMobileFeedRequest,
  UpdateMobileFeedRequest
} from "../../../services/adminMobileFeedsService";
import {
  Smartphone,
  Plus,
  Trash2,
  Edit,
  Send,
  Calendar,
  Users,
  RefreshCw,
  AlertCircle,
  Image,
  X,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../../utils/getCroppedImg';
import compressImage from '../../../utils/ImageCompression';
import axios from 'axios';

export default function AdminMobileFeedsPage() {
  const [feeds, setFeeds] = useState<MobileFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [feedType, setFeedType] = useState<'general' | 'urgent' | 'announcement'>('general');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());

  // Image upload states
  const [fileSrc, setFileSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const truncateMessage = (message: string, maxLength: number = 120) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const toggleMessageExpansion = (feedId: number) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(feedId)) {
      newExpanded.delete(feedId);
    } else {
      newExpanded.add(feedId);
    }
    setExpandedMessages(newExpanded);
  };

  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMobileFeeds(1, 50); // Get more feeds for admin view
        setFeeds(data.feeds || []);
      } catch (err) {
        setError("Failed to load mobile feeds. You might not have admin privileges.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, [refreshTrigger]);

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setFeedType('general');
    setPriority('normal');
    setImageUrl("");
    setIsCreating(false);
    setEditingId(null);
    setFileSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
  };

  const handleEdit = (feed: MobileFeed) => {
    setTitle(feed.title);
    setMessage(feed.message);
    setFeedType(feed.feed_type);
    setPriority(feed.priority);
    setImageUrl(feed.image_url || "");
    setEditingId(feed.id);
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      setError("Title and message are required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const feedData: CreateMobileFeedRequest | UpdateMobileFeedRequest = {
        title: title.trim(),
        message: message.trim(),
        feedType,
        priority,
        imageUrl: imageUrl.trim() || undefined
      };

      if (editingId !== null) {
        await updateMobileFeed(editingId, feedData);
      } else {
        await createMobileFeed(feedData as CreateMobileFeedRequest);
      }

      resetForm();
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save mobile feed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (feedId: number) => {
    setSubmitting(true);
    setError(null);

    try {
      await deleteMobileFeed(feedId);
      setShowDeleteConfirm(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete mobile feed");
    } finally {
      setSubmitting(false);
    }
  };

  // Image upload functions
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { compressedFile, error } = await compressImage(file);
    if (error || !compressedFile) {
      console.error('Compression failed', error);
      setError('Image compression failed');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    reader.onload = () => setFileSrc(reader.result as string);
  };

  const onCropComplete = (_: any, areaPixels: any) => {
    setCroppedArea(areaPixels);
  };

  const uploadCroppedImage = async () => {
    if (!fileSrc || !croppedArea) return;
    setUploadingImage(true);
    setError(null);

    try {
      const croppedBlob = await getCroppedImg(fileSrc, croppedArea);
      const file = new File([croppedBlob], 'mobile_feed_image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/mobile/feeds/upload-image`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setImageUrl(res.data.url);
      setFileSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const getFeedTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'announcement':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-2 text-lg">Loading mobile feeds...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Smartphone className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mobile App Feeds</h1>
            <p className="text-gray-600">Manage feeds that appear in the mobile app</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Feed
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId !== null ? 'Edit Mobile Feed' : 'Create New Mobile Feed'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter feed title"
                  required
                />
              </div>

              {/* Feed Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feed Type
                </label>
                <select
                  value={feedType}
                  onChange={(e) => setFeedType(e.target.value as 'general' | 'urgent' | 'announcement')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="general">General</option>
                  <option value="urgent">Urgent</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'normal' | 'high')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feed Image (optional)
                </label>

                {/* Current Image Preview */}
                {imageUrl && (
                  <div className="mb-3">
                    <img
                      src={imageUrl}
                      alt="Feed preview"
                      className="w-32 h-32 rounded-lg border-2 border-green-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="mt-1 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove image
                    </button>
                  </div>
                )}

                {/* File Input */}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white file:hover:bg-green-700 transition"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload an image to enhance your feed. Images will be compressed and cropped.
                </p>

                {/* Image Cropper */}
                {fileSrc && (
                  <div className="mt-4 space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="relative w-full h-64 border border-gray-300 rounded-lg bg-white">
                      <Cropper
                        image={fileSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={16 / 9} // Good aspect ratio for mobile feeds
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    </div>

                    {/* Zoom Control */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Zoom
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                    </div>

                    {/* Upload Button */}
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={uploadCroppedImage}
                        disabled={uploadingImage}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {uploadingImage ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFileSrc(null);
                          setCrop({ x: 0, y: 0 });
                          setZoom(1);
                          setCroppedArea(null);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual URL input as fallback */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Or enter image URL directly
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter feed message"
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !message.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {editingId !== null ? 'Update Feed' : 'Create Feed'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feeds List */}
      <div className="space-y-4">
        {feeds.length === 0 ? (
          <div className="text-center py-12">
            <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mobile feeds</h3>
            <p className="text-gray-600 mb-4">Create your first mobile app feed to get started.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Feed
            </button>
          </div>
        ) : (
          feeds.map((feed) => (
            <div key={feed.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{feed.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getFeedTypeColor(feed.feed_type)}`}>
                      {feed.feed_type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(feed.priority)}`}>
                      {feed.priority}
                    </span>
                  </div>

                  <div className="mb-3">
                    {expandedMessages.has(feed.id) ? (
                      <p className="text-gray-700 whitespace-pre-wrap">{feed.message}</p>
                    ) : (
                      <p className="text-gray-700">{truncateMessage(feed.message)}</p>
                    )}
                    {feed.message.length > 120 && (
                      <button
                        onClick={() => toggleMessageExpansion(feed.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium mt-1"
                      >
                        {expandedMessages.has(feed.id) ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>

                  {feed.image_url && (
                    <div className="mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Image className="w-4 h-4 mr-1" />
                        <span>Has image attachment</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(feed.published_at), 'MMM d, yyyy h:mm a')}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      ID: {feed.created_by}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(feed)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit feed"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(feed.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete feed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this mobile feed? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
