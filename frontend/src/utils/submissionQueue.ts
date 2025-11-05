/**
 * Submission Queue Manager
 * Manages offline submission queue with auto-save, sync status, and conflict resolution
 */

import { getItem, setItem, deleteItem, getAllItems, getItemsByIndex, STORES } from './offlineStorage';

/**
 * Generate a simple UUID v4
 */
const uuidv4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export type SubmissionStatus = 'draft' | 'pending' | 'syncing' | 'synced' | 'failed';

export type SubmissionType =
  | 'polling_unit_info'
  | 'officer_arrival'
  | 'result_tracking'
  | 'incident_report';

export interface QueuedSubmission {
  id: string; // Client-side unique ID
  clientSubmissionId: string; // For server deduplication
  type: SubmissionType;
  electionId: string;
  pollingUnitCode: string;
  data: any; // Form data
  status: SubmissionStatus;
  priority: number; // Higher = more important (1-10)
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  lastSyncAttempt?: number;
  syncAttempts: number;
  error?: string;
  serverSubmissionId?: string; // Server's submission ID after sync
}

export interface DraftSubmission {
  id: string;
  formType: SubmissionType;
  electionId: string;
  data: any;
  createdAt: number;
  updatedAt: number;
}

/**
 * Generate a unique client submission ID
 */
const generateClientSubmissionId = (): string => {
  return `${Date.now()}-${uuidv4()}`;
};

/**
 * Save a draft (auto-save functionality)
 */
export const saveDraft = async (
  formType: SubmissionType,
  electionId: string,
  data: any
): Promise<string> => {
  try {
    // Check if draft already exists for this form
    const existingDrafts = await getItemsByIndex<DraftSubmission>(
      STORES.DRAFTS,
      'formType',
      formType
    );

    const existingDraft = existingDrafts.find(d => d.electionId === electionId);

    const draftId = existingDraft?.id || uuidv4();
    const now = Date.now();

    const draft: DraftSubmission = {
      id: draftId,
      formType,
      electionId,
      data,
      createdAt: existingDraft?.createdAt || now,
      updatedAt: now
    };

    await setItem(STORES.DRAFTS, draftId, draft);
    return draftId;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

/**
 * Get a draft by form type and election
 */
export const getDraft = async (
  formType: SubmissionType,
  electionId: string
): Promise<DraftSubmission | null> => {
  try {
    const drafts = await getItemsByIndex<DraftSubmission>(
      STORES.DRAFTS,
      'formType',
      formType
    );

    return drafts.find(d => d.electionId === electionId) || null;
  } catch (error) {
    console.error('Error getting draft:', error);
    return null;
  }
};

/**
 * Delete a draft
 */
export const deleteDraft = async (draftId: string): Promise<void> => {
  try {
    await deleteItem(STORES.DRAFTS, draftId);
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};

/**
 * Get all drafts
 */
export const getAllDrafts = async (): Promise<DraftSubmission[]> => {
  try {
    return await getAllItems<DraftSubmission>(STORES.DRAFTS);
  } catch (error) {
    console.error('Error getting all drafts:', error);
    return [];
  }
};

/**
 * Add a submission to the queue
 */
export const addToQueue = async (
  type: SubmissionType,
  electionId: string,
  pollingUnitCode: string,
  data: any,
  priority: number = 5
): Promise<string> => {
  try {
    const id = uuidv4();
    const clientSubmissionId = generateClientSubmissionId();
    const now = Date.now();

    const submission: QueuedSubmission = {
      id,
      clientSubmissionId,
      type,
      electionId,
      pollingUnitCode,
      data,
      status: 'pending',
      priority,
      createdAt: now,
      updatedAt: now,
      syncAttempts: 0
    };

    await setItem(STORES.SYNC_QUEUE, id, submission);

    // Delete associated draft if exists
    const draft = await getDraft(type, electionId);
    if (draft) {
      await deleteDraft(draft.id);
    }

    return id;
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw error;
  }
};

/**
 * Update submission status
 */
export const updateSubmissionStatus = async (
  id: string,
  status: SubmissionStatus,
  error?: string,
  serverSubmissionId?: string
): Promise<void> => {
  try {
    const submission = await getItem<QueuedSubmission>(STORES.SYNC_QUEUE, id);
    if (!submission) {
      console.warn('Submission not found:', id);
      return;
    }

    submission.status = status;
    submission.updatedAt = Date.now();

    if (status === 'syncing') {
      submission.lastSyncAttempt = Date.now();
      submission.syncAttempts++;
    }

    if (status === 'synced') {
      submission.syncedAt = Date.now();
      if (serverSubmissionId) {
        submission.serverSubmissionId = serverSubmissionId;
      }
    }

    if (status === 'failed' && error) {
      submission.error = error;
    }

    await setItem(STORES.SYNC_QUEUE, id, submission);
  } catch (error) {
    console.error('Error updating submission status:', error);
    throw error;
  }
};

/**
 * Get all queued submissions
 */
export const getQueuedSubmissions = async (): Promise<QueuedSubmission[]> => {
  try {
    const submissions = await getAllItems<QueuedSubmission>(STORES.SYNC_QUEUE);
    // Sort by priority (desc) then createdAt (asc)
    return submissions.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt - b.createdAt;
    });
  } catch (error) {
    console.error('Error getting queued submissions:', error);
    return [];
  }
};

/**
 * Get pending submissions (ready to sync)
 */
export const getPendingSubmissions = async (): Promise<QueuedSubmission[]> => {
  try {
    const submissions = await getItemsByIndex<QueuedSubmission>(
      STORES.SYNC_QUEUE,
      'status',
      'pending'
    );

    // Also include failed submissions that haven't exceeded retry limit
    const failedSubmissions = await getItemsByIndex<QueuedSubmission>(
      STORES.SYNC_QUEUE,
      'status',
      'failed'
    );

    const retryableFailedSubmissions = failedSubmissions.filter(
      s => s.syncAttempts < 3 // Max 3 retry attempts
    );

    const allPending = [...submissions, ...retryableFailedSubmissions];

    // Sort by priority and createdAt
    return allPending.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt - b.createdAt;
    });
  } catch (error) {
    console.error('Error getting pending submissions:', error);
    return [];
  }
};

/**
 * Remove a submission from queue
 */
export const removeFromQueue = async (id: string): Promise<void> => {
  try {
    await deleteItem(STORES.SYNC_QUEUE, id);
  } catch (error) {
    console.error('Error removing from queue:', error);
    throw error;
  }
};

/**
 * Clear synced submissions older than specified days
 */
export const clearOldSyncedSubmissions = async (daysOld: number = 7): Promise<number> => {
  try {
    const submissions = await getItemsByIndex<QueuedSubmission>(
      STORES.SYNC_QUEUE,
      'status',
      'synced'
    );

    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const oldSubmissions = submissions.filter(s => s.syncedAt && s.syncedAt < cutoffTime);

    for (const submission of oldSubmissions) {
      await removeFromQueue(submission.id);
    }

    return oldSubmissions.length;
  } catch (error) {
    console.error('Error clearing old submissions:', error);
    return 0;
  }
};

/**
 * Get queue statistics
 */
export const getQueueStats = async (): Promise<{
  total: number;
  pending: number;
  syncing: number;
  synced: number;
  failed: number;
  draft: number;
}> => {
  try {
    const submissions = await getQueuedSubmissions();
    const drafts = await getAllDrafts();

    const stats = {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      syncing: submissions.filter(s => s.status === 'syncing').length,
      synced: submissions.filter(s => s.status === 'synced').length,
      failed: submissions.filter(s => s.status === 'failed').length,
      draft: drafts.length
    };

    return stats;
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return {
      total: 0,
      pending: 0,
      syncing: 0,
      synced: 0,
      failed: 0,
      draft: 0
    };
  }
};

/**
 * Sync submissions with server
 */
export const syncSubmissions = async (
  apiClient: any, // Your axios instance
  onProgress?: (current: number, total: number, submission: QueuedSubmission) => void
): Promise<{
  synced: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}> => {
  try {
    const pendingSubmissions = await getPendingSubmissions();

    if (pendingSubmissions.length === 0) {
      return { synced: 0, failed: 0, errors: [] };
    }

    const results = {
      synced: 0,
      failed: 0,
      errors: [] as Array<{ id: string; error: string }>
    };

    // Process in batches of 10
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < pendingSubmissions.length; i += batchSize) {
      batches.push(pendingSubmissions.slice(i, i + batchSize));
    }

    let processedCount = 0;

    for (const batch of batches) {
      const batchPromises = batch.map(async (submission) => {
        try {
          await updateSubmissionStatus(submission.id, 'syncing');

          if (onProgress) {
            processedCount++;
            onProgress(processedCount, pendingSubmissions.length, submission);
          }

          // Map type to endpoint
          const endpointMap: Record<SubmissionType, string> = {
            polling_unit_info: '/monitoring/polling-unit',
            officer_arrival: '/monitoring/officer-arrival',
            result_tracking: '/monitoring/result-tracking',
            incident_report: '/monitoring/incident-report'
          };

          const endpoint = endpointMap[submission.type];

          // Include client submission ID for deduplication
          const payload = {
            ...submission.data,
            clientSubmissionId: submission.clientSubmissionId,
            electionId: submission.electionId,
            pollingUnitCode: submission.pollingUnitCode
          };

          const response = await apiClient.post(endpoint, payload);

          if (response.data.success) {
            await updateSubmissionStatus(
              submission.id,
              'synced',
              undefined,
              response.data.data?.submissionId
            );
            results.synced++;
          } else {
            throw new Error(response.data.message || 'Sync failed');
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message;
          await updateSubmissionStatus(submission.id, 'failed', errorMessage);
          results.failed++;
          results.errors.push({ id: submission.id, error: errorMessage });
        }
      });

      await Promise.all(batchPromises);
    }

    return results;
  } catch (error) {
    console.error('Error syncing submissions:', error);
    throw error;
  }
};

/**
 * Auto-save draft periodically
 */
export const setupAutoSave = (
  formType: SubmissionType,
  electionId: string,
  getFormData: () => any,
  intervalMs: number = 30000 // 30 seconds
): (() => void) => {
  const autoSaveInterval = setInterval(async () => {
    try {
      const data = getFormData();

      // Only save if there's actual data
      if (data && Object.keys(data).length > 0) {
        await saveDraft(formType, electionId, data);
        console.log('Draft auto-saved');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, intervalMs);

  // Return cleanup function
  return () => {
    clearInterval(autoSaveInterval);
  };
};

export default {
  saveDraft,
  getDraft,
  deleteDraft,
  getAllDrafts,
  addToQueue,
  updateSubmissionStatus,
  getQueuedSubmissions,
  getPendingSubmissions,
  removeFromQueue,
  clearOldSyncedSubmissions,
  getQueueStats,
  syncSubmissions,
  setupAutoSave
};
