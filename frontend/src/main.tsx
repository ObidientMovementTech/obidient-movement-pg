// src/main.tsx (or index.tsx)
import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";

// Only import essential components that are needed immediately
import ErrorPage from "./pages/ErrorPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AdminRoute from "./components/AdminRoute.tsx";
import PbxRoute from "./components/pbx/PbxRoute.tsx";
import ChatWidget from "./components/pbx/ChatWidget.tsx";
import InstallPrompt from "./components/pwa/InstallPrompt.tsx";

// Contexts (these are lightweight)
import { ThemeProvider } from "./context/ThemeContexts.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { ModalProvider } from "./context/ModalContext.tsx";
import { SocketProvider } from "./context/SocketContext.tsx";
import { BlockProvider } from "./context/BlockContext.tsx";

// Lazy load all page components
const PublicLayout = lazy(() => import("./pages/public/PublicLayout.tsx"));
const HomePage = lazy(() => import("./pages/public/HomePage.tsx"));
const AboutPage = lazy(() => import("./pages/public/AboutPage.tsx"));
const NewsPage = lazy(() => import("./pages/public/NewsPage.tsx"));
const NewsPostPage = lazy(() => import("./pages/public/NewsPostPage.tsx"));
const ContactPage = lazy(() => import("./pages/public/ContactPage.tsx"));

// Auth Pages
const AuthPage = lazy(() => import("./pages/auth/page.tsx"));
const GetStartedPage = lazy(() => import("./pages/auth/GetStartedPage.tsx"));
const AnambraSignupPage = lazy(() => import("./pages/auth/AnambraSignupPage.tsx"));
const VerificationPage = lazy(() => import("./pages/auth/VerificationPage.tsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.tsx"));
const ResendVerification = lazy(() => import("./pages/auth/ResendPage.tsx"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPasswordPage.tsx"));
const ChangePassword = lazy(() => import("./pages/auth/ChangePasswordPage.tsx"));
const ConfirmEmailPage = lazy(() => import("./pages/auth/ConfirmEmailPage.tsx"));
const OnboardingPage = lazy(() => import("./pages/auth/OnboardingPage.tsx"));
const JoinRedirect = lazy(() => import("./pages/auth/JoinRedirect.tsx"));

// Profile Pages
const ProfileLayout = lazy(() => import("./pages/profile/page.tsx"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage.tsx"));
const ChatPrivacySettings = lazy(() => import("./pages/profile/sections/ChatPrivacySettings.tsx"));

// Dashboard Pages
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout.tsx"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome.tsx"));
const CompleteProfilePage = lazy(() => import("./pages/dashboard/CompleteProfilePage.tsx"));
const MemberCardPage = lazy(() => import("./pages/dashboard/MemberCardPage.tsx"));
const MyVotingBlocRedirect = lazy(() => import("./pages/dashboard/votingBloc/MyVotingBlocRedirect.tsx"));
const LeaderboardPage = lazy(() => import("./pages/dashboard/votingBloc/LeaderboardPage.tsx"));
const StateDashboard = lazy(() => import("./pages/dashboard/state/StateDashboard.tsx"));
const MyTeamPage = lazy(() => import("./pages/dashboard/state/MyTeamPage.tsx"));
const AssignLeaderPage = lazy(() => import("./pages/dashboard/state/AssignLeaderPage.tsx"));
const AllNotificationsPage = lazy(() => import("./pages/dashboard/notifications/AllNotificationsPage.tsx"));
const EligibilityChecker = lazy(() => import("./pages/dashboard/lead/eligibilityChecker/EligibilityChecker.tsx"));
const ChatPage = lazy(() => import("./pages/dashboard/ChatPage.tsx"));

// Voting Bloc Pages
const VotingBlocDetail = lazy(() => import("./pages/dashboard/votingBloc/VotingBlocDetail.tsx"));
const NewVotingBlocPage = lazy(() => import("./pages/dashboard/votingBloc/NewVotingBlocPage.tsx"));
const EditVotingBlocPage = lazy(() => import("./pages/dashboard/votingBloc/EditVotingBlocPage.tsx"));
const VotingBlocManagePage = lazy(() => import("./pages/dashboard/votingBloc/VotingBlocManagePage.tsx"));

// Election Monitoring Pages
const MonitorDashboard = lazy(() => import("./pages/dashboard/elections/monitor/index.tsx"));
const PUInfoPage = lazy(() => import("./pages/dashboard/elections/monitor/pages/PUInfoPage.tsx"));
const OfficerVerificationPage = lazy(() => import("./pages/dashboard/elections/monitor/pages/OfficerVerificationPage.tsx"));
const ResultTrackingPage = lazy(() => import("./pages/dashboard/elections/monitor/pages/ResultTrackingPage.tsx"));
const IncidentReportingPage = lazy(() => import("./pages/dashboard/elections/monitor/pages/IncidentReportingPage.tsx"));
const LiveResultsPage = lazy(() => import("./pages/elections/LiveResults.tsx"));
const ResultsDashboardPage = lazy(() => import("./pages/dashboard/admin/ResultsDashboardPage.tsx"));
const ManualResultUploadPage = lazy(() => import("./pages/dashboard/admin/ManualResultUploadPage.tsx"));

// Call Center Pages
const CallCenterAdmin = lazy(() => import("./pages/callCenter/CallCenterAdmin.tsx"));
const CallCenterVolunteer = lazy(() => import("./pages/callCenter/CallCenterVolunteer.tsx"));
const CommunicationsPage = lazy(() => import("./pages/dashboard/admin/CommunicationsPage.tsx"));

// PBX Admin Dashboard Pages
const PbxLayout = lazy(() => import("./pages/pbx/PbxLayout.tsx"));
const PbxDashboard = lazy(() => import("./pages/pbx/PbxDashboard.tsx"));
const HierarchyDashboard = lazy(() => import("./pages/pbx/HierarchyDashboard.tsx"));
const PbxMembershipPage = lazy(() => import("./pages/pbx/MembershipPage.tsx"));
const ChatInboxPage = lazy(() => import("./pages/pbx/chat/ChatInboxPage.tsx"));
const PbxCommunitiesPage = lazy(() => import("./pages/pbx/CommunitiesPage.tsx"));
const PbxMobilisationPage = lazy(() => import("./pages/pbx/MobilisationPage.tsx"));
const BlogListPage = lazy(() => import("./pages/pbx/blog/BlogListPage.tsx"));
const BlogEditorPage = lazy(() => import("./pages/pbx/blog/BlogEditorPage.tsx"));
const PbxUsersPage = lazy(() => import("./pages/pbx/UsersPage.tsx"));
const PbxCommunicationsPage = lazy(() => import("./pages/pbx/CommunicationsPage.tsx"));
const PbxSettingsPage = lazy(() => import("./pages/pbx/SettingsPage.tsx"));
const PbxMobileFeedsPage = lazy(() => import("./pages/pbx/PbxMobileFeedsPage.tsx"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
  </div>
);

// Preload critical components after app loads
const preloadComponents = () => {
  // Preload commonly used components in the background
  import("./pages/auth/GetStartedPage.tsx");
  import("./pages/profile/ProfilePage.tsx");
  import("./pages/dashboard/votingBloc/VotingBlocManagePage.tsx");
};

// Start preloading after a short delay
setTimeout(preloadComponents, 2000);

// Root layout that renders the ChatWidget inside the router context
const RootLayout = () => (
  <>
    <Outlet />
    <ChatWidget />
    <InstallPrompt />
  </>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PublicLayout />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "news", element: <NewsPage /> },
      { path: "news/:slug", element: <NewsPostPage /> },
      { path: "contact", element: <ContactPage /> },
    ],
  },
  {
    path: "/auth",
    element: (
      <AuthPage />
    ),
    children: [
      { path: "sign-up", element: <GetStartedPage /> },
      { path: "verify", element: <VerificationPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "resend", element: <ResendVerification /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "change-password", element: <ChangePassword /> },
      { path: "confirm-email/:token", element: <ConfirmEmailPage /> },
    ],
  },
  {
    path: "/onboarding",
    element: (
      <Suspense fallback={<PageLoader />}>
        <OnboardingPage />
      </Suspense>
    ),
  },
  {
    path: "/join/:shortCode",
    element: (
      <JoinRedirect />
    ),
  },
  {
    path: "/anambra",
    element: (
      <AuthPage />
    ),
    children: [
      { path: "sign-up", element: <AnambraSignupPage /> },
    ],
  },
  {
    path: "/profile",
    element: (
      <ProfileLayout />
    ),
    errorElement: <ErrorPage />,
    children: [{ index: true, element: <ProfilePage /> }],
  },
  {
    path: "/settings/chat-privacy",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <ChatPrivacySettings />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // Profile completion gate — shown when profile is incomplete
  {
    path: "/complete-profile",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <CompleteProfilePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // Dashboard — nested routes with horizontal header layout
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <DashboardLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><DashboardHome /></Suspense> },
      { path: "voting-bloc", element: <Suspense fallback={<PageLoader />}><MyVotingBlocRedirect /></Suspense> },
      { path: "leaderboard", element: <Suspense fallback={<PageLoader />}><LeaderboardPage /></Suspense> },
      { path: "state", element: <Suspense fallback={<PageLoader />}><StateDashboard /></Suspense> },
      { path: "my-team", element: <Suspense fallback={<PageLoader />}><MyTeamPage /></Suspense> },
      { path: "assign-leader", element: <Suspense fallback={<PageLoader />}><AssignLeaderPage /></Suspense> },
      { path: "card", element: <Suspense fallback={<PageLoader />}><MemberCardPage /></Suspense> },
      { path: "notifications", element: <Suspense fallback={<PageLoader />}><AllNotificationsPage /></Suspense> },
      { path: "profile", element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> },
      { path: "manage-voting-bloc/:id", element: <Suspense fallback={<PageLoader />}><VotingBlocManagePage /></Suspense> },
      { path: "new-voting-bloc", element: <Suspense fallback={<PageLoader />}><NewVotingBlocPage /></Suspense> },
      { path: "edit-voting-bloc/:id", element: <Suspense fallback={<PageLoader />}><EditVotingBlocPage /></Suspense> },
      { path: "chat", element: <Suspense fallback={<PageLoader />}><ChatPage /></Suspense> },
    ],
  },

  {
    path: "/run-for-office/eligibility",
    element: (
      <ProtectedRoute>
        <EligibilityChecker />
      </ProtectedRoute>
    ),
  },

  // Election Monitoring Dashboard - Has built-in authentication
  {
    path: "/dashboard/elections/monitor",
    element: <MonitorDashboard />,
  },

  // Legacy route for backwards compatibility
  {
    path: "/dashboard/elections/monitoring",
    element: <MonitorDashboard />,
  },

  // Sub-routes for monitoring (Protected Routes - require authentication)
  {
    path: "/dashboard/elections/monitor/polling-unit",
    element: (
      <ProtectedRoute>
        <PUInfoPage />
      </ProtectedRoute>
    ),
  },

  // Officer Verification
  {
    path: "/dashboard/elections/monitor/officer-verification",
    element: (
      <ProtectedRoute>
        <OfficerVerificationPage />
      </ProtectedRoute>
    ),
  },

  // Result Tracking
  {
    path: "/dashboard/elections/monitor/result-tracking",
    element: (
      <ProtectedRoute>
        <ResultTrackingPage />
      </ProtectedRoute>
    ),
  },

  // Incident Reporting
  {
    path: "/dashboard/elections/monitor/incident-reporting",
    element: (
      <ProtectedRoute>
        <IncidentReportingPage />
      </ProtectedRoute>
    ),
  },

  // Public Live Results Page
  {
    path: "/elections/live-results",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LiveResultsPage />
      </Suspense>
    ),
  },

  // Admin Results Dashboard
  {
    path: "/admin/results-dashboard",
    element: (
      <AdminRoute>
        <ResultsDashboardPage />
      </AdminRoute>
    ),
  },

  // Admin Manual Result Upload
  {
    path: "/admin/manual-result-upload",
    element: (
      <AdminRoute>
        <Suspense fallback={<PageLoader />}>
          <ManualResultUploadPage />
        </Suspense>
      </AdminRoute>
    ),
  },

  // Call Center Routes
  {
    path: "/dashboard/call-center/admin",
    element: (
      <ProtectedRoute>
        <CallCenterAdmin />
      </ProtectedRoute>
    ),
  },

  {
    path: "/dashboard/admin/communications/*",
    element: (
      <AdminRoute>
        <CommunicationsPage />
      </AdminRoute>
    ),
  },

  {
    path: "/dashboard/call-center/volunteer",
    element: (
      <ProtectedRoute>
        <CallCenterVolunteer />
      </ProtectedRoute>
    ),
  },

  // Voting Bloc Routes (these are now children of /dashboard layout above,
  // but we keep these as fallback redirects for any old bookmarks)
  

  // Voting Bloc Routes (Public view)
  {
    path: "/voting-bloc/:joinCode",
    element: (
      <Suspense fallback={<PageLoader />}>
        <VotingBlocDetail />
      </Suspense>
    ),
    errorElement: <ErrorPage />
  },

  // PBX Admin Dashboard
  {
    path: "/pbx",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PbxRoute>
          <PbxLayout />
        </PbxRoute>
      </Suspense>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/pbx/dashboard" replace /> },
      { path: "dashboard", element: <Suspense fallback={<PageLoader />}><PbxDashboard /></Suspense> },
      { path: "dashboard/:level", element: <Suspense fallback={<PageLoader />}><HierarchyDashboard /></Suspense> },
      { path: "dashboard/:level/:locationId", element: <Suspense fallback={<PageLoader />}><HierarchyDashboard /></Suspense> },
      { path: "membership", element: <Suspense fallback={<PageLoader />}><PbxMembershipPage /></Suspense> },
      { path: "chat", element: <Suspense fallback={<PageLoader />}><ChatInboxPage /></Suspense> },
      { path: "communities", element: <Suspense fallback={<PageLoader />}><PbxCommunitiesPage /></Suspense> },
      { path: "mobilisation", element: <Suspense fallback={<PageLoader />}><PbxMobilisationPage /></Suspense> },
      { path: "blog", element: <Suspense fallback={<PageLoader />}><BlogListPage /></Suspense> },
      { path: "blog/new", element: <Suspense fallback={<PageLoader />}><BlogEditorPage /></Suspense> },
      { path: "blog/edit/:id", element: <Suspense fallback={<PageLoader />}><BlogEditorPage /></Suspense> },
      { path: "users", element: <Suspense fallback={<PageLoader />}><PbxUsersPage /></Suspense> },
      { path: "communications", element: <Suspense fallback={<PageLoader />}><PbxCommunicationsPage /></Suspense> },
      { path: "mobile-feeds", element: <Suspense fallback={<PageLoader />}><PbxMobileFeedsPage /></Suspense> },
      { path: "settings", element: <Suspense fallback={<PageLoader />}><PbxSettingsPage /></Suspense> },
    ],
  },

    ], // end children of RootLayout
  },
]);

// Create root safely - this pattern prevents the warning in development
const container = document.getElementById("root")!;

// In development, React.StrictMode causes double rendering which can trigger the warning
// This is expected behavior and the warning can be safely ignored, but we can improve it
const renderApp = () => (
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <ModalProvider>
          <UserProvider>
            <SocketProvider>
              <BlockProvider>
              <RouterProvider router={router} />
              </BlockProvider>
            </SocketProvider>
          </UserProvider>
        </ModalProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// Check if we're in development mode to handle hot reloading
if (import.meta.hot) {
  // In development with Vite HMR
  let root: ReactDOM.Root;

  if (!(container as any)._reactRoot) {
    root = ReactDOM.createRoot(container);
    (container as any)._reactRoot = root;
  } else {
    root = (container as any)._reactRoot;
  }

  root.render(renderApp());
} else {
  // In production
  const root = ReactDOM.createRoot(container);
  root.render(renderApp());
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  });
}
