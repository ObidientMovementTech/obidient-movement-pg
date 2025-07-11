import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  Copy,
  CheckCircle,
  Mail,
  X,
  FileText,
  BookOpen,
  LayoutDashboard,
  ExternalLink
} from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { getVotingBlocByJoinCode, leaveVotingBloc, joinVotingBloc } from "../../../services/votingBlocService";
import { VotingBloc } from "../../../types/votingBloc";
import { useUserContext } from "../../../context/UserContext";
import Loading from "../../../components/Loader";
import Toast from "../../../components/Toast";
import TopLogo from "../../../components/TopLogo";
import AuthModal from "../../../components/AuthModal";
import DOMPurify from "dompurify";
import "./VotingBlocDetail.css";

export default function VotingBlocDetail() {
  const { joinCode } = useParams<{ joinCode: string }>();
  const navigate = useNavigate();
  const { profile, isLoading: userLoading } = useUserContext();
  const [votingBloc, setVotingBloc] = useState<VotingBloc | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (joinCode) {
      fetchVotingBloc();
    }
  }, [joinCode]);

  // Check if user should auto-join after login
  useEffect(() => {
    if (profile && votingBloc && !isMember && !isCreator) {
      const storedJoinCode = localStorage.getItem('join-voting-bloc-code');
      if (storedJoinCode && storedJoinCode === joinCode) {
        localStorage.removeItem('join-voting-bloc-code');
        handleJoinBloc();
      }
    }
  }, [profile, votingBloc]);

  // Check for pending voting bloc join after user context loads
  useEffect(() => {
    if (profile && !userLoading) {
      const pendingJoin = localStorage.getItem('pending-voting-bloc-join');
      if (pendingJoin) {
        try {
          const joinData = JSON.parse(pendingJoin);
          // Check if this is the voting bloc they wanted to join
          if (joinData.joinCode === joinCode) {
            localStorage.removeItem('pending-voting-bloc-join');
            // Auto-join them to the bloc
            handleJoinBloc();
          }
        } catch (error) {
          console.error('Error parsing pending join data:', error);
          localStorage.removeItem('pending-voting-bloc-join');
        }
      }
    }
  }, [profile, userLoading, joinCode]);

  const fetchVotingBloc = async () => {
    try {
      setLoading(true);
      const data = await getVotingBlocByJoinCode(joinCode!);

      setVotingBloc(data.votingBloc);
    } catch (error) {
      setToast({ message: "Failed to load voting bloc", type: "error" });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBloc = async () => {
    if (!votingBloc) return;

    // If user is not logged in, show auth modal
    if (!profile) {
      setAuthModalTab('login');
      setShowAuthModal(true);
      return;
    }

    try {
      setActionLoading(true);
      await joinVotingBloc(joinCode!); // Use joinCode instead of votingBloc._id
      setToast({ message: "Successfully joined the voting bloc!", type: "success" });
      // Refresh the voting bloc data
      await fetchVotingBloc();
    } catch (error) {
      setToast({ message: "Failed to join voting bloc", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleShowSignup = () => {
    setAuthModalTab('signup');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    // Refresh user context and voting bloc data
    window.location.reload(); // This will trigger the useEffect for auto-join
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setToast({ message: "URL copied to clipboard!", type: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  // const copyJoinCode = () => {
  //   if (!votingBloc) return;
  //   navigator.clipboard.writeText(votingBloc.joinCode);
  //   setToast({ message: "Join code copied to clipboard!", type: "success" });
  // };

  const handleLeave = async () => {
    if (!votingBloc) return;

    try {
      setActionLoading(true);
      await leaveVotingBloc(votingBloc._id);
      setToast({ message: "Left voting bloc successfully", type: "success" });
      navigate("/dashboard");
    } catch (error) {
      setToast({ message: "Failed to leave voting bloc", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const isCreator = votingBloc && profile && votingBloc.creator?._id === profile._id;
  const isMember = votingBloc && profile && votingBloc.members?.some(member => member._id === profile._id);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;
  if (!votingBloc) return <div className="p-6 text-center text-red-600">Voting bloc not found</div>;

  // Calculate member metrics
  const memberCount = votingBloc.members?.length || 0;
  const progress = Math.min(100, Math.round((memberCount / 1000) * 100)); // Example target of 1000 members

  return (
    <section className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className={`bg-white border-b shadow-sm ${isScrolled ? 'fixed top-0 left-0 right-0 z-50 animate-fadeIn' : ''}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between py-2 sm:py-3 md:py-4 px-3 sm:px-4">
          <TopLogo />
          {/* Navigation with auth buttons */}
          <nav className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            {userLoading ? (
              // Loading state - show skeleton
              <div className="flex gap-1.5 sm:gap-2 md:gap-3">
                <div className="w-14 sm:w-16 md:w-20 h-7 sm:h-8 md:h-9 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-14 sm:w-16 md:w-20 h-7 sm:h-8 md:h-9 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ) : profile ? (
              // Logged in - show dashboard button
              <Link
                to="/dashboard"
                className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-[#006837] hover:bg-[#00592e] text-white font-medium py-1.5 sm:py-2 px-2.5 sm:px-3 md:px-4 rounded transition-colors text-xs sm:text-sm md:text-base min-h-[32px] sm:min-h-[36px]"
              >
                <LayoutDashboard size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
                <span>Dashboard</span>
              </Link>
            ) : (
              // Not logged in - show login & register
              <>
                <Link
                  to="/auth/login"
                  className="py-1.5 sm:py-2 px-2.5 sm:px-3 md:px-4 rounded-lg border border-green-700 text-green-700 hover:bg-green-50 transition-colors text-xs sm:text-sm md:text-base min-h-[32px] sm:min-h-[36px] flex items-center"
                >
                  Login
                </Link>
                <Link
                  to="/auth/sign-up"
                  className="py-1.5 sm:py-2 px-2.5 sm:px-3 md:px-4 rounded-lg bg-green-700 hover:bg-green-800 text-white transition-colors text-xs sm:text-sm md:text-base min-h-[32px] sm:min-h-[36px] flex items-center"
                >
                  <span className="hidden sm:inline">Register</span>
                  <span className="sm:hidden">Sign Up</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Add a spacer when the header is fixed */}
      {isScrolled && <div className="h-12 sm:h-14 md:h-16"></div>}

      {/* Banner */}
      {votingBloc.bannerImageUrl && (
        <div className="w-full bg-gray-200 flex justify-center">
          <img
            src={votingBloc.bannerImageUrl}
            alt={votingBloc.name}
            className="w-full max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] object-cover object-left-bottom"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-10 font-poppins grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
        {/* Left: Details */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {/* Title & Metadata */}
          <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 leading-tight">{votingBloc.name}</h1>

          {/* Creator Info with Avatar */}
          <div className="bg-white rounded-lg border shadow-sm mb-4 sm:mb-6 p-3 sm:p-4">
            {/* First Row: Profile Image + Creator Name */}
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <div className="flex-shrink-0">
                <img
                  src={votingBloc.creator?.profileImage || '/default-avatar.png'}
                  alt={votingBloc.creator?.name || 'Creator'}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-24 lg:h-24 rounded-full object-cover border-3 border-green-200 shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-avatar.png';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm text-gray-600 block">Created by</span>
                <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-900 truncate mt-1">{votingBloc.creator?.name || "Anonymous"}</h3>
              </div>
            </div>

            {/* Second Row: Other Details */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
              <span className="font-medium text-gray-700">{votingBloc.location?.state}, {votingBloc.location?.lga}{votingBloc.location?.ward ? `, ${votingBloc.location.ward}` : ''}</span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span className="font-medium text-green-700">{votingBloc.scope || ""}</span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span>Target: <span className="font-medium text-blue-700">{votingBloc.targetCandidate}</span></span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span className="text-gray-400">{new Date(votingBloc.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Mobile CTA & Share Section - Only visible on mobile/tablet */}
          <div className="lg:hidden mb-6 space-y-4">
            {/* Mobile Join/Member Status */}
            <div className="bg-white border shadow-md rounded-lg p-4 flex flex-col items-center">
              {isMember && (
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-600 text-green-700 font-semibold text-xs sm:text-sm shadow-sm animate-fade-in">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Member
                  </span>
                </div>
              )}

              {isCreator ? (
                <button
                  onClick={() => navigate(`/dashboard/manage-voting-bloc/${votingBloc._id}`)}
                  className="w-full bg-[#006837] hover:bg-[#00592e] text-white font-semibold py-3 px-4 rounded-lg text-sm sm:text-base transition min-h-[44px]"
                >
                  Manage Your Bloc
                </button>
              ) : isMember ? (
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg text-sm sm:text-base transition disabled:opacity-50 min-h-[44px]"
                >
                  {actionLoading ? 'Leaving...' : 'Leave Bloc'}
                </button>
              ) : (
                <div className="space-y-3 w-full">
                  <button
                    className="w-full bg-[#006837] hover:bg-[#00592e] text-white font-semibold py-3 px-4 rounded-lg text-sm sm:text-base transition min-h-[44px]"
                    onClick={profile ? handleJoinBloc : () => {
                      setAuthModalTab('login');
                      setShowAuthModal(true);
                    }}
                    disabled={Boolean(actionLoading || userLoading)}
                  >
                    {actionLoading ? 'Joining...' : 'Join This Voting Bloc'}
                  </button>

                  {!profile && (
                    <div className="text-center">
                      <span className="text-xs sm:text-sm text-gray-600">Don't have an account? </span>
                      <button
                        onClick={handleShowSignup}
                        className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium underline"
                      >
                        Sign up here
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-500 mt-2 text-center px-2">
                By joining, you agree to our terms and will receive bloc updates.
              </div>
            </div>

            {/* Mobile Share Buttons */}
            <div className="bg-white border shadow-md rounded-lg p-3 sm:p-4">
              <span className="font-semibold text-gray-700 mb-3 block text-xs sm:text-sm">Share this voting bloc</span>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const title = encodeURIComponent(votingBloc.name || 'Join this voting bloc');
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, '_blank', 'width=600,height=400');
                  }}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-md hover:shadow-lg"
                  title="Share on Facebook"
                >
                  <FaFacebook size={16} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent(`Join this voting bloc: ${votingBloc.name || 'Obidient Movement bloc'}`);
                    window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
                  }}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-md hover:shadow-lg"
                  title="Send via WhatsApp"
                >
                  <IoLogoWhatsapp size={18} className="sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent(`Join this voting bloc: ${votingBloc.name || 'Obidient Movement bloc'}`);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=300');
                  }}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black hover:bg-gray-800 text-white rounded-full transition-colors shadow-md hover:shadow-lg"
                  title="Post on X"
                >
                  <X size={16} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors shadow-md hover:shadow-lg"
                  title={copied ? 'Copied!' : 'Copy link'}
                >
                  <Copy size={16} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => {
                    const subject = encodeURIComponent(votingBloc.name || 'Join this voting bloc');
                    const body = encodeURIComponent(`I thought you might be interested in this voting bloc: ${window.location.href}`);
                    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                  }}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors shadow-md hover:shadow-lg"
                  title="Send via email"
                >
                  <Mail size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Member Metrics */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center mb-2 sm:mb-3">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-green-700">
                {memberCount < 100 ? `Growing to 100 members` :
                  memberCount < 500 ? `Over 100 members, growing to 500` :
                    memberCount < 1000 ? `Over 500 members, growing to 1000` :
                      `Over 1000 members and growing`}
              </h3>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-3 sm:mb-4">
              <div
                className="bg-green-600 h-2 sm:h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Member count and engagement score */}
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
              <span className="inline-block px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full bg-green-100 text-green-800 border border-green-800 font-medium text-xs sm:text-sm md:text-base shadow-sm">
                {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
              </span>
              {votingBloc.metrics?.engagementScore && (
                <span className="inline-block px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full bg-blue-100 text-blue-800 border border-blue-800 font-medium text-xs sm:text-sm md:text-base shadow-sm">
                  {votingBloc.metrics.engagementScore}% Engagement
                </span>
              )}
              {votingBloc.toolkits?.length && votingBloc.toolkits.length > 0 && (
                <span className="inline-block px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full bg-purple-100 text-purple-800 border border-purple-800 font-medium text-xs sm:text-sm md:text-base shadow-sm">
                  {votingBloc.toolkits.length} {votingBloc.toolkits.length === 1 ? 'Resource' : 'Resources'} available
                </span>
              )}
            </div>
          </div>

          {/* Goals */}
          {votingBloc.goals && votingBloc.goals.length > 0 && (
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 md:mb-4">Our Goals</h2>
              <div className="space-y-2">
                {votingBloc.goals.map((goal, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
                    <span className="text-gray-700 text-xs sm:text-sm md:text-base">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About/Description */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-base sm:text-lg font-semibold mb-2">About This Voting Bloc</h2>
            {/* Render rich HTML if available and not empty */}
            {votingBloc.richDescription && votingBloc.richDescription.trim() &&
              votingBloc.richDescription !== '<p><br></p>' &&
              votingBloc.richDescription !== '<p></p>' ? (
              <div
                className="text-gray-700 leading-relaxed rich-content text-xs sm:text-sm md:text-base"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(votingBloc.richDescription, {
                    ADD_TAGS: ["iframe", "ul", "ol", "li", "p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6"],
                    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "width", "height", "style", "class", "href", "target"],
                    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|ftp|tel|data):|\/)/i,
                  }),
                }}
                style={{
                  fontSize: 'inherit',
                  lineHeight: '1.6'
                }}
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-line leading-relaxed text-xs sm:text-sm md:text-base">
                {votingBloc.description}
              </p>
            )}
          </div>

          {/* Toolkits & Resources */}
          {votingBloc.toolkits && votingBloc.toolkits.length > 0 && (
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 md:mb-4">Toolkits & Resources</h2>
              <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
                {votingBloc.toolkits.map((toolkit, index) => (
                  <a
                    href={toolkit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={index}
                    className="group flex items-center p-3 md:p-4 bg-green-100 border border-green-800 rounded-lg hover:shadow-md hover:bg-green-100 transition-all min-h-[44px]"
                  >
                    <div className="rounded-full bg-white p-2 md:p-3 mr-3 md:mr-4 flex-shrink-0">
                      {toolkit.type === 'Policy' ? (
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-700" />
                      ) : (
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-green-800 group-hover:text-green-900 transition-colors text-xs sm:text-sm md:text-base truncate">
                        {toolkit.label}
                      </h3>
                      <p className="text-xs md:text-sm text-green-700 flex items-center gap-1">
                        {toolkit.type}
                        <ExternalLink className="w-3 h-3 inline-block text-green-600 group-hover:text-green-800 flex-shrink-0" />
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: CTA & Sharing - Desktop Only */}
        <div className="hidden lg:flex lg:flex-col space-y-6 lg:space-y-8 order-1 lg:order-2">
          {/* Join/Member Status */}
          <div className="bg-white border shadow-md rounded-lg p-4 md:p-6 flex flex-col items-center">
            {isMember && (
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-green-50 border border-green-600 text-green-700 font-semibold text-base shadow-sm animate-fade-in">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Member
                </span>
              </div>
            )}

            {isCreator ? (
              <button
                onClick={() => navigate(`/dashboard/manage-voting-bloc/${votingBloc._id}`)}
                className="w-full bg-[#006837] hover:bg-[#00592e] text-white font-semibold py-3 px-6 rounded-lg text-base md:text-lg transition min-h-[44px]"
              >
                Manage Your Bloc
              </button>
            ) : isMember ? (
              <button
                onClick={handleLeave}
                disabled={actionLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg text-base md:text-lg transition disabled:opacity-50 min-h-[44px]"
              >
                {actionLoading ? 'Leaving...' : 'Leave Bloc'}
              </button>
            ) : (
              <div className="space-y-3 w-full">
                <button
                  className="w-full bg-[#006837] hover:bg-[#00592e] text-white font-semibold py-3 px-6 rounded-lg text-base md:text-lg transition min-h-[44px]"
                  onClick={profile ? handleJoinBloc : () => {
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  }}
                  disabled={Boolean(actionLoading || userLoading)}
                >
                  {actionLoading ? 'Joining...' : 'Join This Voting Bloc'}
                </button>

                {!profile && (
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Don't have an account? </span>
                    <button
                      onClick={handleShowSignup}
                      className="text-sm text-green-600 hover:text-green-700 font-medium underline"
                    >
                      Sign up here
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 mt-2 text-center px-2">
              By joining, you agree to our terms and will receive bloc updates.
            </div>
          </div>

          {/* Share Buttons */}
          <div className="bg-white border shadow-md rounded-lg p-4">
            <span className="font-semibold text-gray-700 mb-3 block text-base">Share this voting bloc</span>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const title = encodeURIComponent(votingBloc.name || 'Join this voting bloc');
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, '_blank', 'width=600,height=400');
                }}
                className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-md hover:shadow-lg"
                title="Share on Facebook"
              >
                <FaFacebook size={20} />
              </button>
              <button
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const text = encodeURIComponent(`Join this voting bloc: ${votingBloc.name || 'Obidient Movement bloc'}`);
                  window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
                }}
                className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-md hover:shadow-lg"
                title="Send via WhatsApp"
              >
                <IoLogoWhatsapp size={22} />
              </button>
              <button
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const text = encodeURIComponent(`Join this voting bloc: ${votingBloc.name || 'Obidient Movement bloc'}`);
                  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=300');
                }}
                className="flex items-center justify-center w-12 h-12 bg-black hover:bg-gray-800 text-white rounded-full transition-colors shadow-md hover:shadow-lg"
                title="Post on X"
              >
                <X size={20} />
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors shadow-md hover:shadow-lg"
                title={copied ? 'Copied!' : 'Copy link'}
              >
                <Copy size={20} />
              </button>
              <button
                onClick={() => {
                  const subject = encodeURIComponent(votingBloc.name || 'Join this voting bloc');
                  const body = encodeURIComponent(`I thought you might be interested in this voting bloc: ${window.location.href}`);
                  window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                }}
                className="flex items-center justify-center w-12 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors shadow-md hover:shadow-lg"
                title="Send via email"
              >
                <Mail size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        initialTab={authModalTab}
        joinCode={joinCode}
        votingBlocName={votingBloc?.name}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}
