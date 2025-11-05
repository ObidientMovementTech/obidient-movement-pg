import { useState, useEffect, lazy, Suspense, type ReactNode } from "react";
import {
  Home,
  BookOpen,
  BarChart3,
  Eye,
  Megaphone,
  Flag,
  User,
  Users,
  Activity,
  X,
  ChevronDown,
  ChevronUp,
  ScanLine,
  Landmark,
  ShieldCheck,
  UserCheck,
  Bell,
  RefreshCw,
  MapPin,
  Smartphone,
  Phone,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import TopLogo from "../../components/TopLogo";
import Loading from "../../components/Loader";
import { useUser } from "../../context/UserContext";
import UserProfileCard from "../../components/UserProfileCard";

import { getOwnedVotingBlocs } from "../../services/votingBlocService";
import DashboardHeader from "./components/DashboardHeader";
import { useNavigate } from "react-router";

const DashboardOverview = lazy(() => import("./overview/DashboardOverview"));
const LeaderboardPage = lazy(() => import("./votingBloc/LeaderboardPage"));
const RunForOffice = lazy(() => import("./lead/RunForOffice"));
const ProfilePage = lazy(() => import("../profile/ProfilePage"));
const Vote = lazy(() => import("./elections/Vote"));
const CitizensOrganizingSchool = lazy(() => import("./organise/CitizensOrganizingSchool"));
const Monitor = lazy(() => import("./elections/Monitor"));
const KYCManagement = lazy(() => import("./admin/KYCManagement"));
const AdminBroadcastPage = lazy(() => import("./admin/AdminBroadcastPage"));
const AdminDefaultVotingBlocPage = lazy(() => import("./admin/AdminDefaultVotingBlocPage"));
const AdminTemplateSyncPage = lazy(() => import("./admin/AdminTemplateSyncPage"));
const AdminUserManagement = lazy(() => import("./admin/AdminUserManagement"));
const AdminMobileFeedsPage = lazy(() => import("./admin/AdminMobileFeedsPage"));
const ElectionManagement = lazy(() => import("./admin/ElectionManagement"));
const PartyManagement = lazy(() => import("./admin/PartyManagement"));
const CommunicationsPage = lazy(() => import("./admin/CommunicationsPage"));
const OnboardingDashboard = lazy(() => import("./admin/OnboardingDashboard"));
const SituationRoomPage = lazy(() => import("./admin/SituationRoomPage"));
const AllNotificationsPage = lazy(() => import("./notifications/AllNotificationsPage"));
const StateDashboard = lazy(() => import("./state/StateDashboard"));
const CallCenterAdminNavigator = lazy(() => import("../../components/callCenter/CallCenterAdminNavigator"));
// Sidebar menu items type
interface NavItem {
  title: string;
  icon: ReactNode;
  component?: () => ReactNode;
  children?: NavItem[];
  onClick?: () => void;
}

export default function DashboardPage() {
  const { profile, isLoading } = useUser();
  const initialPage = sessionStorage.getItem("dashboardPage") || "Overview";
  const [activePage, setActivePage] = useState(initialPage);
  const [ownedVotingBlocs, setOwnedVotingBlocs] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getOwnedVotingBlocs().then((data) => {
      setOwnedVotingBlocs(data.votingBlocs || []);
    });
  }, []);

  useEffect(() => {
    sessionStorage.removeItem("dashboardPage");
  }, []);

  // Handle redirect to login when no profile is available
  useEffect(() => {
    if (!isLoading && !profile) {
      navigate("/auth/login");
    }
  }, [isLoading, profile, navigate]);

  // Check for pending voting bloc join after user logs in
  useEffect(() => {
    if (profile && !isLoading) {
      const urlParams = new URLSearchParams(window.location.search);
      const emailVerified = urlParams.get('emailVerified');

      // If user just verified email, show success message
      if (emailVerified === 'true') {
        // Remove the query parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const pendingJoin = localStorage.getItem('pending-voting-bloc-join');
      if (pendingJoin) {
        try {
          const joinData = JSON.parse(pendingJoin);
          // Check if this is recent (within 24 hours)
          const joinTimestamp = new Date(joinData.timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - joinTimestamp.getTime()) / (1000 * 60 * 60);

          if (hoursDiff < 24) {
            // Clear the pending join data and redirect to the voting bloc page
            localStorage.removeItem('pending-voting-bloc-join');
            navigate(`/voting-bloc/${joinData.joinCode}`);
            return; // Exit early to prevent other logic
          } else {
            // Remove expired join intent
            localStorage.removeItem('pending-voting-bloc-join');
          }
        } catch (error) {
          console.error('Error parsing pending join data:', error);
          localStorage.removeItem('pending-voting-bloc-join');
        }
      }
    }
  }, [profile, isLoading, navigate]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Handler to go directly to the user's auto-generated voting bloc manage page
  function handleGoToAutoVotingBloc() {
    // Find the user's auto-generated voting bloc
    const autoBloc = ownedVotingBlocs.find((bloc: any) => bloc.isAutoGenerated);
    if (autoBloc) {
      navigate(`/dashboard/manage-voting-bloc/${autoBloc._id}`);
    } else {
      alert('No auto-generated voting bloc found for your account.');
    }
  }

  // Check if user is a coordinator
  const isCoordinator = profile?.designation && [
    'National Coordinator',
    'State Coordinator',
    'LGA Coordinator',
    'Ward Coordinator'
  ].includes(profile.designation);

  // Debug logging for coordinator check
  // useEffect(() => {
  //   if (profile) {
  //     console.log('🔍 Coordinator check:', {
  //       designation: profile.designation,
  //       isCoordinator,
  //       role: profile.role,
  //       shouldShowStateDashboard: profile.role === 'admin' || isCoordinator
  //     });
  //   }
  // }, [profile, isCoordinator]); 

  const sidebarItems: NavItem[] = [
    {
      title: "Overview",
      icon: <Home size={24} />,
      component: () => <DashboardOverview setActivePage={setActivePage} />,
    },

    {
      title: "Organise",
      icon: <Megaphone size={24} />,
      children: [
        { title: "Your Voting Bloc", icon: <Flag size={20} />, onClick: handleGoToAutoVotingBloc },
        { title: "Leaderboard", icon: <BarChart3 size={20} />, component: () => <LeaderboardPage /> },
        // State Dashboard - only visible to admin and coordinators
        ...(profile?.role === 'admin' || isCoordinator ? [
          { title: "State Dashboard", icon: <MapPin size={20} />, component: () => <StateDashboard /> }
        ] : []),
        { title: "Citizens Organizing School", icon: <BookOpen size={20} />, component: () => <CitizensOrganizingSchool /> },
      ],
    },

    {
      title: "Lead",
      icon: <Flag size={24} />,
      children: [
        { title: "Run for Office Hub", icon: <Activity size={20} />, component: () => <RunForOffice /> },
      ],
    },
    {
      title: "Elections",
      icon: <Landmark size={24} />,
      children: [
        { title: "Vote", icon: <ScanLine size={20} />, component: () => <Vote /> },
        { title: "Monitor", icon: <Eye size={20} />, component: () => <Monitor /> },
        // { title: "Results", icon: <BarChart3 size={20} />, component: <Results /> },
      ]
    },
    // Admin section - only visible for admin users
    ...(profile?.role === 'admin' ? [{
      title: "Admin",
      icon: <ShieldCheck size={24} />,
      children: [
        { title: "Situation Room", icon: <Activity size={20} />, component: () => <SituationRoomPage /> },
        { title: "Agent Onboarding", icon: <UserPlus size={20} />, component: () => <OnboardingDashboard /> },
        { title: "Call Center Navigation", icon: <Phone size={20} />, component: () => <CallCenterAdminNavigator /> },
        { title: "Bulk Communications", icon: <MessageSquare size={20} />, component: () => <CommunicationsPage /> },
        { title: "Election Management", icon: <Landmark size={20} />, component: () => <ElectionManagement /> },
        { title: "Party Management", icon: <Flag size={20} />, component: () => <PartyManagement /> },
        { title: "User Management", icon: <Users size={20} />, component: () => <AdminUserManagement /> },
        { title: "KYC Management", icon: <UserCheck size={20} />, component: () => <KYCManagement /> },
        { title: "Default Voting Bloc Settings", icon: <Flag size={20} />, component: () => <AdminDefaultVotingBlocPage /> },
        { title: "Template Synchronization", icon: <RefreshCw size={20} />, component: () => <AdminTemplateSyncPage /> },
        { title: "Broadcast Messages", icon: <Megaphone size={20} />, component: () => <AdminBroadcastPage /> },
        { title: "Mobile Feeds Management", icon: <Smartphone size={20} />, component: () => <AdminMobileFeedsPage /> },
      ],
    }] : []),


    {
      title: "Notifications",
      icon: <Bell size={24} />,
      component: () => <AllNotificationsPage setActivePage={setActivePage} />,
    },
    {
      title: "My Profile",
      icon: <User size={24} />,
      component: () => <ProfilePage />,
    },
  ];

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#F2F2F2] to-[#E0E7E9]">
        <Loading />
      </div>
    );
  }

  if (!profile && !isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#F2F2F2] to-[#E0E7E9]">
        <Loading />
      </div>
    );
  }

  const findComponent = (items: NavItem[]): ReactNode => {
    for (const item of items) {
      if (item.title === activePage && item.component) return item.component();
      if (item.children) {
        const match = item.children.find((child) => child.title === activePage);
        if (match && match.component) return match.component();
      }
    }
    return <div className="text-gray-500">Coming soon!</div>;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white font-poppins">
      {/* Mobile sidebar overlay - clicking this will close the sidebar */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-20 backdrop-blur-sm"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* Close button outside sidebar - only visible on mobile when sidebar is open */}
      {isSidebarOpen && (
        <button
          className="md:hidden fixed top-4 right-[20px] z-20 p-2 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <X size={20} className="text-gray-700" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white border-r shadow-xl p-6 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} md:sticky md:top-0 z-20 h-screen overflow-y-auto`}
      >

        <div className="mb-3">
          <TopLogo />
        </div>
        <div className="mb-6">
          <UserProfileCard setActivePage={setActivePage} />
        </div>
        <nav className="space-y-3">
          {sidebarItems.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleSection(item.title)}
                    className="w-full flex items-center justify-between px-3 py-2 text-md font-normal text-[#006837] hover:bg-[#8cc63f]/20 rounded-lg transition-colors duration-200"
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.title}
                    </span>
                    {openSection === item.title ? (
                      <ChevronUp size={20} className="text-[#006837]" />
                    ) : (
                      <ChevronDown size={20} className="text-[#006837]" />
                    )}
                  </button>
                  {openSection === item.title && (
                    <div className="pl-8 mt-2 space-y-2 animate-fade-in">
                      {item.children.map((sub) => (
                        <div
                          key={sub.title}
                          onClick={() => {
                            if (sub.onClick) {
                              sub.onClick();
                            } else {
                              setActivePage(sub.title);
                            }
                            setIsSidebarOpen(false);
                          }}
                          className={`flex items-center cursor-pointer gap-3 px-3 py-2 text-sm text-gray-700 hover:text-[#006837] hover:bg-[#8cc63f]/10 rounded-lg transition-colors duration-200 ${activePage === sub.title ? "bg-[#8cc63f]/20 text-[#006837]" : ""
                            }`}
                        >
                          {sub.icon}
                          {sub.title}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  onClick={() => {
                    setActivePage(item.title);
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2 text-md font-normal cursor-pointer text-[#006837] hover:bg-[#8cc63f]/20 rounded-lg transition-colors duration-200 ${activePage === item.title ? "bg-[#8cc63f]/20 text-[#006837]" : ""
                    }`}
                >
                  {item.icon}
                  {item.title}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <DashboardHeader
          title={activePage}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          setActivePage={setActivePage}
        />
        <div className="animate-fade-in p-4">
          <Suspense fallback={<div className="py-10"><Loading /></div>}>
            {findComponent(sidebarItems)}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
