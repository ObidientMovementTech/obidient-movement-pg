import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../providers/block_providers.dart';
import '../providers/chat_providers.dart';

/// Data holder for user profile info shown in the bottom sheet.
class ChatUserProfile {
  final String? userId;
  final String? name;
  final String? image;
  final String? designation;
  final String? votingState;
  final String? votingLga;
  final String? votingWard;
  final String? votingPu;

  const ChatUserProfile({
    this.userId,
    this.name,
    this.image,
    this.designation,
    this.votingState,
    this.votingLga,
    this.votingWard,
    this.votingPu,
  });

  bool get hasVotingLocation =>
      votingState != null ||
      votingLga != null ||
      votingWard != null ||
      votingPu != null;
}

void showUserProfileSheet(BuildContext context, ChatUserProfile profile) {
  HapticFeedback.mediumImpact();
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _UserProfileSheet(profile: profile),
  );
}

class _UserProfileSheet extends ConsumerStatefulWidget {
  final ChatUserProfile profile;
  const _UserProfileSheet({required this.profile});

  @override
  ConsumerState<_UserProfileSheet> createState() => _UserProfileSheetState();
}

class _UserProfileSheetState extends ConsumerState<_UserProfileSheet> {
  bool _blockLoading = false;

  /// Get current user's ID (to hide DM/block buttons on own profile).
  String? get _currentUserId {
    final auth = ref.read(authStateProvider);
    if (auth is Authenticated) return auth.user.id;
    return null;
  }

  bool get _isOwnProfile =>
      widget.profile.userId != null &&
      widget.profile.userId == _currentUserId;

  bool get _canInteract =>
      widget.profile.userId != null && !_isOwnProfile;

  Future<void> _startConversation() async {
    final targetId = widget.profile.userId;
    if (targetId == null) return;

    HapticFeedback.lightImpact();
    // Check for existing conversation locally
    final convos = ref.read(conversationsProvider).valueOrNull ?? [];
    final existing = convos.where((c) => c.participantId == targetId).firstOrNull;
    if (mounted) {
      Navigator.pop(context);
      if (existing != null) {
        context.push('/chat/${existing.id}');
      } else {
        context.push(
          '/chat/new/$targetId',
          extra: widget.profile,
        );
      }
    }
  }

  Future<void> _toggleBlock() async {
    final targetId = widget.profile.userId;
    if (targetId == null) return;

    final isBlocked = ref.read(blockedIdsProvider).contains(targetId);
    final name = widget.profile.name ?? 'this user';

    if (!isBlocked) {
      // Confirm before blocking
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (ctx) {
          final theme = Theme.of(ctx);
          return AlertDialog(
            backgroundColor: theme.colorScheme.surface,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            title: Text(
              'Block $name?',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface,
              ),
            ),
            content: Text(
              'They won\'t be able to send you direct messages. '
              'You can unblock them anytime.',
              style: TextStyle(
                fontSize: 13,
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: Text(
                  'Cancel',
                  style: TextStyle(
                    color: theme.colorScheme.onSurface.withOpacity(0.5),
                  ),
                ),
              ),
              FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFFFF3B30),
                ),
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Block'),
              ),
            ],
          );
        },
      );
      if (confirmed != true) return;
    }

    HapticFeedback.lightImpact();
    setState(() => _blockLoading = true);
    try {
      final notifier = ref.read(blockedUsersProvider.notifier);
      if (isBlocked) {
        await notifier.unblockUser(targetId);
      } else {
        await notifier.blockUser(targetId);
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Action failed')),
        );
      }
    } finally {
      if (mounted) setState(() => _blockLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = widget.profile;
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? AppColors.surface : Colors.white;
    final cardBg = isDark ? AppColors.elevated : const Color(0xFFF6F6F6);
    final muted = isDark ? AppColors.textMuted : AppColors.lightTextSecondary;
    final primary = isDark ? AppColors.textPrimary : AppColors.lightTextPrimary;

    final blockedIds = ref.watch(blockedIdsProvider);
    final isBlocked = profile.userId != null && blockedIds.contains(profile.userId);

    return Container(
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── Drag handle ──
            Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(top: 12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.border : const Color(0xFFD4D4D4),
                borderRadius: BorderRadius.circular(2),
              ),
            ),

            // ── Close button ──
            Align(
              alignment: Alignment.centerRight,
              child: Padding(
                padding: const EdgeInsets.only(right: 8, top: 4),
                child: IconButton(
                  icon: Icon(Icons.close_rounded, size: 20,
                    color: isDark ? AppColors.textMuted : const Color(0xFF999999)),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),

            // ── Avatar with green accent ring ──
            Container(
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [Color(0xFF077B32), Color(0xFF0EA04A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF077B32).withOpacity(0.2),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: bg,
                  shape: BoxShape.circle,
                ),
                child: CircleAvatar(
                  radius: 48,
                  backgroundColor: cardBg,
                  backgroundImage: profile.image != null
                      ? CachedNetworkImageProvider(profile.image!)
                      : null,
                  child: profile.image == null
                      ? Text(
                          _initials(profile.name),
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                            letterSpacing: 1,
                          ),
                        )
                      : null,
                ),
              ),
            ),

            const SizedBox(height: 16),

            // ── Name ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                profile.name ?? 'Unknown',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: primary,
                  letterSpacing: -0.5,
                  height: 1.2,
                ),
                textAlign: TextAlign.center,
              ),
            ),

            if (profile.designation != null) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: AppColors.primary.withOpacity(0.15),
                    width: 0.5,
                  ),
                ),
                child: Text(
                  profile.designation!,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                    letterSpacing: 0.2,
                  ),
                ),
              ),
            ],

            // ── Voting Location ──
            if (profile.hasVotingLocation) ...[
              const SizedBox(height: 28),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Section label
                    Text(
                      'VOTING LOCATION',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.2,
                        color: muted,
                      ),
                    ),
                    const SizedBox(height: 14),
                    // Location grid
                    Container(
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isDark ? AppColors.border : const Color(0xFFEBEBEB),
                          width: 0.5,
                        ),
                      ),
                      child: Column(
                        children: [
                          if (profile.votingState != null)
                            _LocationTile(
                              icon: Icons.map_outlined,
                              label: 'State',
                              value: profile.votingState!,
                              isDark: isDark,
                              showBorder: profile.votingLga != null ||
                                  profile.votingWard != null ||
                                  profile.votingPu != null,
                            ),
                          if (profile.votingLga != null)
                            _LocationTile(
                              icon: Icons.location_city_outlined,
                              label: 'LGA',
                              value: profile.votingLga!,
                              isDark: isDark,
                              showBorder: profile.votingWard != null ||
                                  profile.votingPu != null,
                            ),
                          if (profile.votingWard != null)
                            _LocationTile(
                              icon: Icons.holiday_village_outlined,
                              label: 'Ward',
                              value: profile.votingWard!,
                              isDark: isDark,
                              showBorder: profile.votingPu != null,
                            ),
                          if (profile.votingPu != null)
                            _LocationTile(
                              icon: Icons.how_to_vote_outlined,
                              label: 'Polling Unit',
                              value: profile.votingPu!,
                              isDark: isDark,
                              showBorder: false,
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // ── Action Buttons (DM + Block) ──
            if (_canInteract) ...[
              const SizedBox(height: 28),
              // Send Message button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: OutlinedButton.icon(
                    onPressed: isBlocked ? null : _startConversation,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: BorderSide(
                        color: AppColors.primary.withOpacity(0.3),
                        width: 1.5,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      backgroundColor: AppColors.primary.withOpacity(0.06),
                    ),
                    icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18,
                            color: AppColors.primary),
                    label: const Text(
                      'Send Message',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                        letterSpacing: -0.2,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Block / Unblock button
              Center(
                child: TextButton.icon(
                  onPressed: _blockLoading ? null : _toggleBlock,
                  icon: _blockLoading
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 1.5),
                        )
                      : Icon(
                          isBlocked
                              ? Icons.lock_open_rounded
                              : Icons.block_rounded,
                          size: 16,
                          color: isBlocked
                              ? muted
                              : const Color(0xFFFF3B30),
                        ),
                  label: Text(
                    isBlocked ? 'Unblock' : 'Block User',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: isBlocked
                          ? muted
                          : const Color(0xFFFF3B30),
                    ),
                  ),
                ),
              ),
            ],

            SizedBox(height: MediaQuery.of(context).padding.bottom + 32),
          ],
        ),
      ),
    );
  }

  String _initials(String? name) {
    if (name == null || name.isEmpty) return '?';
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return parts[0][0].toUpperCase();
  }
}

/// Each location row with its own icon — not a generic table.
class _LocationTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isDark;
  final bool showBorder;

  const _LocationTile({
    required this.icon,
    required this.label,
    required this.value,
    required this.isDark,
    required this.showBorder,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        border: showBorder
            ? Border(
                bottom: BorderSide(
                  color: isDark ? AppColors.border : const Color(0xFFEEEEEE),
                  width: 0.5,
                ),
              )
            : null,
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.08),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: isDark
                        ? AppColors.textMuted
                        : AppColors.lightTextSecondary,
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark
                        ? AppColors.textPrimary
                        : AppColors.lightTextPrimary,
                    letterSpacing: -0.1,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
