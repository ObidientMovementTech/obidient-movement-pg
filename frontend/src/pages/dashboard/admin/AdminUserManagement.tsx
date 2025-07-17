import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  // Plus, 
  Trash2, Shield, ShieldOff,
  CheckCircle, XCircle, UserCheck, UserX, Eye, Loader2, X, AlertTriangle, Mail, Send
} from 'lucide-react';
import { adminUserManagementService } from '../../../services/adminUserManagementService';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  kycStatus: 'unsubmitted' | 'draft' | 'pending' | 'approved' | 'rejected';
  profileImage?: string;
  countryOfResidence?: string;
  votingState?: string;
  votingLGA?: string;
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
  totalMembersInOwnedBlocs: number;
  ownedVotingBlocsCount: number;
  lastVotingBlocActivity?: string;
}

interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  approvedKyc: number;
  pendingKyc: number;
  rejectedKyc: number;
  unsubmittedKyc: number;
  newUsersWeek: number;
  newUsersMonth: number;
}

interface UnverifiedStats {
  count: number;
  recentSignups: number; // Last 7 days
}

// Confirmation modal interface
interface ConfirmationModal {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmStyle: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [unverifiedStats, setUnverifiedStats] = useState<UnverifiedStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email operation states
  const [emailOperations, setEmailOperations] = useState({
    bulkResending: false,
    bulkProgress: { sent: 0, failed: 0, total: 0 }
  });

  // OPTIMIZED: Pagination and filtering with better defaults
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [limit, setLimit] = useState(25); // Increased default
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [skipCount, setSkipCount] = useState(false);

  // Fast search state
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // UI state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  // Loading states for individual actions
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    confirmStyle: 'primary',
    onConfirm: () => { },
    onCancel: () => { },
    loading: false
  });

  // OPTIMIZED: Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // Reduced debounce time for better UX

    return () => clearTimeout(timer);
  }, [search]);

  // OPTIMIZED: Fast search for typeahead
  const handleFastSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await adminUserManagementService.fastSearch(query, 10);
      setSearchResults(response.data.users);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Fast search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // OPTIMIZED: Memoized load users function
  const loadUsers = useCallback(async (fastLoad = false) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        search: debouncedSearch,
        role: roleFilter,
        kycStatus: kycFilter,
        emailVerified: emailVerifiedFilter,
        sortBy,
        sortOrder,
        skipCount: fastLoad ? 'true' : 'false' // Skip expensive count for faster loading
      };

      const response = await adminUserManagementService.getAllUsers(params);
      setUsers(response.data.users);
      setCurrentPage(response.data.pagination.page);

      if (response.data.pagination.total !== undefined) {
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, debouncedSearch, roleFilter, kycFilter, emailVerifiedFilter, sortBy, sortOrder]);

  // OPTIMIZED: Memoized load stats function
  const loadStats = useCallback(async () => {
    try {
      const response = await adminUserManagementService.getUserStatistics();
      setStats(response.data.statistics);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  // Load unverified users stats
  const loadUnverifiedStats = useCallback(async () => {
    try {
      const response = await adminUserManagementService.getUnverifiedUsersStats();
      console.log('📊 Unverified stats response:', response.data);

      // Map backend response to frontend interface
      const backendStats = response.data.stats;
      const mappedStats = {
        count: parseInt(backendStats.total_unverified) || 0,
        recentSignups: parseInt(backendStats.unverified_last_7d) || 0
      };

      console.log('📈 Mapped unverified stats:', mappedStats);
      setUnverifiedStats(mappedStats);
    } catch (error: any) {
      console.error('❌ Failed to load unverified stats:', error);
    }
  }, []);

  // OPTIMIZED: Effects with better dependency management
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadStats();
    loadUnverifiedStats();
  }, [loadStats, loadUnverifiedStats]);

  // Fast search effect
  useEffect(() => {
    if (search.length >= 2) {
      handleFastSearch(search);
    } else {
      setShowSearchResults(false);
    }
  }, [search, handleFastSearch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, roleFilter, kycFilter, emailVerifiedFilter, sortBy, sortOrder]);

  // Helper function to show confirmation modal
  const showConfirmation = (config: Omit<ConfirmationModal, 'isOpen' | 'onCancel'>) => {
    setConfirmationModal({
      ...config,
      isOpen: true,
      onCancel: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  // Helper functions for search modal
  const closeSearchModal = () => {
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const selectSearchResult = (user: User) => {
    setSearch(user.email);
    setShowSearchResults(false);
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin', userName: string) => {
    const isPromoting = newRole === 'admin';

    showConfirmation({
      title: isPromoting ? 'Promote to Admin' : 'Remove Admin Rights',
      message: isPromoting
        ? `Are you sure you want to promote "${userName}" to admin? This will give them full administrative access to the platform.`
        : `Are you sure you want to remove admin rights from "${userName}"? They will lose all administrative privileges.`,
      confirmText: isPromoting ? 'Promote to Admin' : 'Remove Admin Rights',
      confirmStyle: isPromoting ? 'warning' : 'danger',
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, loading: true }));
        setActionLoading(prev => ({ ...prev, [`role-${userId}`]: true }));
        try {
          await adminUserManagementService.updateUserRole(userId, newRole);
          setSuccess(`User role updated to ${newRole}`);
          loadUsers();
          setConfirmationModal(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error: any) {
          setError(error.response?.data?.message || 'Failed to update role');
          setConfirmationModal(prev => ({ ...prev, loading: false }));
        } finally {
          setActionLoading(prev => ({ ...prev, [`role-${userId}`]: false }));
        }
      }
    });
  };

  const handleStatusChange = async (userId: string, emailVerified: boolean, userName: string) => {
    if (emailVerified) {
      // For verification, proceed without confirmation
      setActionLoading(prev => ({ ...prev, [`status-${userId}`]: true }));
      try {
        await adminUserManagementService.updateUserStatus(userId, { emailVerified });
        setSuccess(`Email verification status updated`);
        loadUsers();
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to update status');
      } finally {
        setActionLoading(prev => ({ ...prev, [`status-${userId}`]: false }));
      }
    } else {
      // For unverification, show confirmation
      showConfirmation({
        title: 'Unverify Email',
        message: `Are you sure you want to unverify "${userName}"'s email? This may restrict their access to certain features and they will need to verify their email again.`,
        confirmText: 'Unverify Email',
        confirmStyle: 'warning',
        onConfirm: async () => {
          setConfirmationModal(prev => ({ ...prev, loading: true }));
          setActionLoading(prev => ({ ...prev, [`status-${userId}`]: true }));
          try {
            await adminUserManagementService.updateUserStatus(userId, { emailVerified });
            setSuccess(`Email verification status updated`);
            loadUsers();
            setConfirmationModal(prev => ({ ...prev, isOpen: false, loading: false }));
          } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to update status');
            setConfirmationModal(prev => ({ ...prev, loading: false }));
          } finally {
            setActionLoading(prev => ({ ...prev, [`status-${userId}`]: false }));
          }
        }
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    showConfirmation({
      title: 'Delete User',
      message: `Are you sure you want to permanently delete "${userName}"? This action cannot be undone and will remove all their data including:\n\n• User profile and personal information\n• Voting bloc memberships and activities\n• Messages and communications\n• KYC data and documents\n• All associated records`,
      confirmText: 'Delete User',
      confirmStyle: 'danger',
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, loading: true }));
        setActionLoading(prev => ({ ...prev, [`delete-${userId}`]: true }));
        try {
          await adminUserManagementService.deleteUser(userId);
          setSuccess(`User ${userName} deleted successfully`);
          loadUsers();
          setConfirmationModal(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error: any) {
          setError(error.response?.data?.message || 'Failed to delete user');
          setConfirmationModal(prev => ({ ...prev, loading: false }));
        } finally {
          setActionLoading(prev => ({ ...prev, [`delete-${userId}`]: false }));
        }
      }
    });
  };

  // Email resend functions
  const handleResendVerificationEmail = async (userId: string, userEmail: string) => {
    setActionLoading(prev => ({ ...prev, [`email-${userId}`]: true }));
    try {
      const response = await adminUserManagementService.resendVerificationEmail(userId);
      setSuccess(`Verification email sent to ${userEmail}`);

      if (response.data.emailSent) {
        // Optional: You can add additional success feedback here
        console.log('Email sent successfully via:', response.data.provider || 'SMTP');
      }

    } catch (error: any) {
      setError(error.response?.data?.message || `Failed to send verification email to ${userEmail}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`email-${userId}`]: false }));
    }
  };

  const handleResendAllVerificationEmails = async () => {
    // If we don't have stats yet, try to load them first
    if (!unverifiedStats) {
      setError('Loading unverified user statistics...');
      await loadUnverifiedStats();
      return;
    }

    if (unverifiedStats.count === 0) {
      setError('No unverified users found');
      return;
    }

    showConfirmation({
      title: 'Resend All Verification Emails',
      message: `Are you sure you want to resend verification emails to all ${unverifiedStats.count} unverified users?\n\nThis operation:\n• Will send ${unverifiedStats.count} emails\n• May take several minutes to complete\n• Cannot be undone once started\n\nContinue with bulk email operation?`,
      confirmText: `Send ${unverifiedStats.count} Emails`,
      confirmStyle: 'warning',
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, loading: true }));
        setEmailOperations(prev => ({
          ...prev,
          bulkResending: true,
          bulkProgress: { sent: 0, failed: 0, total: unverifiedStats.count }
        }));

        try {
          const response = await adminUserManagementService.resendAllVerificationEmails();

          // Update progress with final results
          setEmailOperations(prev => ({
            ...prev,
            bulkProgress: {
              sent: response.data.results?.successful || 0,
              failed: response.data.results?.failed || 0,
              total: response.data.results?.total || unverifiedStats.count
            }
          }));

          const { successful = 0, failed = 0 } = response.data.results || {};

          if (failed === 0) {
            setSuccess(`Successfully sent verification emails to all ${successful} unverified users!`);
          } else {
            setSuccess(`Sent ${successful} emails successfully. ${failed} failed to send.`);
            if (failed > 0) {
              setError(`Some emails failed to send. Check server logs for details.`);
            }
          }

          // Refresh stats after bulk operation
          loadUnverifiedStats();
          loadUsers();
          setConfirmationModal(prev => ({ ...prev, isOpen: false, loading: false }));

        } catch (error: any) {
          setError(error.response?.data?.message || 'Failed to send bulk verification emails');
          setConfirmationModal(prev => ({ ...prev, loading: false }));
        } finally {
          // Clear bulk operation state after a delay to show results
          setTimeout(() => {
            setEmailOperations(prev => ({
              ...prev,
              bulkResending: false,
              bulkProgress: { sent: 0, failed: 0, total: 0 }
            }));
          }, 5000);
        }
      }
    });
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0 || !bulkAction) return;

    const actionConfigs = {
      makeAdmin: {
        title: 'Promote Users to Admin',
        message: `Are you sure you want to promote ${selectedUsers.length} user(s) to admin? This will give them full administrative access to the platform.`,
        confirmText: 'Promote to Admin',
        confirmStyle: 'warning' as const,
        needsConfirmation: true
      },
      makeUser: {
        title: 'Remove Admin Rights',
        message: `Are you sure you want to remove admin rights from ${selectedUsers.length} user(s)? They will lose all administrative privileges.`,
        confirmText: 'Remove Admin Rights',
        confirmStyle: 'warning' as const,
        needsConfirmation: true
      },
      verifyEmail: {
        title: 'Verify Email Addresses',
        message: `Verify email addresses for ${selectedUsers.length} user(s).`,
        confirmText: 'Verify Emails',
        confirmStyle: 'primary' as const,
        needsConfirmation: false
      },
      unverifyEmail: {
        title: 'Unverify Email Addresses',
        message: `Are you sure you want to unverify email addresses for ${selectedUsers.length} user(s)? This may restrict their access to certain features.`,
        confirmText: 'Unverify Emails',
        confirmStyle: 'warning' as const,
        needsConfirmation: true
      },
      resendEmails: {
        title: 'Resend Verification Emails',
        message: `Send verification emails to ${selectedUsers.length} selected user(s). This will only send emails to unverified users in the selection.`,
        confirmText: 'Send Emails',
        confirmStyle: 'primary' as const,
        needsConfirmation: true
      }
    };

    const config = actionConfigs[bulkAction as keyof typeof actionConfigs];
    if (!config) return;

    const executeBulkAction = async () => {
      setBulkActionLoading(true);
      try {
        switch (bulkAction) {
          case 'makeAdmin':
            await adminUserManagementService.bulkUpdateUsers(selectedUsers, 'updateRole', { role: 'admin' });
            setSuccess(`${selectedUsers.length} users promoted to admin`);
            break;
          case 'makeUser':
            await adminUserManagementService.bulkUpdateUsers(selectedUsers, 'updateRole', { role: 'user' });
            setSuccess(`${selectedUsers.length} users set to regular user`);
            break;
          case 'verifyEmail':
            await adminUserManagementService.bulkUpdateUsers(selectedUsers, 'updateEmailVerified', { emailVerified: true });
            setSuccess(`${selectedUsers.length} users email verified`);
            break;
          case 'unverifyEmail':
            await adminUserManagementService.bulkUpdateUsers(selectedUsers, 'updateEmailVerified', { emailVerified: false });
            setSuccess(`${selectedUsers.length} users email unverified`);
            break;
          case 'resendEmails':
            // Resend emails to selected unverified users
            const selectedUnverifiedUsers = users.filter(u => selectedUsers.includes(u.id) && !u.emailVerified);
            if (selectedUnverifiedUsers.length === 0) {
              setError('No unverified users in selection');
              return;
            }

            let emailsSent = 0;
            let emailsFailed = 0;

            for (const user of selectedUnverifiedUsers) {
              try {
                await adminUserManagementService.resendVerificationEmail(user.id);
                emailsSent++;
              } catch (error) {
                emailsFailed++;
                console.error(`Failed to send email to ${user.email}:`, error);
              }
            }

            if (emailsFailed === 0) {
              setSuccess(`📧 Verification emails sent to ${emailsSent} users`);
            } else {
              setSuccess(`📧 Sent ${emailsSent} emails, ${emailsFailed} failed`);
            }
            break;
        }
        setSelectedUsers([]);
        setBulkAction('');
        loadUsers();
      } catch (error: any) {
        setError(error.response?.data?.message || 'Bulk operation failed');
      } finally {
        setBulkActionLoading(false);
      }
    };

    if (config.needsConfirmation) {
      showConfirmation({
        title: config.title,
        message: config.message,
        confirmText: config.confirmText,
        confirmStyle: config.confirmStyle,
        onConfirm: async () => {
          setConfirmationModal(prev => ({ ...prev, loading: true }));
          await executeBulkAction();
          setConfirmationModal(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      });
    } else {
      await executeBulkAction();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        <Shield size={12} className="mr-1" />
        Admin
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <Users size={12} className="mr-1" />
        User
      </span>
    );
  };

  const getKycBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      unsubmitted: 'bg-gray-100 text-gray-800',
      draft: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  // Confirmation Modal Component
  const ConfirmationModalComponent = () => {
    if (!confirmationModal.isOpen) return null;

    const getModalStyles = () => {
      switch (confirmationModal.confirmStyle) {
        case 'danger':
          return {
            icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
            iconBg: 'bg-red-100',
            confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
          };
        case 'warning':
          return {
            icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
            iconBg: 'bg-yellow-100',
            confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
          };
        default:
          return {
            icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
            iconBg: 'bg-blue-100',
            confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          };
      }
    };

    const styles = getModalStyles();

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={confirmationModal.onCancel}
          />

          {/* Modal positioning */}
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>

          {/* Modal content */}
          <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                {styles.icon}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {confirmationModal.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 whitespace-pre-line">
                    {confirmationModal.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                disabled={confirmationModal.loading}
                className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 ${styles.confirmBtn}`}
                onClick={confirmationModal.onConfirm}
              >
                {confirmationModal.loading && <Loader2 size={16} className="animate-spin mr-2" />}
                {confirmationModal.loading ? 'Processing...' : confirmationModal.confirmText}
              </button>
              <button
                type="button"
                disabled={confirmationModal.loading}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
                onClick={confirmationModal.onCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Bulk Email Button - Show if we have unverified stats or if stats haven't loaded yet (safety fallback) */}
          {(!unverifiedStats || (unverifiedStats && unverifiedStats.count > 0)) && (
            <button
              onClick={handleResendAllVerificationEmails}
              disabled={emailOperations.bulkResending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              title={unverifiedStats
                ? `Send verification emails to all ${unverifiedStats.count} unverified users`
                : "Send verification emails to all unverified users"
              }
            >
              {emailOperations.bulkResending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  {unverifiedStats
                    ? `Resend Bulk Email Confirmation (${unverifiedStats.count})`
                    : "Resend Bulk Email Confirmation"
                  }
                </>
              )}
            </button>
          )}

          {/* <button
            onClick={() => alert('Create user form - coming soon!')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Create User
          </button> */}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unverified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unverifiedUsers}</p>
                {unverifiedStats && unverifiedStats.recentSignups > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    +{unverifiedStats.recentSignups} this week
                  </p>
                )}
              </div>
              <Mail className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newUsersMonth}</p>
              </div>
              <UserCheck className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search - OPTIMIZED */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Enhanced Search with Fast Results */}
          <div className="md:col-span-2 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              {searchLoading && (
                <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" size={16} />
              )}
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <input
                type="text"
                placeholder="Search users (min 2 chars)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => search.length >= 2 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Fast Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {/* Header with close button */}
                <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">
                    Search Results ({searchResults.length})
                  </span>
                  <button
                    onClick={closeSearchModal}
                    className="text-gray-400 hover:text-gray-600"
                    title="Close search results"
                  >
                    <X size={16} />
                  </button>
                </div>

                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                    onClick={() => selectSearchResult(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Footer with actions */}
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Click a user to select or search for more results
                    </span>
                    <button
                      onClick={clearSearch}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {/* KYC Filter */}
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All KYC Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="unsubmitted">Unsubmitted</option>
          </select>

          {/* Email Verified Filter */}
          <select
            value={emailVerifiedFilter}
            onChange={(e) => setEmailVerifiedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Email Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="createdAt-DESC">Newest First</option>
            <option value="createdAt-ASC">Oldest First</option>
            <option value="name-ASC">Name A-Z</option>
            <option value="name-DESC">Name Z-A</option>
            <option value="email-ASC">Email A-Z</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-800">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-yellow-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Select action...</option>
                <option value="makeAdmin">Make Admin</option>
                <option value="makeUser">Make User</option>
                <option value="verifyEmail">Verify Email</option>
                <option value="unverifyEmail">Unverify Email</option>
                <option value="resendEmails">Resend Verification Emails</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || bulkActionLoading}
                className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-1"
              >
                {bulkActionLoading && <Loader2 size={14} className="animate-spin" />}
                {bulkActionLoading ? 'Processing...' : 'Apply'}
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="text-yellow-600 hover:text-yellow-700 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
          <XCircle size={16} className="mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center">
          <CheckCircle size={16} className="mr-2 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Processing indicator */}
      {(bulkActionLoading || Object.values(actionLoading).some(Boolean)) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 flex items-center">
          <Loader2 size={16} className="mr-2 flex-shrink-0 animate-spin" />
          Processing your request...
        </div>
      )}

      {/* Bulk Email Progress */}
      {emailOperations.bulkResending && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Loader2 size={16} className="mr-2 animate-spin text-blue-600" />
              <span className="text-blue-700 font-medium">Sending verification emails...</span>
            </div>
            <span className="text-sm text-blue-600">
              {emailOperations.bulkProgress.sent + emailOperations.bulkProgress.failed} / {emailOperations.bulkProgress.total}
            </span>
          </div>

          {emailOperations.bulkProgress.total > 0 && (
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((emailOperations.bulkProgress.sent + emailOperations.bulkProgress.failed) / emailOperations.bulkProgress.total) * 100}%`
                }}
              ></div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-blue-600">
            <span>✅ Sent: {emailOperations.bulkProgress.sent}</span>
            <span>❌ Failed: {emailOperations.bulkProgress.failed}</span>
            <span>📧 Total: {emailOperations.bulkProgress.total}</span>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden relative">
        {/* Loading overlay for bulk actions */}
        {bulkActionLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Processing bulk action...</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members in Owned Blocs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const userHasAction = Object.keys(actionLoading).some(key =>
                    key.includes(user.id) && actionLoading[key]
                  );

                  return (
                    <tr key={user.id} className={`hover:bg-gray-50 ${userHasAction ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          disabled={userHasAction || bulkActionLoading}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.profileImage ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.profileImage}
                                alt={user.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <Users size={20} className="text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && (
                              <div className="text-xs text-gray-400">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {getKycBadge(user.kycStatus)}
                      </td>
                      <td className="px-6 py-4">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle size={12} className="mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle size={12} className="mr-1" />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{user.totalMembersInOwnedBlocs}</span>
                          {user.ownedVotingBlocsCount > 0 && (
                            <span className="text-xs text-gray-500">
                              ({user.ownedVotingBlocsCount} bloc{user.ownedVotingBlocsCount !== 1 ? 's' : ''})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => alert(`User details for ${user.name} - coming soon!`)}
                            className="text-gray-400 hover:text-gray-600"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {user.role === 'admin' ? (
                            <button
                              onClick={() => handleRoleChange(user.id, 'user', user.name)}
                              disabled={actionLoading[`role-${user.id}`]}
                              className="text-purple-600 hover:text-purple-700 disabled:opacity-50 relative"
                              title="Remove Admin"
                            >
                              {actionLoading[`role-${user.id}`] ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <ShieldOff size={16} />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(user.id, 'admin', user.name)}
                              disabled={actionLoading[`role-${user.id}`]}
                              className="text-purple-600 hover:text-purple-700 disabled:opacity-50 relative"
                              title="Make Admin"
                            >
                              {actionLoading[`role-${user.id}`] ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Shield size={16} />
                              )}
                            </button>
                          )}

                          {user.emailVerified ? (
                            <button
                              onClick={() => handleStatusChange(user.id, false, user.name)}
                              disabled={actionLoading[`status-${user.id}`]}
                              className="text-orange-600 hover:text-orange-700 disabled:opacity-50 relative"
                              title="Unverify Email"
                            >
                              {actionLoading[`status-${user.id}`] ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <UserX size={16} />
                              )}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStatusChange(user.id, true, user.name)}
                                disabled={actionLoading[`status-${user.id}`]}
                                className="text-green-600 hover:text-green-700 disabled:opacity-50 relative"
                                title="Verify Email"
                              >
                                {actionLoading[`status-${user.id}`] ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <UserCheck size={16} />
                                )}
                              </button>

                              <button
                                onClick={() => handleResendVerificationEmail(user.id, user.email)}
                                disabled={actionLoading[`email-${user.id}`]}
                                className="text-blue-600 hover:text-blue-700 disabled:opacity-50 relative"
                                title="Resend Verification Email"
                              >
                                {actionLoading[`email-${user.id}`] ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Mail size={16} />
                                )}
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={actionLoading[`delete-${user.id}`]}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50 relative"
                            title="Delete User"
                          >
                            {actionLoading[`delete-${user.id}`] ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination with Performance Controls */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Show:</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded text-sm px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">per page</span>
            </div>

            {/* Performance mode toggle */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Fast mode:</label>
              <input
                type="checkbox"
                checked={skipCount}
                onChange={(e) => setSkipCount(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                title="Skip total count for faster loading"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Results info */}
            <div className="text-sm text-gray-700">
              {total !== null ? (
                <>
                  Showing {((currentPage - 1) * limit) + 1} to{' '}
                  {Math.min(currentPage * limit, total)} of{' '}
                  <span className="font-medium">{total.toLocaleString()}</span> results
                </>
              ) : (
                <>
                  Page {currentPage} • Fast mode
                  {loading && <Loader2 className="inline h-4 w-4 ml-2 animate-spin" />}
                </>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>

              {/* Current page indicator */}
              <span className="px-3 py-1 text-sm bg-green-50 border border-green-300 rounded text-green-700">
                {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={loading || (total !== null && currentPage >= totalPages)}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>

              {total !== null && totalPages > 1 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || loading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Last ({totalPages})
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModalComponent />
    </div>
  );
}
