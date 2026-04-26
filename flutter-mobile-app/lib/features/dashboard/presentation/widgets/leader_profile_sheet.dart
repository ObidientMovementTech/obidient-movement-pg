import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../chat/presentation/providers/chat_providers.dart';
import '../../../chat/presentation/widgets/user_profile_sheet.dart';

void showLeaderProfileSheet(
  BuildContext context, {
  required Map<String, dynamic> leader,
  required String location,
  bool isPeterObi = false,
}) {
  HapticFeedback.mediumImpact();
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _LeaderProfileSheet(
      leader: leader,
      location: location,
      isPeterObi: isPeterObi,
    ),
  );
}

class _LeaderProfileSheet extends ConsumerStatefulWidget {
  final Map<String, dynamic> leader;
  final String location;
  final bool isPeterObi;

  const _LeaderProfileSheet({
    required this.leader,
    required this.location,
    required this.isPeterObi,
  });

  @override
  ConsumerState<_LeaderProfileSheet> createState() =>
      _LeaderProfileSheetState();
}

class _LeaderProfileSheetState extends ConsumerState<_LeaderProfileSheet> {

  Future<void> _startConversation() async {
    final leaderId = widget.leader['id'] as String?;
    if (leaderId == null) return;

    HapticFeedback.lightImpact();
    // Check for existing conversation locally
    final convos = ref.read(conversationsProvider).valueOrNull ?? [];
    final existing = convos.where((c) => c.participantId == leaderId).firstOrNull;
    if (mounted) {
      Navigator.pop(context);
      if (existing != null) {
        context.push('/chat/${existing.id}');
      } else {
        context.push(
          '/chat/new/$leaderId',
          extra: ChatUserProfile(
            userId: leaderId,
            name: widget.leader['name'] as String?,
            image: widget.leader['profileImage'] as String?,
            designation: widget.leader['designation'] as String?,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? AppColors.surface : Colors.white;
    final cardBg = isDark ? AppColors.elevated : const Color(0xFFF6F6F6);
    final muted = isDark ? AppColors.textMuted : AppColors.lightTextSecondary;
    final primary = isDark ? AppColors.textPrimary : AppColors.lightTextPrimary;

    final name = widget.leader['name'] as String? ?? '';
    final designation = widget.leader['designation'] as String? ?? '';
    final profileImage = widget.leader['profileImage'] as String?;
    final isAsset = profileImage == '__asset__';
    final email = widget.leader['email'] as String?;
    final phone = widget.leader['phone'] as String?;

    final subtitle = widget.location.isNotEmpty
        ? '${widget.location} $designation'
        : designation;

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
                  backgroundImage: isAsset
                      ? const AssetImage('assets/images/peter-obi.webp')
                          as ImageProvider
                      : (profileImage != null && profileImage.isNotEmpty
                          ? CachedNetworkImageProvider(profileImage)
                          : null),
                  child: !isAsset &&
                          (profileImage == null || profileImage.isEmpty)
                      ? Text(
                          _initials(name),
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
                name,
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
                subtitle,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                  letterSpacing: 0.2,
                ),
                textAlign: TextAlign.center,
              ),
            ),

            // ── Peter Obi bio ──
            if (widget.isPeterObi) ...[
              const SizedBox(height: 28),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ABOUT',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.2,
                        color: muted,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isDark ? AppColors.border : const Color(0xFFEBEBEB),
                          width: 0.5,
                        ),
                      ),
                      child: Text(
                        'Peter Gregory Obi is a Nigerian businessman and '
                        'politician who served as the Governor of Anambra State '
                        'from 2006 to 2014. He was the Vice Presidential '
                        'candidate of the PDP in 2019 and the Presidential '
                        'candidate of the Labour Party in the 2023 general '
                        'elections. He is the Founder of the Obidient Movement.',
                        style: TextStyle(
                          fontSize: 14,
                          height: 1.6,
                          color: isDark
                              ? AppColors.textSecondary
                              : AppColors.lightTextSecondary,
                          letterSpacing: -0.1,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // ── Contact info for other leaders ──
            if (!widget.isPeterObi &&
                (email != null || phone != null)) ...[
              const SizedBox(height: 28),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'CONTACT',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.2,
                        color: muted,
                      ),
                    ),
                    const SizedBox(height: 14),
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
                          if (email != null)
                            _ContactTile(
                              icon: Icons.mail_outline_rounded,
                              value: email,
                              isDark: isDark,
                              showBorder: phone != null,
                            ),
                          if (phone != null)
                            _ContactTile(
                              icon: Icons.phone_outlined,
                              value: phone,
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

            // ── Send Message button ──
            if (!widget.isPeterObi) ...[
              const SizedBox(height: 28),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    child: OutlinedButton.icon(
                      onPressed: _startConversation,
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
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
}

class _ContactTile extends StatelessWidget {
  final IconData icon;
  final String value;
  final bool isDark;
  final bool showBorder;

  const _ContactTile({
    required this.icon,
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
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isDark
                    ? AppColors.textPrimary
                    : AppColors.lightTextPrimary,
                letterSpacing: -0.1,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
