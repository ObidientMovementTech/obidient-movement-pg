// src/main.tsx (or index.tsx)
import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";

// Only import essential components that are needed immediately
import ErrorPage from "./pages/ErrorPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

// Contexts (these are lightweight)
import { ThemeProvider } from "./context/ThemeContexts.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { ModalProvider } from "./context/ModalContext.tsx";

// Lazy load all page components
const LandingPage2 = lazy(() => import("./pages/home/LandingPage2.tsx"));

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

// Profile Pages
const ProfileLayout = lazy(() => import("./pages/profile/page.tsx"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage.tsx"));

// Dashboard Pages
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.tsx"));
const EligibilityChecker = lazy(() => import("./pages/dashboard/lead/eligibilityChecker/EligibilityChecker.tsx"));

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

// Call Center Pages
const CallCenterAdmin = lazy(() => import("./pages/callCenter/CallCenterAdmin.tsx"));
const CallCenterVolunteer = lazy(() => import("./pages/callCenter/CallCenterVolunteer.tsx"));

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

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LandingPage2 />
    ),
    errorElement: <ErrorPage />,
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
    path: "/dashboard",
    element: (
      <Suspense fallback={<PageLoader />}>
        <DashboardPage />
      </Suspense>
    ),
  },

  {
    path: "/run-for-office/eligibility",
    element: (
      <ProtectedRoute>
        <EligibilityChecker />
      </ProtectedRoute>
    ),
  },

  // Election Monitoring Dashboard - Protected Route
  {
    path: "/dashboard/elections/monitor",
    element: (
      <ProtectedRoute>
        <MonitorDashboard />
      </ProtectedRoute>
    ),
  },

  // Legacy route for backwards compatibility
  {
    path: "/dashboard/elections/monitoring",
    element: (
      <ProtectedRoute>
        <MonitorDashboard />
      </ProtectedRoute>
    ),
  },

  // Monitoring Form Pages
  {
    path: "/dashboard/elections/monitor/polling-unit",
    element: (
      <ProtectedRoute>
        <PUInfoPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/dashboard/elections/monitor/officer-verification",
    element: (
      <ProtectedRoute>
        <OfficerVerificationPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/dashboard/elections/monitor/result-tracking",
    element: (
      <ProtectedRoute>
        <ResultTrackingPage />
      </ProtectedRoute>
    ),
  },

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
    path: "/dashboard/call-center/volunteer",
    element: (
      <ProtectedRoute>
        <CallCenterVolunteer />
      </ProtectedRoute>
    ),
  },

  // Voting Bloc Links
  {
    path: "/dashboard/new-voting-bloc",
    element: (
      <ProtectedRoute>
        <NewVotingBlocPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/edit-voting-bloc/:id",
    element: (
      <ProtectedRoute>
        <EditVotingBlocPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/manage-voting-bloc/:id",
    element: (
      <ProtectedRoute>
        <VotingBlocManagePage />
      </ProtectedRoute>
    ),
  },

  // Voting Bloc Routes (Public view)
  {
    path: "/voting-bloc/:joinCode",
    element: (
      <VotingBlocDetail />
    ),
    errorElement: <ErrorPage />
  },

]);

// Create root safely - this pattern prevents the warning in development
const container = document.getElementById("root")!;

// In development, React.StrictMode causes double rendering which can trigger the warning
// This is expected behavior and the warning can be safely ignored, but we can improve it
const renderApp = () => (
  <React.StrictMode>
    <ThemeProvider>
      <ModalProvider>
        <UserProvider>
          <RouterProvider router={router} />
        </UserProvider>
      </ModalProvider>
    </ThemeProvider>
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
