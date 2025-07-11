// src/main.tsx (or index.tsx)
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";

import ErrorPage from "./pages/ErrorPage.tsx";

// Auth
import AuthPage from "./pages/auth/page.tsx";
import GetStartedPage from "./pages/auth/GetStartedPage.tsx";
import VerificationPage from "./pages/auth/VerificationPage.tsx";
import LoginPage from "./pages/auth/LoginPage.tsx";
import ResendVerification from "./pages/auth/ResendPage.tsx";
import ForgotPassword from "./pages/auth/ForgotPasswordPage.tsx";
import ChangePassword from "./pages/auth/ChangePasswordPage.tsx";
import ConfirmEmailPage from "./pages/auth/ConfirmEmailPage.tsx";


// Profile
import ProfileLayout from "./pages/profile/page.tsx";
import ProfilePage from "./pages/profile/ProfilePage.tsx";

// Contexts
import { ThemeProvider } from "./context/ThemeContexts.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { ModalProvider } from "./context/ModalContext.tsx";
import DashboardPage from "./pages/dashboard/DashboardPage.tsx";


import EligibilityChecker from "./pages/dashboard/lead/eligibilityChecker/EligibilityChecker.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";



import LandingPage2 from "./pages/home/LandingPage2.tsx";
import VotingBlocDetail from "./pages/dashboard/votingBloc/VotingBlocDetail.tsx";
import NewVotingBlocPage from "./pages/dashboard/votingBloc/NewVotingBlocPage.tsx";
import EditVotingBlocPage from "./pages/dashboard/votingBloc/EditVotingBlocPage.tsx";
import VotingBlocManagePage from "./pages/dashboard/votingBloc/VotingBlocManagePage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <UserProvider>
        <LandingPage2 />
      </UserProvider>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/auth",
    element: (
      <UserProvider>
        <AuthPage />
      </UserProvider>),
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
    path: "/profile",
    element: (
      <UserProvider>
        <ProfileLayout />
      </UserProvider>
    ),
    errorElement: <ErrorPage />,
    children: [{ index: true, element: <ProfilePage /> }],
  },
  {
    path: "/dashboard",
    element: (
      <UserProvider>
        <DashboardPage />
      </UserProvider>
    ),
  },

  {
    path: "/run-for-office/eligibility",
    element: (
      <UserProvider>
        <ProtectedRoute>
          <EligibilityChecker />
        </ProtectedRoute>
      </UserProvider>
    ),
  },



  // Voting Bloc Links
  {
    path: "/dashboard/new-voting-bloc",
    element: (
      <UserProvider>
        <ProtectedRoute>
          <NewVotingBlocPage />
        </ProtectedRoute>
      </UserProvider>
    ),
  },
  {
    path: "/dashboard/edit-voting-bloc/:id",
    element: (
      <UserProvider>
        <ProtectedRoute>
          <EditVotingBlocPage />
        </ProtectedRoute>
      </UserProvider>
    ),
  },
  {
    path: "/dashboard/manage-voting-bloc/:id",
    element: (
      <UserProvider>
        <ProtectedRoute>
          <VotingBlocManagePage />
        </ProtectedRoute>
      </UserProvider>
    ),
  },

  // Voting Bloc Routes (Public view)
  {
    path: "/voting-bloc/:joinCode",
    element: (
      <UserProvider>
        <VotingBlocDetail />
      </UserProvider>
    ),
    errorElement: <ErrorPage />
  },

]);

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ModalProvider>
        <RouterProvider router={router} />
      </ModalProvider>
    </ThemeProvider>
  </React.StrictMode>
);
