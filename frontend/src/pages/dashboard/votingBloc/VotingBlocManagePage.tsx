import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Users,
  MapPin,
  Target,
  Share2,
  UserPlus,
  ExternalLink,
  Crown,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  ArrowLeft,
  Eye,
  BarChart3,
  UserCheck,
  Send,
  MessageSquare,
  UserMinus,
  Mail,
  RotateCcw,
  Search,
  Tag
} from "lucide-react";
import {
  getVotingBlocById,
  deleteVotingBloc,
  getMemberEngagement,
  getVotingBlocInvitations,
  sendMemberInvitation,
  sendBroadcastMessage,
  removeMember,
  sendPrivateMessage,
  resendInvitation,
  getMemberMetadata,
  updateMemberTags,
  clearRespondedInvitations
} from "../../../services/votingBlocService";
import { VotingBloc, InviteMemberForm, BroadcastMessageForm, VotingBlocAnalytics, VotingBlocInvitation } from "../../../types/votingBloc";
import { useUserContext } from "../../../context/UserContext";
import Loading from "../../../components/Loader";
import Toast from "../../../components/Toast";
import InviteMemberModal from "../../../components/modals/InviteMemberModal";
import BroadcastMessageModal from "../../../components/modals/BroadcastMessageModal";
import PrivateMessageModal from "../../../components/modals/PrivateMessageModal";

export default function VotingBlocManagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useUserContext();
  const [votingBloc, setVotingBloc] = useState<VotingBloc | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'analytics'>('overview');

  // New states for member management
  const [invitations, setInvitations] = useState<VotingBlocInvitation[]>([]);
  const [engagement, setEngagement] = useState<VotingBlocAnalytics | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showPrivateMessageModal, setShowPrivateMessageModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removalReason, setRemovalReason] = useState('');

  // Loading states for each action
  const [inviteLoading, setInviteLoading] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [privateMessageLoading, setPrivateMessageLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState<string | null>(null);

  // Member management states
  const [membersWithMetadata, setMembersWithMetadata] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');
  const [contactFilter, setContactFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [engagementFilter, setEngagementFilter] = useState<string>('all');
  const [editingMember, setEditingMember] = useState<any>(null);
  const [showMemberTagModal, setShowMemberTagModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVotingBloc();
    }
  }, [id]);

  const fetchVotingBloc = async () => {
    try {
      setLoading(true);
      const data = await getVotingBlocById(id!);
      const bloc = data.votingBloc;

      // Check if user is the creator
      if (bloc.creator._id !== profile?._id) {
        setToast({ message: "You can only manage your own voting blocs", type: "error" });
        navigate("/dashboard?tab=VotingBloc");
        return;
      }

      setVotingBloc(bloc);

      // Load additional data for management
      await Promise.all([
        fetchInvitations(),
        fetchEngagement(),
        fetchMemberMetadata()
      ]);
    } catch (error) {
      setToast({ message: "Failed to load voting bloc", type: "error" });
      navigate("/dashboard?tab=VotingBloc");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const data = await getVotingBlocInvitations(id!);
      setInvitations(Array.isArray(data.invitations) ? data.invitations : []);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      setInvitations([]); // Set empty array on error
    }
  };

  const fetchEngagement = async () => {
    try {
      const data = await getMemberEngagement(id!);
      setEngagement(data.engagement);
    } catch (error) {
      console.error('Failed to fetch engagement data:', error);
    }
  };

  const fetchMemberMetadata = async () => {
    try {
      const data = await getMemberMetadata(id!);
      setMembersWithMetadata(data.members);
    } catch (error) {
      console.error('Failed to fetch member metadata:', error);
      // Fallback to using basic member data
      setMembersWithMetadata(votingBloc?.members || []);
    }
  };

  const handleInviteMember = async (inviteData: InviteMemberForm) => {
    try {
      setInviteLoading(true);
      await sendMemberInvitation(id!, inviteData);
      setToast({ message: "Invitation sent successfully!", type: "success" });
      setShowInviteModal(false);
      await fetchInvitations(); // Refresh invitations
    } catch (error) {
      setToast({ message: "Failed to send invitation", type: "error" });
      throw error; // Re-throw to let modal handle loading state
    } finally {
      setInviteLoading(false);
    }
  };

  const handleBroadcastMessage = async (messageData: BroadcastMessageForm) => {
    try {
      setBroadcastLoading(true);
      await sendBroadcastMessage(id!, messageData);
      setToast({ message: "Message sent successfully!", type: "success" });
      setShowBroadcastModal(false);
    } catch (error) {
      setToast({ message: "Failed to send message", type: "error" });
      throw error; // Re-throw to let modal handle loading state
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!removalReason.trim()) {
      setToast({ message: "Please provide a reason for removal", type: "error" });
      return;
    }

    try {
      setActionLoading(true);
      await removeMember(id!, memberId, removalReason.trim());
      setToast({ message: "Member removed successfully", type: "success" });
      setShowRemoveConfirm(false);
      setSelectedMember(null);
      setRemovalReason('');
      await fetchVotingBloc(); // Refresh the voting bloc data
    } catch (error) {
      setToast({ message: "Failed to remove member", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendPrivateMessage = async (memberId: string, message: string) => {
    try {
      setPrivateMessageLoading(true);
      await sendPrivateMessage(id!, memberId, message);
      setToast({ message: "Private message sent successfully!", type: "success" });
      setShowPrivateMessageModal(false);
      setSelectedMember(null);
    } catch (error) {
      setToast({ message: "Failed to send private message", type: "error" });
      throw error; // Re-throw to let modal handle loading state
    } finally {
      setPrivateMessageLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      setResendLoading(invitationId);
      await resendInvitation(id!, invitationId);
      setToast({ message: "Invitation resent successfully!", type: "success" });
      await fetchInvitations(); // Refresh invitations
    } catch (error) {
      setToast({ message: "Failed to resend invitation", type: "error" });
    } finally {
      setResendLoading(null);
    }
  };

  const handleUpdateMemberTags = async (memberId: string, tags: {
    decisionTag?: 'Undecided' | 'Not-interested' | 'Committed' | 'Voted';
    contactTag?: 'No Response' | 'Messaged recently' | 'Called recently' | 'Not Reachable';
    notes?: string;
    engagementLevel?: 'Low' | 'Medium' | 'High';
  }) => {
    try {
      await updateMemberTags(id!, memberId, tags);
      setToast({ message: "Member tags updated successfully!", type: "success" });
      await fetchMemberMetadata(); // Refresh member data
      setShowMemberTagModal(false);
      setEditingMember(null);
    } catch (error) {
      setToast({ message: "Failed to update member tags", type: "error" });
    }
  };

  // Filter members based on search and filters
  const filteredMembers = membersWithMetadata.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDecision = decisionFilter === 'all' || member.metadata?.decisionTag === decisionFilter;
    const matchesContact = contactFilter === 'all' || member.metadata?.contactTag === contactFilter;
    const matchesEngagement = engagementFilter === 'all' || member.metadata?.engagementLevel === engagementFilter;

    const matchesLocation = locationFilter === 'all' ||
      member.metadata?.location?.state?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      member.metadata?.location?.lga?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      member.personalInfo?.currentLocation?.state?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      member.personalInfo?.currentLocation?.lga?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesDecision && matchesContact && matchesEngagement && matchesLocation;
  });

  const copyBlocLink = () => {
    if (votingBloc) {
      const blocLink = `${window.location.origin}/voting-bloc/${votingBloc.joinCode}`;
      navigator.clipboard.writeText(blocLink);
      setToast({ message: "Voting bloc link copied to clipboard!", type: "success" });
    }
  };

  const shareVotingBloc = () => {
    setShowShareModal(true);
  }; const shareToSocialMedia = (platform: string) => {
    if (!votingBloc) return;

    const shareUrl = `${window.location.origin}/voting-bloc/${votingBloc.joinCode}`;
    const shareText = `Join my voting bloc "${votingBloc.name}" to support ${votingBloc.targetCandidate}! Together we can make a difference in ${votingBloc.location.state}.`;

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    let shareLink = '';

    switch (platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        setToast({ message: "Share link and message copied to clipboard!", type: "success" });
        return;
      default:
        return;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'noopener,noreferrer');
    }
  };

  const openWhatsAppChat = (phoneNumber: string) => {
    if (!phoneNumber) {
      setToast({ message: "No phone number available for this member", type: "error" });
      return;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleClearInvitationHistory = async () => {
    if (!votingBloc?._id) return;

    try {
      setActionLoading(true);
      await clearRespondedInvitations(votingBloc._id);

      // Refresh invitations after clearing history
      const updatedInvitations = await getVotingBlocInvitations(votingBloc._id);
      setInvitations(Array.isArray(updatedInvitations) ? updatedInvitations : []);

      setToast({ message: "Invitation history cleared successfully!", type: "success" });
    } catch (error) {
      console.error("Error clearing invitation history:", error);
      setToast({ message: "Failed to clear invitation history", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!votingBloc) return;

    // Prevent deletion of auto-generated voting blocs
    if (votingBloc.isAutoGenerated) {
      setToast({ message: "Auto-generated voting blocs cannot be deleted", type: "error" });
      setShowDeleteConfirm(false);
      return;
    }

    try {
      setActionLoading(true);
      await deleteVotingBloc(votingBloc._id);
      setToast({ message: "Voting bloc deleted successfully", type: "success" });
      navigate("/dashboard");
      sessionStorage.setItem("dashboardPage", "Create your Voting Bloc");
    } catch (error) {
      setToast({ message: "Failed to delete voting bloc", type: "error" });
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
    sessionStorage.setItem("dashboardPage", "Create your Voting Bloc");
  };

  if (loading) return <Loading />;

  if (!votingBloc) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Voting Bloc Not Found</h2>
          <p className="text-gray-600 mb-4">The voting bloc you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={handleBack}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Back to Voting Bloc
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 sm:mb-6"
      >
        <ArrowLeft size={20} />
        <span className="hidden sm:inline">Back to Voting Bloc</span>
        <span className="sm:hidden">Back</span>
      </button>

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 sm:mb-8">
        {/* Banner Image */}
        {votingBloc.bannerImageUrl && (
          <div className="h-48 sm:h-48 bg-gray-200 overflow-hidden">
            <img
              src={votingBloc.bannerImageUrl}
              alt={votingBloc.name}
              className="w-full h-full object-cover object-left-bottom"
            />
          </div>
        )}

        <div className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:space-y-0 lg:gap-6">
            {/* Main Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                  {votingBloc.name}
                </h1>
                <div className="flex flex-col items-center gap-2 self-start">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    Creator
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4 text-sm sm:text-base">{votingBloc.description}</p>

              {votingBloc.isAutoGenerated && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                    <div>
                      <p className="text-blue-800 text-sm font-medium">Auto-Generated Voting Bloc</p>
                      <p className="text-blue-700 text-xs mt-1">
                        This voting bloc was automatically created based on your registration.
                        Settings are managed by admin and cannot be edited or deleted.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Target size={16} />
                  <span className="text-xs sm:text-sm break-words">Target: {votingBloc.targetCandidate}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-xs sm:text-sm break-words">
                    {votingBloc.location.ward && `${votingBloc.location.ward}, `}
                    {votingBloc.location.lga}, {votingBloc.location.state}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} />
                  <span className="text-xs sm:text-sm">{votingBloc.metrics.totalMembers} members</span>
                </div>
              </div>
              {/* Share Button - Large CTA */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={shareVotingBloc}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-base sm:text-lg"
                >
                  <Share2 size={20} />
                  Share to Invite Members
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 lg:w-48">
              <button
                onClick={() => navigate(`/voting-bloc/${votingBloc.joinCode}`)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Eye size={16} />
                <span className="hidden sm:inline">View Public Page</span>
                <span className="sm:hidden">View</span>
              </button>

              <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-100 rounded-lg">
                <span className="text-xs sm:text-sm text-gray-600 flex-1 break-all">
                  Share Link
                </span>
                <button
                  onClick={copyBlocLink}
                  className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                  title="Copy bloc link"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                <button
                  onClick={() => navigate(`/dashboard/edit-voting-bloc/${votingBloc._id}`)}
                  disabled={votingBloc.isAutoGenerated}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm rounded-lg border transition-colors ${votingBloc.isAutoGenerated
                    ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  title={votingBloc.isAutoGenerated ? 'Auto-generated voting blocs cannot be edited' : 'Edit voting bloc details'}
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline">Edit Details</span>
                  <span className="sm:hidden">Edit</span>
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={votingBloc.isAutoGenerated}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm rounded-lg border transition-colors ${votingBloc.isAutoGenerated
                    ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'text-red-600 border-red-300 hover:bg-red-50'
                    }`}
                  title={votingBloc.isAutoGenerated ? 'Auto-generated voting blocs cannot be deleted' : 'Delete voting bloc'}
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Delete Bloc</span>
                  <span className="sm:hidden">Delete</span>
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 sm:mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 sm:py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">{votingBloc.metrics.totalMembers}</div>
                  <div className="text-xs sm:text-sm text-blue-600">Total Members</div>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">{votingBloc.metrics.engagementScore}</div>
                  <div className="text-xs sm:text-sm text-green-600">Engagement Score</div>
                </div>
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-purple-600">{votingBloc.goals.length}</div>
                  <div className="text-xs sm:text-sm text-purple-600">Active Goals</div>
                </div>
                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-orange-600">{votingBloc.toolkits.length}</div>
                  <div className="text-xs sm:text-sm text-orange-600">Resources</div>
                </div>
              </div>

              {/* Goals */}
              {votingBloc.goals.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Current Goals</h3>
                  <div className="space-y-2">
                    {votingBloc.goals.map((goal, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                        <span className="text-sm sm:text-base text-gray-700 break-words">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Toolkits */}
              {votingBloc.toolkits.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Resources & Toolkits</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {votingBloc.toolkits.map((toolkit, index) => (
                      <div key={index} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm sm:text-base break-words">{toolkit.label}</div>
                            <div className="text-xs sm:text-sm text-gray-500">{toolkit.type}</div>
                          </div>
                          <a
                            href={toolkit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 flex-shrink-0 ml-2"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Members ({votingBloc.members.length})
                </h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowBroadcastModal(true)}
                    disabled={broadcastLoading || inviteLoading || privateMessageLoading}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Send size={16} />
                    <span className="hidden sm:inline">Broadcast Message</span>
                    <span className="sm:hidden">Broadcast</span>
                  </button>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    disabled={broadcastLoading || inviteLoading || privateMessageLoading}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <UserPlus size={16} />
                    <span className="hidden sm:inline">Invite Members</span>
                    <span className="sm:hidden">Invite</span>
                  </button>
                </div>
              </div>

              {/* Pending Invitations */}
              {Array.isArray(invitations) && invitations.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3">
                    Pending Invitations ({invitations.filter(inv => inv.status === 'pending').length})
                  </h4>
                  <div className="space-y-2">
                    {invitations.filter(inv => inv.status === 'pending').map((invitation) => (
                      <div key={invitation._id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail size={12} className="sm:w-4 sm:h-4 text-yellow-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm sm:text-base break-all">
                            {invitation.invitedEmail || invitation.email || invitation.phone || invitation.invitedUser?.email || 'Unknown contact'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            Invited via {invitation.inviteType} • {new Date(invitation.inviteDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Pending
                          </span>
                          {invitation.inviteType === 'email' && (
                            <button
                              onClick={() => handleResendInvitation(invitation._id)}
                              disabled={resendLoading === invitation._id || actionLoading}
                              className="p-1 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Resend Invitation"
                            >
                              {resendLoading === invitation._id ? (
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <RotateCcw size={14} className="sm:w-4 sm:h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Responded Invitations */}
              {Array.isArray(invitations) && invitations.filter(inv => inv.status !== 'pending').length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h4 className="text-sm sm:text-base font-medium text-gray-900">
                      Invitation History ({invitations.filter(inv => inv.status !== 'pending').length})
                    </h4>
                    <button
                      onClick={() => handleClearInvitationHistory()}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                      Clear History
                    </button>
                  </div>
                  <div className="space-y-2">
                    {invitations.filter(inv => inv.status !== 'pending').map((invitation) => (
                      <div key={invitation._id} className={`flex items-center gap-3 p-3 rounded-lg border ${invitation.status === 'accepted'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                        }`}>
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${invitation.status === 'accepted'
                          ? 'bg-green-300'
                          : 'bg-red-300'
                          }`}>
                          <Mail size={12} className={`sm:w-4 sm:h-4 ${invitation.status === 'accepted' ? 'text-green-700' : 'text-red-700'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm sm:text-base break-all">
                            {invitation.invitedEmail || invitation.email || invitation.phone || invitation.invitedUser?.email || 'Unknown contact'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            Invited via {invitation.inviteType} • {new Date(invitation.inviteDate).toLocaleDateString()}
                            {invitation.responseDate && (
                              <span> • Responded {new Date(invitation.responseDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-1 text-xs rounded-full ${invitation.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Members */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900">Current Members</h4>
                  <div className="text-xs sm:text-sm text-gray-500">
                    Showing {filteredMembers.length} of {membersWithMetadata.length} members
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-4 space-y-3 sm:space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search members by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <select
                      value={decisionFilter}
                      onChange={(e) => setDecisionFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Decisions</option>
                      <option value="Undecided">Undecided</option>
                      <option value="Not-interested">Not Interested</option>
                      <option value="Committed">Committed</option>
                      <option value="Voted">Voted</option>
                    </select>

                    <select
                      value={contactFilter}
                      onChange={(e) => setContactFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Contact Status</option>
                      <option value="No Response">No Response</option>
                      <option value="Messaged recently">Messaged Recently</option>
                      <option value="Called recently">Called Recently</option>
                      <option value="Not Reachable">Not Reachable</option>
                    </select>

                    <select
                      value={engagementFilter}
                      onChange={(e) => setEngagementFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Engagement</option>
                      <option value="Low">Low Engagement</option>
                      <option value="Medium">Medium Engagement</option>
                      <option value="High">High Engagement</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Filter by location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-3">
                  {filteredMembers.map((member) => (
                    <div key={member._id} className="flex items-start gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users size={16} className="sm:w-5 sm:h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="font-medium text-gray-900 text-sm sm:text-base break-words">
                            {member.name || 'Unknown User'}
                          </div>
                          {member._id === votingBloc?.creator._id && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex-shrink-0">
                              <Crown size={8} className="sm:w-2.5 sm:h-2.5" />
                              Creator
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 mb-2 break-all">
                          {member.email || 'No email provided'}
                        </div>

                        {/* Phone Number */}
                        {member.phone && (
                          <div className="mb-2">
                            <span className="text-xs sm:text-sm text-gray-500 break-all">
                              {member.phone}
                            </span>
                          </div>
                        )}

                        {/* Member Tags */}
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${member.metadata?.decisionTag === 'Voted' ? 'bg-green-100 text-green-800' :
                            member.metadata?.decisionTag === 'Committed' ? 'bg-blue-100 text-blue-800' :
                              member.metadata?.decisionTag === 'Not-interested' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {member.metadata?.decisionTag || 'Undecided'}
                          </span>

                          <span className={`px-2 py-1 text-xs rounded-full ${member.metadata?.contactTag === 'Messaged recently' || member.metadata?.contactTag === 'Called recently'
                            ? 'bg-green-100 text-green-800' :
                            member.metadata?.contactTag === 'Not Reachable' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {member.metadata?.contactTag || 'No Response'}
                          </span>

                          <span className={`px-2 py-1 text-xs rounded-full ${member.metadata?.engagementLevel === 'High' ? 'bg-green-100 text-green-800' :
                            member.metadata?.engagementLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {member.metadata?.engagementLevel || 'Medium'}
                          </span>
                        </div>

                        {member.metadata?.joinDate && (
                          <div className="text-xs text-gray-500 mb-1">
                            Joined {new Date(member.metadata.joinDate).toLocaleDateString()}
                          </div>
                        )}

                        {member.metadata?.notes && (
                          <div className="text-xs sm:text-sm text-gray-600 italic break-words">
                            "{member.metadata.notes}"
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-shrink-0">
                        {member._id !== votingBloc?.creator._id && (
                          <>
                            <button
                              onClick={() => {
                                setEditingMember(member);
                                setShowMemberTagModal(true);
                              }}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="Edit Member Tags"
                            >
                              <Tag size={14} className="sm:w-4 sm:h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setShowPrivateMessageModal(true);
                              }}
                              disabled={broadcastLoading || inviteLoading || privateMessageLoading}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Send Private Message"
                            >
                              <MessageSquare size={14} className="sm:w-4 sm:h-4" />
                            </button>

                            {member.phone && (
                              <button
                                onClick={() => openWhatsAppChat(member.phone)}
                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                                title="Chat on WhatsApp"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488" />
                                </svg>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setShowRemoveConfirm(true);
                              }}
                              disabled={broadcastLoading || inviteLoading || privateMessageLoading || actionLoading}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remove Member"
                            >
                              <UserMinus size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </>
                        )}
                        <UserCheck className="text-green-500" size={14} />
                      </div>
                    </div>
                  ))}

                  {filteredMembers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users size={36} className="sm:w-12 sm:h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm sm:text-base">No members found matching your criteria.</p>
                      {(searchQuery || decisionFilter !== 'all' || contactFilter !== 'all' || locationFilter !== 'all' || engagementFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setDecisionFilter('all');
                            setContactFilter('all');
                            setLocationFilter('all');
                            setEngagementFilter('all');
                          }}
                          className="mt-2 text-green-600 hover:text-green-700 text-sm"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Analytics & Insights</h3>

              {engagement ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Engagement Overview */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-blue-600">
                        {engagement.totalMembers || 0}
                      </div>
                      <div className="text-xs sm:text-sm text-blue-600">Total Members</div>
                    </div>
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-green-600">
                        {engagement.recentMembers || 0}
                      </div>
                      <div className="text-xs sm:text-sm text-green-600">Recent Members</div>
                    </div>
                    <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-purple-600">
                        {engagement.pendingInvitations || 0}
                      </div>
                      <div className="text-xs sm:text-sm text-purple-600">Pending Invitations</div>
                    </div>
                    <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-orange-600">
                        {engagement.conversionRate && engagement.conversionRate !== 'NaN'
                          ? `${parseFloat(engagement.conversionRate).toFixed(1)}%`
                          : '0%'}
                      </div>
                      <div className="text-xs sm:text-sm text-orange-600">Conversion Rate</div>
                    </div>
                  </div>

                  {/* Invitation Stats */}
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Invitation Overview</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                        <div className="text-base sm:text-lg font-semibold text-gray-900">
                          {(engagement.pendingInvitations || 0) + (engagement.acceptedInvitations || 0) + (engagement.declinedInvitations || 0)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Sent</div>
                      </div>
                      <div className="p-3 sm:p-4 border border-green-200 bg-green-50 rounded-lg">
                        <div className="text-base sm:text-lg font-semibold text-green-600">
                          {engagement.acceptedInvitations || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-green-600">Accepted</div>
                      </div>
                      <div className="p-3 sm:p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <div className="text-base sm:text-lg font-semibold text-yellow-600">
                          {engagement.pendingInvitations || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-yellow-600">Pending</div>
                      </div>
                      <div className="p-3 sm:p-4 border border-red-200 bg-red-50 rounded-lg">
                        <div className="text-base sm:text-lg font-semibold text-red-600">
                          {engagement.declinedInvitations || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-red-600">Declined</div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Performance Metrics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                        <div className="text-base sm:text-lg font-semibold text-blue-600">
                          {engagement.conversionRate && engagement.conversionRate !== 'NaN'
                            ? `${parseFloat(engagement.conversionRate).toFixed(1)}%`
                            : 'N/A'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Conversion Rate</div>
                        <div className="text-xs text-gray-500 mt-1">Accepted / Total Invitations</div>
                      </div>
                      <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                        <div className="text-base sm:text-lg font-semibold text-green-600">
                          {engagement.totalMembers || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Current Members</div>
                        <div className="text-xs text-gray-500 mt-1">Active voting bloc size</div>
                      </div>
                      <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                        <div className="text-base sm:text-lg font-semibold text-purple-600">
                          {engagement.recentMembers || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">New This Month</div>
                        <div className="text-xs text-gray-500 mt-1">Recent member additions</div>
                      </div>
                      <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                        <div className={`text-base sm:text-lg font-semibold ${engagement.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {engagement.growthRate >= 0 ? '+' : ''}{engagement.growthRate || 0}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Growth Rate</div>
                        <div className="text-xs text-gray-500 mt-1">Member growth trend</div>
                      </div>
                    </div>
                  </div>

                  {/* Member List Summary */}
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Member Summary</h4>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="text-center sm:text-left">
                          <div className="text-xs sm:text-sm text-gray-600">Total Members</div>
                          <div className="text-lg sm:text-xl font-semibold text-gray-900">
                            {engagement.totalMembers || 0}
                          </div>
                        </div>
                        <div className="text-center sm:text-left">
                          <div className="text-xs sm:text-sm text-gray-600">Recent Growth</div>
                          <div className="text-lg sm:text-xl font-semibold text-green-600">
                            +{engagement.recentMembers || 0}
                          </div>
                        </div>
                        <div className="text-center sm:text-left">
                          <div className="text-xs sm:text-sm text-gray-600">Growth Rate</div>
                          <div className={`text-lg sm:text-xl font-semibold ${engagement.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {engagement.growthRate >= 0 ? '+' : ''}{engagement.growthRate || 0}%
                          </div>
                        </div>
                      </div>

                      {engagement.totalMembers > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-xs sm:text-sm text-gray-600 mb-2">Invitation Success Rate</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${engagement.conversionRate && engagement.conversionRate !== 'NaN'
                                    ? Math.min(100, Math.max(0, parseFloat(engagement.conversionRate)))
                                    : 0}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">
                              {engagement.conversionRate && engagement.conversionRate !== 'NaN'
                                ? `${parseFloat(engagement.conversionRate).toFixed(1)}%`
                                : '0%'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <BarChart3 size={36} className="sm:w-12 sm:h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm sm:text-base">Loading analytics data...</p>
                  <p className="text-xs sm:text-sm">Member engagement and communication insights will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Share Voting Bloc</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Card */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                {votingBloc.bannerImageUrl ? (
                  <img
                    src={votingBloc.bannerImageUrl}
                    alt={votingBloc.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <Users className="text-white" size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{votingBloc.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">Supporting {votingBloc.targetCandidate}</p>
                  <p className="text-xs text-gray-500">{votingBloc.location.state} • {votingBloc.metrics.totalMembers} members</p>
                </div>
              </div>
            </div>

            {/* Share Message Preview */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Share message:</strong> "Join my voting bloc '{votingBloc.name}' to support {votingBloc.targetCandidate}! Together we can make a difference in {votingBloc.location.state}."
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Share on social media</h4>
              <div className="grid grid-cols-3 gap-4">
                {/* WhatsApp */}
                <button
                  onClick={() => shareToSocialMedia('whatsapp')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-600">WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => shareToSocialMedia('facebook')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-600">Facebook</span>
                </button>

                {/* Twitter/X */}
                <button
                  onClick={() => shareToSocialMedia('twitter')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-600">X (Twitter)</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => shareToSocialMedia('linkedin')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-600">LinkedIn</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => shareToSocialMedia('telegram')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-600">Telegram</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={() => shareToSocialMedia('copy')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <Copy className="text-white" size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Copy Link</span>
                </button>
              </div>
            </div>

            {/* Direct Link */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direct invitation link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/voting-bloc/${votingBloc.joinCode}`}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/voting-bloc/${votingBloc.joinCode}`);
                    setToast({ message: "Link copied to clipboard!", type: "success" });
                  }}
                  className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 mx-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Delete Voting Bloc</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Are you sure you want to delete this voting bloc? This action cannot be undone and will remove all members and data.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm sm:text-base"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {showRemoveConfirm && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Confirm Member Removal
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Are you sure you want to remove <strong>{selectedMember.name}</strong> from this voting bloc?
              They will no longer have access to the bloc and its resources.
            </p>

            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for removal <span className="text-red-500">*</span>
              </label>
              <textarea
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder="Please provide a reason for removing this member..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                rows={3}
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {removalReason.length}/500
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 sm:mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-amber-800">
                    <strong>Important:</strong> The member will receive both an in-app notification and an email explaining their removal, including the reason you provide.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setShowRemoveConfirm(false);
                  setSelectedMember(null);
                  setRemovalReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(selectedMember._id)}
                disabled={actionLoading || !removalReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {actionLoading ? "Removing..." : "Remove Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => !inviteLoading && setShowInviteModal(false)}
        onInvite={handleInviteMember}
        loading={inviteLoading}
      />

      {/* Broadcast Message Modal */}
      <BroadcastMessageModal
        isOpen={showBroadcastModal}
        onClose={() => !broadcastLoading && setShowBroadcastModal(false)}
        onSend={handleBroadcastMessage}
        memberCount={votingBloc?.members.length || 0}
        loading={broadcastLoading}
      />

      {/* Private Message Modal */}
      <PrivateMessageModal
        isOpen={showPrivateMessageModal}
        onClose={() => {
          if (!privateMessageLoading) {
            setShowPrivateMessageModal(false);
            setSelectedMember(null);
          }
        }}
        member={selectedMember}
        onSend={handleSendPrivateMessage}
        loading={privateMessageLoading}
      />

      {/* Member Tag Modal */}
      {showMemberTagModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Update Member Tags - {editingMember.name}
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleUpdateMemberTags(editingMember._id, {
                decisionTag: formData.get('decisionTag') as 'Undecided' | 'Not-interested' | 'Committed' | 'Voted',
                contactTag: formData.get('contactTag') as 'No Response' | 'Messaged recently' | 'Called recently' | 'Not Reachable',
                engagementLevel: formData.get('engagementLevel') as 'Low' | 'Medium' | 'High',
                notes: formData.get('notes') as string,
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decision Tag
                </label>
                <select
                  name="decisionTag"
                  defaultValue={editingMember.metadata?.decisionTag || 'Undecided'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="Undecided">Undecided</option>
                  <option value="Not-interested">Not Interested</option>
                  <option value="Committed">Committed</option>
                  <option value="Voted">Voted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Tag
                </label>
                <select
                  name="contactTag"
                  defaultValue={editingMember.metadata?.contactTag || 'No Response'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="No Response">No Response</option>
                  <option value="Messaged recently">Messaged Recently</option>
                  <option value="Called recently">Called Recently</option>
                  <option value="Not Reachable">Not Reachable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engagement Level
                </label>
                <select
                  name="engagementLevel"
                  defaultValue={editingMember.metadata?.engagementLevel || 'Medium'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  defaultValue={editingMember.metadata?.notes || ''}
                  placeholder="Add notes about this member..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMemberTagModal(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
                >
                  Update Tags
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
