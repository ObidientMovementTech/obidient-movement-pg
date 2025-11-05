/**
 * Submission Queue Component
 * Detailed view of queued submissions with retry/delete options
 */

import { useEffect, useState } from 'react';
import { X, RefreshCw, Trash2, Clock, Check, AlertTriangle, FileText } from 'lucide-react';
import {
  getQueuedSubmissions,
  getAllDrafts,
  removeFromQueue,
  deleteDraft,
  updateSubmissionStatus,
  type QueuedSubmission,
  type DraftSubmission
} from '../utils/submissionQueue';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface SubmissionQueueProps {
  isOpen: boolean;
  onClose: () => void;
  onSync?: () => void;
}

export const SubmissionQueue = ({ isOpen, onClose, onSync }: SubmissionQueueProps) => {
  const [submissions, setSubmissions] = useState<QueuedSubmission[]>([]);
  const [drafts, setDrafts] = useState<DraftSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'queue' | 'drafts'>('queue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [queueData, draftData] = await Promise.all([
        getQueuedSubmissions(),
        getAllDrafts()
      ]);
      setSubmissions(queueData);
      setDrafts(draftData);
    } catch (error) {
      console.error('Error loading queue data:', error);
      toast.error('Failed to load queue data');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await updateSubmissionStatus(id, 'pending');
      toast.success('Submission marked for retry');
      loadData();
      if (onSync) onSync();
    } catch (error) {
      console.error('Error retrying submission:', error);
      toast.error('Failed to retry submission');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      await removeFromQueue(id);
      toast.success('Submission deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      await deleteDraft(id);
      toast.success('Draft deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    }
  };

  const getStatusBadge = (status: QueuedSubmission['status']) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      syncing: { color: 'bg-blue-100 text-blue-700', label: 'Syncing' },
      synced: { color: 'bg-green-100 text-green-700', label: 'Synced' },
      failed: { color: 'bg-red-100 text-red-700', label: 'Failed' }
    };

    const badge = badges[status];

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusIcon = (status: QueuedSubmission['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'synced':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatSubmissionType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Submission Queue</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'queue'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Queue ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'drafts'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Drafts ({drafts.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : activeTab === 'queue' ? (
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No submissions in queue</p>
                </div>
              ) : (
                submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(submission.status)}
                        <h3 className="font-medium text-gray-900">
                          {formatSubmissionType(submission.type)}
                        </h3>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p>PU: {submission.pollingUnitCode}</p>
                      <p>Created: {format(submission.createdAt, 'MMM d, yyyy HH:mm')}</p>
                      {submission.syncAttempts > 0 && (
                        <p className="text-gray-500">
                          Attempts: {submission.syncAttempts}
                        </p>
                      )}
                      {submission.error && (
                        <p className="text-red-600 text-xs mt-1">{submission.error}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {submission.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(submission.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Retry
                        </button>
                      )}
                      {(submission.status === 'synced' || submission.status === 'failed') && (
                        <button
                          onClick={() => handleDelete(submission.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No drafts saved</p>
                </div>
              ) : (
                drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <h3 className="font-medium text-gray-900">
                          {formatSubmissionType(draft.formType)}
                        </h3>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        Draft
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p>Last saved: {format(draft.updatedAt, 'MMM d, yyyy HH:mm')}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Draft
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={loadData}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionQueue;
