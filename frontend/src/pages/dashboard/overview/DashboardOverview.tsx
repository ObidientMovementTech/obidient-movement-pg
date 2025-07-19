import { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  UserPlus,
  Activity,
  Eye,
  ArrowRight,
  Info,
  Vote,
  Zap,
  Sparkles,
  Target,
} from "lucide-react";
import { useUser } from "../../../context/UserContext";
import { getOwnedVotingBlocs, getJoinedVotingBlocs } from "../../../services/votingBlocService";
import Loading from "../../../components/Loader";
import ProfileCompletionModal from "../../../components/ProfileCompletionModal";
import BirthdayModal from "../../../components/BirthdayModal";
import EditProfileModal from "../../profile/EditProfileModal";

interface DashboardOverviewProps {
  setActivePage: React.Dispatch<React.SetStateAction<string>>;
}

interface VotingBloc {
  _id: string;
  name: string;
  description: string;
  targetCandidate: string;
  location: {
    state: string;
    lga: string;
    ward?: string;
  };
  metrics: {
    totalMembers: number;
    engagementScore: number;
  };
  status: string;
}

import { useNavigate } from "react-router";

export default function DashboardOverview({ setActivePage }: DashboardOverviewProps) {
  const { profile } = useUser();
  const [ownedVotingBlocs, setOwnedVotingBlocs] = useState<VotingBloc[]>([]);
  const [joinedVotingBlocs, setJoinedVotingBlocs] = useState<VotingBloc[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [birthdayModalOpen, setBirthdayModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  // Calculate profile completion using the same logic as ProfileCompletionModal
  const calculateProfileCompletion = (profile: any) => {
    if (!profile) return 0;

    // Use the same field logic as ProfileCompletionModal
    const requiredFields = [
      { key: 'userName', label: 'Username', getValue: (p: any) => p.userName || p.personalInfo?.user_name },
      { key: 'gender', label: 'Gender', getValue: (p: any) => p.gender || p.personalInfo?.gender },
      { key: 'ageRange', label: 'Age Range', getValue: (p: any) => p.ageRange || p.personalInfo?.age_range },
      { key: 'stateOfOrigin', label: 'State of Origin', getValue: (p: any) => p.stateOfOrigin || p.personalInfo?.state_of_origin },
      { key: 'votingState', label: 'Voting State', getValue: (p: any) => p.votingState || p.personalInfo?.voting_engagement_state },
      { key: 'votingLGA', label: 'Voting LGA', getValue: (p: any) => p.votingLGA || p.personalInfo?.lga },
      { key: 'votingWard', label: 'Voting Ward', getValue: (p: any) => p.votingWard || p.personalInfo?.ward },
      { key: 'citizenship', label: 'Citizenship', getValue: (p: any) => p.citizenship || p.personalInfo?.citizenship },
      { key: 'isVoter', label: 'Voter Status', getValue: (p: any) => p.isVoter || p.onboardingData?.votingBehavior?.is_registered },
      { key: 'willVote', label: 'Voting Intention', getValue: (p: any) => p.willVote || p.onboardingData?.votingBehavior?.likely_to_vote },
      { key: 'profileImage', label: 'Profile Image', getValue: (p: any) => p.profileImage }
    ];

    const completedFields = requiredFields.filter(field => {
      const value = field.getValue(profile);
      return value && value.toString().trim() !== '';
    });

    const missingFields = requiredFields.filter(field => {
      const value = field.getValue(profile);
      return !value || value.toString().trim() === '';
    });

    const completionScore = (completedFields.length / requiredFields.length) * 100;

    // Debug logging
    console.log('🔍 Profile completion calculation (frontend):', {
      completionScore: completionScore.toFixed(1),
      completedFields: completedFields.length,
      totalFields: requiredFields.length,
      missingFields: missingFields.map(f => f.label),
      fieldValues: requiredFields.map(field => ({
        key: field.key,
        value: field.getValue(profile) || 'MISSING'
      }))
    });

    return completionScore;
  };

  useEffect(() => {
    Promise.all([getOwnedVotingBlocs(), getJoinedVotingBlocs()])
      .then(([ownedData, joinedData]) => {
        setOwnedVotingBlocs(ownedData.votingBlocs || []);
        setJoinedVotingBlocs(joinedData.votingBlocs || []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  // Modal priority logic: Birthday modal first, then profile completion modal
  useEffect(() => {
    if (profile && !loading) {
      // First, check if it's birthday time and should show birthday modal
      const checkBirthdayTime = () => {
        const now = new Date();
        // Convert to West African Time
        const watTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));

        // Birthday is on July 19, 2025 - Peter Obi's birthday
        const birthday = new Date('2025-07-19T00:00:00');
        const birthdayEnd = new Date('2025-07-20T00:00:00'); // Ends at midnight on July 20

        // Convert birthday dates to WAT for comparison
        const birthdayWAT = new Date(birthday.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
        const birthdayEndWAT = new Date(birthdayEnd.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));

        const isBirthdayTime = watTime >= birthdayWAT && watTime < birthdayEndWAT;
        return isBirthdayTime;
      };

      const shouldShowBirthdayModal = checkBirthdayTime();
      const hasSeenBirthdayModal = localStorage.getItem('hasSeenBirthdayModal2025');

      if (shouldShowBirthdayModal && !hasSeenBirthdayModal) {
        // Show birthday modal first
        console.log('🎂 Showing birthday modal for Peter Obi...');
        const timer = setTimeout(() => {
          setBirthdayModalOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Check profile completion if no birthday modal
        const completionScore = calculateProfileCompletion(profile);

        // Only show modal if profile is not 100% complete
        if (completionScore < 100) {
          console.log('🔍 Profile incomplete, showing modal in 1.5 seconds...');
          // Show modal after a brief delay to let the dashboard load
          const timer = setTimeout(() => {
            setProfileModalOpen(true);
          }, 1500);
          return () => clearTimeout(timer);
        } else {
          console.log('✅ Profile is 100% complete, not showing modal');
        }
      }
    }
  }, [profile, loading]);

  // Handle birthday modal close - then check profile completion
  const handleBirthdayModalClose = () => {
    setBirthdayModalOpen(false);

    // After birthday modal closes, check if we need to show profile completion modal
    if (profile) {
      const completionScore = calculateProfileCompletion(profile);

      if (completionScore < 100) {
        console.log('🔍 Birthday modal closed, checking profile completion...');
        // Show profile modal after a brief delay
        const timer = setTimeout(() => {
          setProfileModalOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  };

  // Helper function to check if it's birthday time (for promotional section)
  const isBirthdayTime = () => {
    const now = new Date();
    const watTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
    const birthday = new Date('2025-07-19T00:00:00');
    const birthdayEnd = new Date('2025-07-20T00:00:00');
    const birthdayWAT = new Date(birthday.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
    const birthdayEndWAT = new Date(birthdayEnd.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
    return watTime >= birthdayWAT && watTime < birthdayEndWAT;
  };

  const handleBirthdayPromoClick = () => {
    window.open('https://x.com/obidientupdate/status/1946483306498761104/video/2', '_blank');
  };

  const totalMembers = ownedVotingBlocs.reduce((sum, bloc) => sum + (bloc.metrics?.totalMembers || 0), 0);
  const totalEngagement = ownedVotingBlocs.reduce((sum, bloc) => sum + (bloc.metrics?.engagementScore || 0), 0);

  const stats = [
    { label: "Joined Voting Blocs", value: joinedVotingBlocs.length, icon: Users },
    { label: "Created Voting Blocs", value: ownedVotingBlocs.length, icon: Vote },
    { label: "Total Members", value: totalMembers, icon: UserPlus },
    { label: "Avg Engagement", value: ownedVotingBlocs.length > 0 ? Math.round(totalEngagement / ownedVotingBlocs.length) : 0, icon: Activity },
    { label: "Messages Sent", value: 0, icon: MessageSquare },
    { label: "Goals Achieved", value: 0, icon: Target },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  // Define feature cards
  const featureCards = [
    {
      title: "Run for Office Hub",
      description: "Resources to help you run for political office.",
      icon: <Activity size={28} />,
      color: "bg-pink-50 text-pink-600",
      page: "Run for Office Hub",
      image: "/215971.jpg",
    },
    {
      title: "Election Monitoring",
      description: "Monitor election activities and report incidents.",
      icon: <Eye size={28} />,
      color: "bg-amber-50 text-amber-600",
      page: "Monitor",
      image: "/15997.jpg",
    },
  ];

  function handleVisitAutoVotingBloc() {
    // Find the user's auto-generated voting bloc
    const autoBloc = ownedVotingBlocs.find((bloc: any) => bloc.isAutoGenerated);
    if (autoBloc) {
      navigate(`/dashboard/manage-voting-bloc/${autoBloc._id}`);
    } else {
      alert('No auto-generated voting bloc found for your account.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-poppins space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#006837] to-[#8cc63f] p-6 md:p-8 rounded-2xl shadow-md text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center gap-6">
            <img
              src={profile?.profileImage || "/default-avatar.png"}
              alt={profile?.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white object-cover shadow-md"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Welcome back, {profile?.name.split(' ')[0]}!</h1>
              <p className="text-sm md:text-base text-white/90">
                Make a civic impact today with Obidient Movement.
              </p>
            </div>
          </div>
          <button
            className="mt-4 md:mt-0 px-4 py-2 bg-white text-[#006837] rounded-lg hover:bg-gray-100 transition shadow-sm font-medium flex items-center gap-2"
            onClick={() => setActivePage("My Profile")}
          >
            View Profile <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Birthday Celebration Promotional Section */}
      {isBirthdayTime() && (
        <div className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 p-4 md:p-5 rounded-xl shadow-lg text-white relative overflow-hidden">
          {/* Exciting background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/20 rounded-full -translate-y-10 translate-x-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-yellow-400/20 rounded-full translate-y-8 -translate-x-8 animate-pulse delay-1000"></div>

          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-700"></div>

          <div className="relative z-10">
            {/* Mobile Layout */}
            <div className="block md:hidden text-center space-y-3">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-full animate-bounce">
                  <Sparkles size={20} className="text-green-400" />
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-full animate-pulse">
                  <Target size={20} className="text-yellow-400" />
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Celebrate Peter Obi! 🎉</h2>
                <p className="text-base font-medium text-gray-200">Join the Challenge & win a dinner date with P.O!</p>
              </div>
              <button
                onClick={handleBirthdayPromoClick}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm transform hover:scale-105"
              >
                <Zap size={16} className="mr-2" />
                Learn How to Participate
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex gap-2">
                  <div className="p-3 bg-green-500/20 rounded-full animate-bounce">
                    <Sparkles size={24} className="text-green-400" />
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-full animate-pulse delay-300">
                    <Target size={24} className="text-yellow-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
                    Celebrate Peter Obi! 🎉
                  </h2>
                  <p className="text-sm lg:text-base font-medium text-gray-200">Join the Challenge & win a dinner date with P.O!</p>
                </div>
              </div>

              <button
                onClick={handleBirthdayPromoClick}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap transform hover:scale-105"
              >
                <Zap size={18} className="mr-2" />
                Learn How to Participate
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}      {/* Voting Bloc Call-to-Action Section */}
      <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="relative p-6 md:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <div className="p-2 bg-white/20 rounded-full">
                  <Vote size={24} className="text-white" />
                </div>
                <span className="text-white/90 text-sm font-medium uppercase tracking-wider">
                  Take Action Now
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                Manage Your <span className="text-[#8cc63f]">Voting Bloc</span>
                <br />
                <span className="text-lg md:text-xl lg:text-2xl font-normal text-white/90">
                  Unite voices, drive change
                </span>
              </h2>

              <p className="text-white/80 text-base md:text-lg mb-6 max-w-2xl">
                Create a powerful coalition of like-minded citizens. Organize supporters,
                coordinate campaigns, and amplify your political impact in your community.
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users size={18} />
                  </div>
                  <span className="text-sm font-medium">Build Community</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Target size={18} />
                  </div>
                  <span className="text-sm font-medium">Strategic Goals</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Zap size={18} />
                  </div>
                  <span className="text-sm font-medium">Real Impact</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleVisitAutoVotingBloc}
                  className="group bg-[#8cc63f] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#7bb12f] transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                  Visit Your Bloc Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setActivePage("Leaderboard")}
                  className="group bg-white/10 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Eye size={20} />
                  See Leaderboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Mobile Founder Motivation */}
              <div className="lg:hidden mt-8 pt-6 border-t border-white/20">
                <div className=" rounded-xl p-8">
                  <div className="flex flex-col items-center text-center gap-6">
                    <div className="relative">
                      <img
                        src="/Peter-Obi.webp"
                        alt="Peter Obi - Founder"
                        className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-white/30 shadow-xl"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#8cc63f] rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles size={14} className="text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-white text-lg md:text-xl font-semibold leading-relaxed">
                        "Build the movement,<br />unite the people"
                      </p>
                      <p className="text-white/90 text-base font-medium">
                        - Peter Obi, Founder
                      </p>
                      <p className="text-white/70 text-sm max-w-xs mx-auto">
                        Join thousands creating positive change across Nigeria
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Motivation Visual */}
            <div className="flex-shrink-0 hidden lg:block">
              <div className="relative">
                {/* Founder Image with Motivational Design */}
                <div className="w-96 h-9 rounded-3xl p-8 flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <img
                      src="/Peter-Obi.webp"
                      alt="Peter Obi - Founder"
                      className="w-56 h-56 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                    />
                    {/* Simple motivational accent */}
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#8cc63f] rounded-full flex items-center justify-center shadow-xl">
                      <Sparkles size={18} className="text-white" />
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-white text-xl font-bold leading-relaxed">
                      "Build the movement,<br />unite the people"
                    </p>
                    <p className="text-white/90 text-base font-medium">
                      - Peter Obi, Founder
                    </p>
                    <p className="text-white/70 text-sm max-w-xs">
                      Leading Nigeria's democratic transformation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlight */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Explore Features</h2>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
            <Info size={14} />
            <span>Discover what Obidient Movement offers</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition group cursor-pointer"
              onClick={() => setActivePage(feature.page)}
            >
              {feature.image && (
                <div className="w-full h-36 relative overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-2">
                  <div className={`p-2 ${feature.color} rounded-lg`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-[#006837]">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <span className="text-xs font-medium flex items-center gap-1 text-[#006837] group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Your Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#006837]/10 rounded-full">
                  <Icon className="w-4 h-4 text-[#006837]" />
                </div>
                <span className="text-sm text-gray-600">{label}</span>
              </div>
              <div className="text-xl font-bold text-gray-800">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Voting Bloc List Section */}
      <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Vote size={18} className="text-[#006837]" />
            <h2 className="text-lg font-medium text-gray-800">Your Voting Blocs</h2>
          </div>
          <button
            onClick={() => setActivePage("Create your Voting Bloc")}
            className="px-3 py-1.5 bg-[#006837] text-white rounded-lg hover:bg-[#004d2a] transition flex items-center gap-1.5 text-sm"
          >
            <Vote size={14} /> Create
          </button>
        </div>

        {ownedVotingBlocs.length === 0 && joinedVotingBlocs.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
            <Vote size={24} className="text-[#006837] mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-800">No Voting Blocs Yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4 max-w-[250px] mx-auto">Start building your political coalition by creating your first voting bloc</p>
            <button
              className="px-4 py-2 bg-[#006837] text-white rounded-lg text-sm flex items-center gap-1.5 mx-auto"
              onClick={() => setActivePage("Create your Voting Bloc")}
            >
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Owned Voting Blocs */}
            {ownedVotingBlocs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#006837] rounded-full"></div>
                  Created Blocs ({ownedVotingBlocs.length})
                </h3>
                <ul className="space-y-2">
                  {ownedVotingBlocs.map((bloc) => (
                    <li
                      key={bloc._id}
                      className="p-3 rounded-lg border border-gray-100 hover:border-[#006837]/20 hover:bg-[#006837]/5 transition cursor-pointer flex items-center"
                      onClick={handleVisitAutoVotingBloc}
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center bg-[#006837]/10 text-[#006837] font-medium">
                          {bloc.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-800 truncate">{bloc.name}</p>
                            <span className="inline-flex h-5 items-center px-2 rounded-full text-xs bg-green-100 text-green-800">
                              Creator
                            </span>
                            <span className="inline-flex h-5 items-center px-2 rounded-full text-xs bg-blue-100 text-blue-800">
                              {bloc.metrics?.totalMembers || 0} members
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            Target: {bloc.targetCandidate} • {bloc.location.lga}, {bloc.location.state}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Joined Voting Blocs */}
            {joinedVotingBlocs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Joined Blocs ({joinedVotingBlocs.length})
                </h3>
                <ul className="space-y-2">
                  {joinedVotingBlocs.map((bloc) => (
                    <li
                      key={bloc._id}
                      className="p-3 rounded-lg border border-gray-100 hover:border-blue-500/20 hover:bg-blue-50/50 transition cursor-pointer flex items-center"
                      onClick={() => setActivePage("Create your Voting Bloc")}
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 font-medium">
                          {bloc.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-800 truncate">{bloc.name}</p>
                            <span className="inline-flex h-5 items-center px-2 rounded-full text-xs bg-blue-100 text-blue-800">
                              Member
                            </span>
                            <span className="inline-flex h-5 items-center px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                              {bloc.metrics?.totalMembers || 0} members
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            Target: {bloc.targetCandidate} • {bloc.location.lga}, {bloc.location.state}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* View All Button */}
            {(ownedVotingBlocs.length > 0 || joinedVotingBlocs.length > 0) && (
              <div className="text-center">
                <button
                  onClick={handleVisitAutoVotingBloc}
                  className="text-sm text-[#006837] hover:text-[#004d2a] transition flex items-center gap-1 justify-center mx-auto"
                >
                  View Your Voting Bloc <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Birthday Modal - Shows first with priority */}
      <BirthdayModal
        isOpen={birthdayModalOpen}
        onClose={handleBirthdayModalClose}
      />

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onCompleteProfile={() => {
          setProfileModalOpen(false);
          setEditProfileModalOpen(true);
        }}
      />

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          isOpen={editProfileModalOpen}
          onClose={() => setEditProfileModalOpen(false)}
          profile={profile}
        />
      )}
    </div>
  );
}
