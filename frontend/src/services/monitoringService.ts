import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Election interface
export interface Election {
  id: string;
  election_id: string;
  election_name: string;
  election_type: string;
  election_date: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  state?: string;
  lga?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Types for monitoring dashboard status
export interface FormStatus {
  completed: boolean;
  count: number;
  lastUpdated?: string;
}

export interface MonitoringStatus {
  needsPUSetup: boolean;
  puInfo?: any;
  formStatuses: {
    pollingUnit: FormStatus;
    officerArrival: FormStatus;
    resultTracking: FormStatus;
    incidentReporting: FormStatus;
  };
  monitoringScope?: {
    state?: string;
    stateLabel?: string;
    lga?: string;
    lgaLabel?: string;
    ward?: string;
    wardLabel?: string;
    pollingUnit?: string;
    pollingUnitLabel?: string;
    level?: string;
    designation?: string;
    source?: 'monitoring_location' | 'voting_fields';
  };
}

export interface RecentSubmission {
  form_type: string;
  id: string;
  title: string;
  description: string;
  created_at: string;
}

// Types for monitoring submissions
export interface PollingUnitSubmission {
  submissionId?: string;
  electionId: string;
  puCode: string;
  puName: string;
  ward: string;
  lga: string;
  state: string;
  gpsCoordinates?: string;
  locationType?: string;
  locationOther?: string;
}

export interface OfficerArrivalReport {
  submissionId: string;
  firstArrivalTime?: string;
  lastArrivalTime?: string;
  onTimeStatus?: string;
  proofTypes?: string[];
  arrivalNotes?: string;
  officerNames?: any;
  votingStarted?: string;
  actualStartTime?: string;
  materialsVerification?: any;
  securityPresence?: string;
  setupCompletionTime?: string;
  contextualNotes?: string;
  arrivalPhotos?: string[];
  officerPhotos?: any;
}

export interface ResultTrackingReport {
  submissionId: string;
  pollingInfo?: any;
  registeredVoters?: number;
  accreditedVoters?: number;
  validVotes?: number;
  rejectedVotes?: number;
  totalVotesCast?: number;
  votesPerParty?: any[];
  ec8aPhotos?: string[];
  announcementVideos?: string[];
  resultSheetPhotos?: string[];
  wallPostingPhotos?: string[];
  resultAnnouncedBy?: string;
  announcementTime?: string;
  partyAgentsPresent?: any;
  discrepanciesNoted?: string;
  resultUploadStatus?: string;
  additionalNotes?: string;
}

export interface IncidentReport {
  submissionId: string;
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timeReported: string;
  actionTaken?: string;
  resolved: boolean;
  evidenceUrls?: string[];
}

export interface SubmissionStatus {
  submissionId: string;
  pollingUnitSubmitted: boolean;
  officerArrivalSubmitted: boolean;
  resultTrackingSubmitted: boolean;
  lastUpdated: string;
  incidentCount: number;
  currentPhase: 'setup' | 'voting' | 'counting' | 'completed';
}

class MonitoringService {
  private getRequestConfig() {
    return {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  // ================================
  // ELECTION METHODS
  // ================================

  async getActiveElections(): Promise<Election[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/elections?status=active`,
        this.getRequestConfig()
      );
      return response.data.data.elections || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch active elections');
    }
  }

  async getUpcomingElections(): Promise<Election[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/elections?status=upcoming`,
        this.getRequestConfig()
      );
      return response.data.data.elections || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch upcoming elections');
    }
  }

  async getAllElections(): Promise<Election[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/elections`,
        this.getRequestConfig()
      );
      return response.data.data.elections || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch elections');
    }
  }

  // ================================
  // FORM SUBMISSION METHODS
  // ================================

  async submitPollingUnitInfo(data: PollingUnitSubmission) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/monitoring/polling-unit`,
        data,
        this.getRequestConfig()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit polling unit information');
    }
  }

  async submitOfficerArrival(data: OfficerArrivalReport) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/monitoring/officer-arrival`,
        data,
        this.getRequestConfig()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit officer arrival report');
    }
  }

  async submitResultTracking(data: ResultTrackingReport) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/monitoring/result-tracking`,
        data,
        this.getRequestConfig()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit result tracking');
    }
  }

  async submitIncidentReport(data: IncidentReport) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/monitoring/incident-report`,
        data,
        this.getRequestConfig()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit incident report');
    }
  }

  // ================================
  // DATA RETRIEVAL METHODS
  // ================================

  async getUserSubmissions() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/monitoring/submissions`,
        this.getRequestConfig()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user submissions');
    }
  }

  async getSubmissionStatus(submissionId: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/monitoring/submission/${submissionId}`,
        this.getRequestConfig()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get submission status');
    }
  }

  async getSubmissionDetails(submissionId: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/monitoring/submission/${submissionId}/details`,
        this.getRequestConfig()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get submission details');
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  generateSubmissionId(): string {
    return `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentPhase(): 'setup' | 'voting' | 'counting' | 'completed' {
    const now = new Date();
    const hour = now.getHours();

    // Basic phase detection based on time (can be customized)
    if (hour < 8) return 'setup';
    if (hour < 14) return 'voting';
    if (hour < 20) return 'counting';
    return 'completed';
  }

  formatTimeForSubmission(date: Date = new Date()): string {
    return date.toISOString();
  }

  validatePollingUnitCode(code: string): boolean {
    // Basic validation - should be customized based on actual format
    return /^[A-Z0-9]{6,12}$/.test(code);
  }

  validateGPSLocation(location: { latitude: number; longitude: number }): boolean {
    return (
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180
    );
  }

  // Get current location using browser geolocation
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number; accuracy?: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  // Helper to check if user has active monitoring access
  async checkMonitoringAccess() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/monitor-key/access`,
        this.getRequestConfig()
      );
      return response.data.hasActiveKey;
    } catch (error: any) {
      return false;
    }
  }

  // ================================
  // MONITORING DASHBOARD STATUS
  // ================================

  /**
   * Get monitoring dashboard status including PU completion and form statuses
   */
  async getMonitoringStatus(): Promise<MonitoringStatus> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/monitoring/status`,
        this.getRequestConfig()
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get monitoring status');
      }
    } catch (error: any) {
      console.error('Error getting monitoring status:', error);
      throw new Error(error.response?.data?.message || 'Failed to get monitoring status');
    }
  }

  /**
   * Get recent submissions summary
   */
  async getRecentSubmissions(limit: number = 10): Promise<RecentSubmission[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/monitoring/recent-submissions?limit=${limit}`,
        this.getRequestConfig()
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get recent submissions');
      }
    } catch (error: any) {
      console.error('Error getting recent submissions:', error);
      throw new Error(error.response?.data?.message || 'Failed to get recent submissions');
    }
  }

  // ================================
  // EVIDENCE UPLOAD
  // ================================

  /**
   * Upload evidence (photos/videos) to S3 storage
   * Returns the S3 URL for the uploaded file
   */
  async uploadEvidence(
    file: File,
    metadata?: {
      type?: string;
      role?: string;
      description?: string;
    },
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('evidence', file);

      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await axios.post(
        `${API_BASE_URL}/monitoring/upload-evidence`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          }
        }
      );

      if (response.data.success) {
        return response.data.data.url;
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading evidence:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload evidence');
    }
  }

  /**
   * Upload multiple evidence files
   * Returns array of S3 URLs
   */
  async uploadMultipleEvidence(
    files: File[],
    metadata?: { type?: string; description?: string },
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) =>
      this.uploadEvidence(
        file,
        metadata,
        onProgress ? (progress) => onProgress(index, progress) : undefined
      )
    );

    return Promise.all(uploadPromises);
  }
}

export const monitoringService = new MonitoringService();
