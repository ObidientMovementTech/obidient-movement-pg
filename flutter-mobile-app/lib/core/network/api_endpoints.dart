/// Centralized API endpoint paths.
/// All paths are relative to [Env.baseUrl].
class ApiEndpoints {
  ApiEndpoints._();

  // ── Auth (/auth) ─────────────────────────────────────────────
  static const login = '/auth/login';
  static const register = '/auth/register';
  static const verify2fa = '/auth/verify-2fa';
  static const confirmEmail = '/auth/confirm-email';
  static const forgotPassword = '/auth/forgot-password';
  static const resetPassword = '/auth/reset-password'; // /:token
  static const resetPasswordOtp = '/auth/reset-password-otp';
  static const logout = '/auth/logout';
  static const me = '/auth/me';
  static const authStatus = '/auth/auth-status';
  static const resendConfirmation = '/auth/resend-confirmation';
  static const verifyEmailCode = '/auth/verify-email-code';
  static const refreshToken = '/auth/refresh';
  static const mobileGoogleLogin = '/auth/mobile/google-login';
  static const mobileAppleLogin = '/auth/mobile/apple-login';

  // ── User (/users) ────────────────────────────────────────────
  static const userMe = '/users/me';
  static const checkUsername = '/users/check-username';
  static const profileCompletion = '/users/profile-completion';
  static const uploadProfileImage = '/users/upload-profile-image';
  static const changePasswordRequest = '/users/change-password-request';
  static const verifyOtp = '/users/verify-otp';
  static const changePassword = '/users/change-password';
  static const setup2fa = '/users/setup-2fa';
  static const verify2faSetup = '/users/verify-2fa';
  static const disable2fa = '/users/disable-2fa';
  static const changeEmailRequest = '/users/change-email-request';
  static const verifyEmailChange = '/users/verify-email-change';
  static const notificationPreferences = '/users/notification-preferences';
  static const deleteAccount = '/users/delete-account';
  static const chatSettings = '/users/chat-settings';
  static const blockedUsers = '/users/blocked';
  static String blockUser(String id) => '/users/$id/block';
  static String unblockUser(String id) => '/users/$id/block';

  // ── Onboarding ───────────────────────────────────────────────
  static const onboardingInitiate = '/onboarding/initiate';
  static const onboardingComplete = '/onboarding/complete';
  static const onboardingUploadImage = '/onboarding/upload-profile-image';

  // ── KYC (/kyc) ──────────────────────────────────────────────
  static const kycSubmit = '/kyc/submit';
  static const kycMe = '/kyc/me';
  static const kycSavePersonalInfo = '/kyc/save-step/personal-info';
  static const kycSaveValidId = '/kyc/save-step/valid-id';
  static const kycSaveSelfie = '/kyc/save-step/selfie';

  // ── Conversations (/api/conversations) ───────────────────────
  static const conversations = '/api/conversations';
  static String conversationMessages(String id) =>
      '/api/conversations/$id/messages';
  static String messageReactions(String convId, String msgId) =>
      '/api/conversations/$convId/messages/$msgId/reactions';
  static String deleteMessage(String convId, String msgId) =>
      '/api/conversations/$convId/messages/$msgId';
  static const contacts = '/api/conversations/contacts';
  static const onlineStatus = '/api/conversations/online';

  // ── Rooms (/api/rooms) ───────────────────────────────────────
  static const myRooms = '/api/rooms/my-rooms';
  static String roomMessages(String id) => '/api/rooms/$id/messages';
  static String roomMessageReactions(String roomId, String msgId) =>
      '/api/rooms/$roomId/messages/$msgId/reactions';
  static String deleteRoomMessage(String roomId, String msgId) =>
      '/api/rooms/$roomId/messages/$msgId';
  static String roomMembers(String id) => '/api/rooms/$id/members';
  static String roomPinned(String id) => '/api/rooms/$id/pinned';
  static String roomMute(String roomId, String userId) =>
      '/api/rooms/$roomId/mute/$userId';
  static String roomUnmute(String roomId, String userId) =>
      '/api/rooms/$roomId/unmute/$userId';
  static String roomPin(String roomId, String msgId) =>
      '/api/rooms/$roomId/pin/$msgId';
  static String roomBan(String roomId, String userId) =>
      '/api/rooms/$roomId/ban/$userId';

  // ── Voting Blocs (/voting-blocs) ─────────────────────────────
  static const votingBlocs = '/voting-blocs';
  static const votingBlocsOwned = '/voting-blocs/owned';
  static const votingBlocsJoined = '/voting-blocs/joined';
  static const votingBlocLeaderboard = '/voting-blocs/leaderboard';
  static const joinVotingBloc = '/voting-blocs/join';
  static String votingBlocDetail(String id) => '/voting-blocs/$id';
  static String votingBlocLeave(String id) => '/voting-blocs/$id/leave';
  static String votingBlocInvite(String id) =>
      '/voting-blocs/$id/invite-member';
  static String votingBlocAddManual(String id) =>
      '/voting-blocs/$id/add-manual-member';
  static String votingBlocBroadcast(String id) =>
      '/voting-blocs/$id/broadcast';
  static String votingBlocEngagement(String id) =>
      '/voting-blocs/$id/engagement';
  static String votingBlocMemberMetadata(String id) =>
      '/voting-blocs/$id/member-metadata';
  static String votingBlocInvitations(String id) =>
      '/voting-blocs/$id/invitations';
  static String votingBlocResendInvitation(String id) =>
      '/voting-blocs/$id/resend-invitation';
  static String votingBlocClearInvitations(String id) =>
      '/voting-blocs/$id/invitations/clear-history';
  static String votingBlocMemberTags(String blocId, String memberId) =>
      '/voting-blocs/$blocId/members/$memberId/tags';
  static String votingBlocPrivateMsg(String blocId, String memberId) =>
      '/voting-blocs/$blocId/members/$memberId/message';
  static String votingBlocRemoveMember(String blocId, String memberId) =>
      '/voting-blocs/$blocId/members/$memberId';

  // ── Polling Unit ─────────────────────────────────────────────
  static const pollingUnitMembers = '/users/polling-unit-members';

  // ── Notifications (/notifications) ───────────────────────────
  static const notifications = '/notifications';
  static String notificationRead(String id) => '/notifications/$id/read';
  static const notificationMarkAllRead = '/notifications/mark-all-read';

  // ── Mobile (/mobile) ────────────────────────────────────────
  static const mobileProfile = '/mobile/user/profile';
  static const mobileFeeds = '/mobile/feeds';
  static const mobileFeedsUnified = '/mobile/feeds/unified';
  static const mobileNotifications = '/mobile/notifications';
  static String mobileNotificationRead(String id) =>
      '/mobile/notifications/$id/read';
  static const mobilePushRegister = '/mobile/push/register-token';
  static const mobilePushSettings = '/mobile/push/settings';
  static const mobilePushTest = '/mobile/push/test';

  // ── Blog (/api/blog) ────────────────────────────────────────
  static const blogPosts = '/api/blog/posts';
  static String blogPostBySlug(String slug) => '/api/blog/posts/$slug';
  static const blogCategories = '/api/blog/posts/categories';

  // ── Reactions (/api/reactions) ──────────────────────────────
  static const reactions = '/api/reactions';
  static String reactionsByTarget(String targetType, String targetId) =>
      '/api/reactions/$targetType/$targetId';
  static const reactionsBatch = '/api/reactions/batch';

  // ── State Dashboard ──────────────────────────────────────────
  static const stateDashboardData = '/state-dashboard/data';
  static const stateDashboardVoters = '/state-dashboard/voters';

  // ── Mobilise Dashboard (/mobilise-dashboard) ─────────────────
  static const mobiliseDashboardUserLevel = '/mobilise-dashboard/user-level';
  static const mobiliseDashboardNational = '/mobilise-dashboard/national';
  static String mobiliseDashboardState(String stateId) =>
      '/mobilise-dashboard/state/$stateId';
  static String mobiliseDashboardLGA(String lgaId) =>
      '/mobilise-dashboard/lga/$lgaId';
  static String mobiliseDashboardWard(String wardId) =>
      '/mobilise-dashboard/ward/$wardId';
  static String mobiliseDashboardPU(String puId) =>
      '/mobilise-dashboard/polling-unit/$puId';

  // ── Coordinator (/api/coordinator) ───────────────────────────
  static const coordinatorSearch = '/api/coordinator/search';
  static const coordinatorAssign = '/api/coordinator/assign';
  static const coordinatorSubordinates = '/api/coordinator/subordinates';
  static const coordinatorRemove = '/api/coordinator/remove';

  // ── Nigeria Locations (/api/nigeria-locations) ───────────────
  static const nigeriaStates = '/api/nigeria-locations/states';
  static String nigeriaLGAs(int stateId) =>
      '/api/nigeria-locations/states/$stateId/lgas';
  static String nigeriaWards(int lgaId) =>
      '/api/nigeria-locations/lgas/$lgaId/wards';
  static String nigeriaPollingUnits(int wardId) =>
      '/api/nigeria-locations/wards/$wardId/polling-units';
  static const nigeriaLocationSearch = '/api/nigeria-locations/search';

  // ── Location ─────────────────────────────────────────────────
  static const locationStates = '/location/states';
  static String locationLgas(String state) => '/location/states/$state/lgas';
}
