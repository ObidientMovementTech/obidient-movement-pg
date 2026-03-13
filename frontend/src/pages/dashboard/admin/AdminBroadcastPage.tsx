import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  getAdminBroadcasts,
  sendAdminBroadcast,
  updateAdminBroadcast,
  deleteAdminBroadcast,
  getBroadcastEmailLogs,
  getBroadcastEmailStats,
  retryBroadcastEmails,
  cancelBroadcast,
  AdminBroadcast,
  BroadcastEmailLog,
  BroadcastEmailStats,
} from "../../../services/adminBroadcastService";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Check,
  Send,
  Calendar,
  Users,
  RefreshCw,
  AlertCircle,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  X,
  StopCircle,
} from "lucide-react";
import { format } from "date-fns";

// ---- Progress Card Component (polling-based) ----
function BroadcastProgressCard({
  broadcastId,
  onComplete,
  onDismiss,
}: {
  broadcastId: string;
  onComplete: () => void;
  onDismiss: () => void;
}) {
  const [stats, setStats] = useState<BroadcastEmailStats | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const data = await getBroadcastEmailStats(broadcastId);
        if (!mounted) return;
        setStats(data);

        // Stop polling on terminal states
        if (data.status === "completed" || data.status === "failed" || data.status === "cancelled") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          // Auto-complete after 4 seconds so the list refreshes
          setTimeout(() => {
            if (mounted) onComplete();
          }, 4000);
        }
      } catch {
        // Silently retry on next interval
      }
    };

    // Poll immediately, then every 3 seconds
    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [broadcastId, onComplete]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBroadcast(broadcastId);
    } catch {
      // Will be picked up by next poll
    } finally {
      setCancelling(false);
    }
  };

  // Show a minimal loading state only for the first poll
  if (!stats) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            <span className="text-blue-700 font-medium">Loading broadcast progress...</span>
          </div>
          <button onClick={onDismiss} className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  const total = stats.total;
  const sent = stats.sent;
  const failed = stats.failed;
  const pending = stats.pending;
  const processed = sent + failed;
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isTerminal = stats.status === "completed" || stats.status === "failed" || stats.status === "cancelled";
  const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
  const estimatedRemainMin = processed > 0 && !isTerminal
    ? Math.max(1, Math.round(((total - processed) / (processed / elapsedSec)) / 60))
    : null;

  return (
    <div className={`rounded-lg p-5 mb-6 border ${
      stats.status === "failed"
        ? "bg-red-50 border-red-200"
        : stats.status === "cancelled"
          ? "bg-orange-50 border-orange-200"
          : isTerminal
            ? "bg-green-50 border-green-200"
            : "bg-blue-50 border-blue-200"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isTerminal ? (
            stats.status === "failed" ? (
              <XCircle size={20} className="text-red-600" />
            ) : stats.status === "cancelled" ? (
              <StopCircle size={20} className="text-orange-600" />
            ) : (
              <CheckCircle size={20} className="text-green-600" />
            )
          ) : (
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          )}
          <span className={`font-medium ${
            stats.status === "failed" ? "text-red-700"
              : stats.status === "cancelled" ? "text-orange-700"
              : isTerminal ? "text-green-700" : "text-blue-700"
          }`}>
            {isTerminal
              ? stats.status === "completed"
                ? `Completed — ${sent.toLocaleString()} sent, ${failed.toLocaleString()} failed`
                : stats.status === "cancelled"
                  ? `Cancelled — ${sent.toLocaleString()} sent`
                  : `Failed — ${sent.toLocaleString()} sent, ${failed.toLocaleString()} failed`
              : pending === total
                ? "Preparing recipients..."
                : `Sending emails... ${processed.toLocaleString()}/${total.toLocaleString()}`
            }
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!isTerminal && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {cancelling ? (
                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <StopCircle size={14} />
              )}
              Stop
            </button>
          )}
          {isTerminal && (
            <button onClick={onDismiss} className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
              <X size={16} />
            </button>
          )}
          <span className="text-sm text-gray-500 font-mono">{pct}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            stats.status === "failed" ? "bg-red-500"
              : stats.status === "cancelled" ? "bg-orange-500"
              : isTerminal ? "bg-green-500" : "bg-blue-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Mail size={14} /> <span>{total.toLocaleString()} total</span>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle size={14} /> <span>{sent.toLocaleString()} sent</span>
        </div>
        {failed > 0 && (
          <div className="flex items-center gap-1 text-red-600">
            <XCircle size={14} /> <span>{failed.toLocaleString()} failed</span>
          </div>
        )}
        {estimatedRemainMin && (
          <div className="flex items-center gap-1 text-gray-500">
            <Clock size={14} />
            <span>~{estimatedRemainMin}m remaining</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Delivery Detail Modal Component ----
function DeliveryDetailModal({
  broadcastId,
  broadcastTitle,
  onClose,
  onRetrySuccess,
}: {
  broadcastId: string;
  broadcastTitle: string;
  onClose: () => void;
  onRetrySuccess: () => void;
}) {
  const [logs, setLogs] = useState<BroadcastEmailLog[]>([]);
  const [stats, setStats] = useState<BroadcastEmailStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const result = await getBroadcastEmailLogs(broadcastId, {
        page,
        limit: 50,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      });
      setLogs(result.logs);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setToast({ type: "error", message: "Failed to load email logs" });
    } finally {
      setLoadingLogs(false);
    }
  }, [broadcastId, page, statusFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getBroadcastEmailStats(broadcastId);
      setStats(data);
    } catch {
      // silent
    }
  }, [broadcastId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-clear toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const result = await retryBroadcastEmails(broadcastId);
      setToast({ type: "success", message: result.message });
      onRetrySuccess();
      // Refresh stats & logs after a short delay
      setTimeout(() => {
        fetchStats();
        fetchLogs();
      }, 2000);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Retry failed"
          : "Retry failed";
      setToast({ type: "error", message });
    } finally {
      setRetrying(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Mail size={20} className="text-[#006837]" />
              Email Delivery — {broadcastTitle}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
            <X size={20} />
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mx-5 mt-4 p-3 rounded-md text-sm flex items-center gap-2 ${
            toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </div>
        )}

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 pb-0">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.total.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Total</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.sent.toLocaleString()}</div>
              <div className="text-xs text-green-600 mt-1">Sent</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed.toLocaleString()}</div>
              <div className="text-xs text-red-600 mt-1">Failed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending.toLocaleString()}</div>
              <div className="text-xs text-yellow-600 mt-1">Pending</div>
            </div>
          </div>
        )}

        {/* Retry + Filter + Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-5 pb-3">
          {/* Status filter buttons */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {["all", "sent", "failed", "pending"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                  statusFilter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by email or name..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-[#006837] focus:border-[#006837]"
              />
            </div>
            <button onClick={handleSearch} className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200">
              Search
            </button>
          </div>

          {/* Retry button */}
          {stats && stats.failed > 0 && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {retrying ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <RotateCcw size={14} />
              )}
              Retry {stats.failed} failed
            </button>
          )}
        </div>

        {/* Logs table */}
        <div className="flex-1 overflow-auto px-5 pb-2">
          {loadingLogs ? (
            <div className="py-12 text-center">
              <div className="animate-spin w-6 h-6 border-3 border-[#006837] border-t-transparent rounded-full mx-auto" />
              <p className="mt-3 text-gray-500 text-sm">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No email logs found{searchQuery ? ` for "${searchQuery}"` : ""}.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="py-2 pr-3">Recipient</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Error</th>
                  <th className="py-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-3 text-gray-800 max-w-[120px] truncate">{log.userName}</td>
                    <td className="py-2.5 pr-3 text-gray-600 max-w-[200px] truncate font-mono text-xs">{log.email}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : log.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {log.status === "sent" ? <CheckCircle size={12} /> : log.status === "failed" ? <XCircle size={12} /> : <Clock size={12} />}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-red-600 text-xs max-w-[200px] truncate" title={log.errorMessage || ""}>
                      {log.errorMessage || "—"}
                    </td>
                    <td className="py-2.5 text-gray-500 text-xs whitespace-nowrap">
                      {log.sentAt ? format(new Date(log.sentAt), "MMM d, h:mm a") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 text-sm text-gray-600">
            <span>{total.toLocaleString()} results — Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ---- Status badge helper ----
function BroadcastStatusBadge({ status }: { status?: string }) {
  if (!status || status === "pending") {
    return <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">Pending</span>;
  }
  if (status === "processing") {
    return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full animate-pulse">Sending...</span>;
  }
  if (status === "completed") {
    return <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Completed</span>;
  }
  if (status === "failed") {
    return <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">Failed</span>;
  }
  if (status === "cancelled") {
    return <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">Cancelled</span>;
  }
  return <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">General Broadcast</span>;
}

// ---- Main Page Component ----
export default function AdminBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  // New: progress tracking and delivery detail
  const [activeBroadcastId, setActiveBroadcastId] = useState<string | null>(null);
  const [detailBroadcast, setDetailBroadcast] = useState<AdminBroadcast | null>(null);

  const truncateMessage = (msg: string, maxLength: number = 120) => {
    if (msg.length <= maxLength) return msg;
    return msg.substring(0, maxLength) + "...";
  };

  const toggleMessageExpansion = (broadcastId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(broadcastId)) {
      newExpanded.delete(broadcastId);
    } else {
      newExpanded.add(broadcastId);
    }
    setExpandedMessages(newExpanded);
  };

  useEffect(() => {
    const fetchBroadcasts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminBroadcasts();
        setBroadcasts(data);

        // Auto-detect any actively processing broadcast and show progress
        if (!activeBroadcastId) {
          const processing = data.find(
            (b) => b.status === "processing" || b.status === "pending"
          );
          if (processing && processing.status === "processing") {
            setActiveBroadcastId(processing._id);
          }
        }
      } catch (err) {
        setError("Failed to load broadcast messages. You might not have admin privileges.");
        console.error("Error fetching broadcasts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBroadcasts();
  }, [refreshTrigger]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const newBroadcast = await sendAdminBroadcast(title, message);
      setIsCreating(false);
      setTitle("");
      setMessage("");
      // Start tracking progress for this broadcast
      setActiveBroadcastId(newBroadcast._id);
      // Refresh list so the new broadcast appears with correct status
      handleRefresh();
    } catch (err) {
      setError("Failed to send broadcast message");
      console.error("Error sending broadcast:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (broadcast: AdminBroadcast) => {
    setEditingId(broadcast._id);
    setTitle(broadcast.title);
    setMessage(broadcast.message);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setMessage("");
  };

  const handleUpdate = async (id: string) => {
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const updatedBroadcast = await updateAdminBroadcast(id, title, message);
      setBroadcasts(broadcasts.map(broadcast =>
        broadcast._id === id ? { ...broadcast, ...updatedBroadcast } : broadcast
      ));
      setEditingId(null);
      setTitle("");
      setMessage("");
      handleRefresh();
    } catch (err) {
      setError("Failed to update broadcast message");
      console.error("Error updating broadcast:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminBroadcast(id);
      setBroadcasts(broadcasts.filter(broadcast => broadcast._id !== id));
      setShowDeleteConfirm(null);
      // Dismiss progress card if this broadcast was being tracked
      if (activeBroadcastId === id) {
        setActiveBroadcastId(null);
      }
    } catch (err) {
      setError("Failed to delete broadcast message");
      console.error("Error deleting broadcast:", err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  const handleProgressComplete = useCallback(() => {
    setActiveBroadcastId(null);
    handleRefresh();
  }, [handleRefresh]);

  const handleDismissProgress = useCallback(() => {
    setActiveBroadcastId(null);
  }, []);

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Megaphone className="text-[#006837]" /> General Broadcast Messages
          </h1>
          <p className="text-gray-600 mt-1">
            Send announcements to all users on the Obidient Movement platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#006837] text-white rounded-md hover:bg-[#005028] transition-colors"
            >
              <Plus size={18} />
              <span>New Broadcast</span>
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            title="Refresh"
            aria-label="Refresh broadcast list"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Live progress card */}
      {activeBroadcastId && (
        <BroadcastProgressCard
          broadcastId={activeBroadcastId}
          onComplete={handleProgressComplete}
          onDismiss={handleDismissProgress}
        />
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {isCreating ? "Create New Broadcast" : "Edit Broadcast"}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#006837] focus:border-[#006837] text-gray-900"
                placeholder="Announcement title"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#006837] focus:border-[#006837] text-gray-900"
                placeholder="Write your broadcast message here..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={isCreating ? () => setIsCreating(false) : handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreate : () => editingId && handleUpdate(editingId)}
                className="flex items-center gap-2 px-4 py-2 bg-[#006837] text-white rounded-md hover:bg-[#005028] transition-colors"
                disabled={submitting || !title.trim() || !message.trim()}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Processing...</span>
                  </>
                ) : isCreating ? (
                  <>
                    <Send size={18} />
                    <span>Send Broadcast</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>Update</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcasts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#006837] border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading broadcasts...</p>
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No broadcasts yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Create your first broadcast message to announce important information to all users.
            </p>
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#006837] text-white rounded-md hover:bg-[#005028] transition-colors"
              >
                <Plus size={18} />
                <span>New Broadcast</span>
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {broadcasts.map((broadcast) => (
              <li key={broadcast._id} className="p-5">
                {showDeleteConfirm === broadcast._id ? (
                  <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <p className="text-red-700 mb-3">Are you sure you want to delete this broadcast?</p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1 text-sm border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(broadcast._id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                          {broadcast.title}
                          <BroadcastStatusBadge status={broadcast.status} />
                        </h3>
                        <p className="text-gray-600 mt-2 whitespace-pre-wrap">
                          {expandedMessages.has(broadcast._id)
                            ? broadcast.message
                            : truncateMessage(broadcast.message)
                          }
                          {broadcast.message.length > 120 && (
                            <button
                              onClick={() => toggleMessageExpansion(broadcast._id)}
                              className="ml-2 text-[#006837] hover:text-[#005028] font-medium text-sm underline transition-colors"
                            >
                              {expandedMessages.has(broadcast._id) ? "Show less" : "Show more"}
                            </button>
                          )}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(broadcast.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>Sent by {broadcast.sentBy?.firstName || broadcast.sentBy?.username || 'Admin'}</span>
                          </div>
                          {(broadcast.emailsSent !== undefined && broadcast.emailsSent > 0) && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle size={14} />
                              <span>{broadcast.emailsSent.toLocaleString()} emails sent</span>
                            </div>
                          )}
                          {(broadcast.emailsFailed !== undefined && broadcast.emailsFailed > 0) && (
                            <div className="flex items-center gap-1 text-red-600">
                              <XCircle size={14} />
                              <span>{broadcast.emailsFailed.toLocaleString()} failed</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailBroadcast(broadcast)}
                          className="p-2 text-[#006837] hover:bg-green-50 rounded-md transition-colors"
                          title="View delivery details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleStartEdit(broadcast)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleConfirmDelete(broadcast._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delivery Detail Modal */}
      {detailBroadcast && (
        <DeliveryDetailModal
          broadcastId={detailBroadcast._id}
          broadcastTitle={detailBroadcast.title}
          onClose={() => setDetailBroadcast(null)}
          onRetrySuccess={() => {
            // Start tracking progress for the retry
            setActiveBroadcastId(detailBroadcast._id);
          }}
        />
      )}
    </div>
  );
}