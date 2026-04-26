import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/skeleton_loader.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../feeds/data/models/unified_feed_item.dart';
import '../../../feeds/presentation/widgets/broadcast_detail_sheet.dart';
import '../providers/dashboard_providers.dart';
import '../widgets/leader_profile_sheet.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      body: RefreshIndicator(
        color: Colors.white,
        backgroundColor: AppColors.primary,
        onRefresh: () async {
          ref.invalidate(profileCompletionProvider);
          ref.invalidate(leadersProvider);
          ref.invalidate(recentNotificationsProvider);
        },
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _HeroHeader(user: user)),
            SliverToBoxAdapter(child: _JurisdictionStrip(user: user)),
            SliverToBoxAdapter(child: _LeadershipSection(ref: ref, user: user)),
            const SliverToBoxAdapter(child: _QuickActions()),
            SliverToBoxAdapter(child: _RecentNotifications(ref: ref)),
            const SliverPadding(padding: EdgeInsets.only(bottom: 32)),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// HERO HEADER — gradient brand area with greeting + avatar
// ═══════════════════════════════════════════════════════════════════

class _HeroHeader extends StatelessWidget {
  final dynamic user;
  const _HeroHeader({required this.user});

  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF033A17),
            AppColors.primaryDark,
            AppColors.primary,
          ],
        ),
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(28),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(2.5),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.white.withOpacity(0.4),
                        width: 2,
                      ),
                    ),
                    child: CircleAvatar(
                      radius: 24,
                      backgroundColor: Colors.white.withOpacity(0.15),
                      backgroundImage: user?.profileImage != null
                          ? CachedNetworkImageProvider(user!.profileImage!)
                          : null,
                      child: user?.profileImage == null
                          ? Text(
                              (user?.name ?? 'U')[0].toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                              ),
                            )
                          : null,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '$_greeting,',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.75),
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 1),
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                user?.name ?? 'Obidient',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: -0.3,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (user?.kycStatus == 'approved') ...[
                              const SizedBox(width: 6),
                              const Icon(
                                Icons.verified_rounded,
                                size: 18,
                                color: Colors.white,
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 6),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: [
                            if (user?.kycStatus != 'approved')
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: Colors.white.withOpacity(0.2),
                                  ),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.gpp_maybe_outlined,
                                      size: 12,
                                      color: Colors.white70,
                                    ),
                                    SizedBox(width: 4),
                                    Text(
                                      'Not Verified',
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        letterSpacing: 0.3,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            if (user?.designation != null &&
                                user!.designation != 'Community Member')
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.18),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  user!.designation!,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),

                ],
              ),

            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// JURISDICTION STRIP — user's voting location hierarchy
// ═══════════════════════════════════════════════════════════════════

class _JurisdictionStrip extends StatelessWidget {
  final dynamic user;
  const _JurisdictionStrip({required this.user});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final chips = <_JurisdictionChip>[
      if (user?.votingState != null && (user!.votingState as String).isNotEmpty)
        _JurisdictionChip(label: user!.votingState!),
      if (user?.votingLGA != null && (user!.votingLGA as String).isNotEmpty)
        _JurisdictionChip(label: user!.votingLGA!),
      if (user?.votingWard != null && (user!.votingWard as String).isNotEmpty)
        _JurisdictionChip(label: user!.votingWard!),
      if (user?.votingPU != null && (user!.votingPU as String).isNotEmpty)
        _JurisdictionChip(label: user!.votingPU!),
    ];

    if (chips.isEmpty) {
      return Transform.translate(
        offset: const Offset(0, -4),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: theme.colorScheme.outline.withOpacity(0.15),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.06),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              children: [
                Icon(Icons.location_off_outlined,
                    size: 16,
                    color: theme.colorScheme.onSurface.withOpacity(0.35)),
                const SizedBox(width: 10),
                Text(
                  'Set your voting location in Profile',
                  style: TextStyle(
                    fontSize: 12,
                    color: theme.colorScheme.onSurface.withOpacity(0.45),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Transform.translate(
      offset: const Offset(0, -4),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: theme.colorScheme.outline.withOpacity(0.15),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'ACTIVE JURISDICTION',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                  color: theme.colorScheme.onSurface.withOpacity(0.35),
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: chips,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _JurisdictionChip extends StatelessWidget {
  final String label;
  const _JurisdictionChip({required this.label});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: theme.colorScheme.onSurface.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.3,
              color: theme.colorScheme.onSurface.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// LEADERSHIP — coordinators in user's jurisdiction
// ═══════════════════════════════════════════════════════════════════

class _LeadershipSection extends StatelessWidget {
  final WidgetRef ref;
  final dynamic user;
  const _LeadershipSection({required this.ref, required this.user});

  String _locationForLevel(String level) {
    switch (level) {
      case 'national':
        return '';
      case 'state':
        return (user?.votingState as String?) ?? '';
      case 'lga':
        return (user?.votingLGA as String?) ?? '';
      case 'ward':
        return (user?.votingWard as String?) ?? '';
      default:
        return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final leaders = ref.watch(leadersProvider);

    return leaders.when(
      loading: () => Padding(
        padding: const EdgeInsets.fromLTRB(20, 32, 20, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your Leadership',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.3,
                color: theme.colorScheme.onSurface.withOpacity(0.55),
              ),
            ),
            const SizedBox(height: 14),
            SizedBox(
              height: 140,
              child: Row(
                children: List.generate(3, (i) => Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(right: i < 2 ? 10 : 0),
                    child: Container(
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: theme.colorScheme.outline.withOpacity(0.1),
                        ),
                      ),
                      child: const SkeletonList(itemCount: 1),
                    ),
                  ),
                )),
              ),
            ),
          ],
        ),
      ),
      error: (_, __) => const SizedBox.shrink(),
      data: (data) {
        if (data.isEmpty) return const SizedBox.shrink();
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 32, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Your Leadership',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.3,
                  color: theme.colorScheme.onSurface.withOpacity(0.55),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                height: 170,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: data.length + 1,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (context, index) {
                    // First card is always Peter Obi
                    if (index == 0) {
                      const peterObi = {
                        'name': 'Peter Obi',
                        'designation': 'Founder',
                        'profileImage': '__asset__',
                      };
                      return _LeaderCard(
                        leader: peterObi,
                        location: '',
                        onTap: () => showLeaderProfileSheet(
                          context,
                          leader: peterObi,
                          location: '',
                          isPeterObi: true,
                        ),
                      );
                    }
                    final leader = data[index - 1];
                    final level = leader['level'] as String? ?? '';
                    final loc = _locationForLevel(level);
                    return _LeaderCard(
                      leader: leader,
                      location: loc,
                      onTap: () => showLeaderProfileSheet(
                        context,
                        leader: leader,
                        location: loc,
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _LeaderCard extends StatelessWidget {
  final Map<String, dynamic> leader;
  final String location;
  final VoidCallback? onTap;
  const _LeaderCard({required this.leader, required this.location, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final name = leader['name'] as String? ?? '';
    final designation = leader['designation'] as String? ?? '';
    final profileImage = leader['profileImage'] as String?;
    final isAsset = profileImage == '__asset__';

    // Combine location + designation into one subtitle
    // e.g. "Anambra State Coordinator", or just "Founder" for Peter Obi
    final subtitle = location.isNotEmpty
        ? '$location $designation'.toUpperCase()
        : designation.toUpperCase();

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap?.call();
      },
      child: Container(
      width: 150,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.08),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircleAvatar(
            radius: 34,
            backgroundColor: AppColors.primary.withOpacity(0.08),
            backgroundImage: isAsset
                ? const AssetImage('assets/images/peter-obi.webp')
                : (profileImage != null && profileImage.isNotEmpty
                    ? CachedNetworkImageProvider(profileImage) as ImageProvider
                    : null),
            child: !isAsset && (profileImage == null || profileImage.isEmpty)
                ? Text(
                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                    ),
                  )
                : null,
          ),
          const SizedBox(height: 10),
          Text(
            name,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
              letterSpacing: -0.1,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.3,
              color: theme.colorScheme.onSurface.withOpacity(0.38),
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
        ],
      ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// QUICK ACTIONS — asymmetric grid, primary action gets gradient
// ═══════════════════════════════════════════════════════════════════

class _QuickActions extends ConsumerWidget {
  const _QuickActions();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final user = ref.watch(currentUserProvider);
    final designation = user?.designation ?? '';
    final role = user?.role ?? '';
    final isCoordOrAdmin = role == 'admin' ||
        const [
          'National Coordinator',
          'State Coordinator',
          'LGA Coordinator',
          'Ward Coordinator',
        ].contains(designation);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 32, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Quick Actions',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface.withOpacity(0.55),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _ActionCard(
                  icon: Icons.groups_rounded,
                  label: 'My Bloc',
                  color: AppColors.primary,
                  onTap: () {
                    HapticFeedback.lightImpact();
                    context.go('/blocs');
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _ActionCard(
                  icon: Icons.leaderboard_rounded,
                  label: 'Leaderboard',
                  color: const Color(0xFFF59E0B),
                  onTap: () {
                    HapticFeedback.lightImpact();
                    context.go('/leaderboard');
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _ActionCard(
                  icon: Icons.badge_rounded,
                  label: 'Member Card',
                  color: const Color(0xFF3B82F6),
                  onTap: () {
                    HapticFeedback.lightImpact();
                    context.push('/member-card');
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _ActionCard(
                  icon: Icons.campaign_rounded,
                  label: 'Alerts',
                  color: const Color(0xFFEF4444),
                  onTap: () {
                    HapticFeedback.lightImpact();
                    context.go('/feeds?tab=alerts');
                  },
                ),
              ),
            ],
          ),
          if (isCoordOrAdmin) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _ActionCard(
                    icon: Icons.dashboard_rounded,
                    label: 'State Dashboard',
                    color: const Color(0xFF8B5CF6),
                    onTap: () {
                      HapticFeedback.lightImpact();
                      context.push('/state-dashboard');
                    },
                  ),
                ),
                const SizedBox(width: 10),
                const Expanded(child: SizedBox()),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? color;
  final VoidCallback onTap;
  const _ActionCard({
    required this.icon,
    required this.label,
    this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cardColor = color ?? AppColors.primary;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: theme.colorScheme.outline.withOpacity(0.15),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: cardColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 20, color: cardColor),
            ),
            const SizedBox(height: 10),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// RECENT NOTIFICATIONS — rich cards with type icons + time ago
// ═══════════════════════════════════════════════════════════════════

class _RecentNotifications extends ConsumerWidget {
  final WidgetRef ref;
  const _RecentNotifications({required this.ref});

  IconData _typeIcon(String? rawType) {
    switch (rawType) {
      case 'adminBroadcast':
      case 'broadcast':
        return Icons.campaign_rounded;
      case 'votingBlocBroadcast':
      case 'votingBlocMessage':
        return Icons.groups_rounded;
      case 'invite':
        return Icons.mail_rounded;
      case 'urgent':
        return Icons.priority_high_rounded;
      case 'announcement':
        return Icons.campaign_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  Color _typeColor(String? rawType, String priority) {
    if (priority == 'high' || rawType == 'urgent') {
      return const Color(0xFFEF4444);
    }
    switch (rawType) {
      case 'adminBroadcast':
      case 'broadcast':
      case 'announcement':
        return const Color(0xFFEF4444);
      case 'votingBlocBroadcast':
      case 'votingBlocMessage':
        return AppColors.primary;
      case 'invite':
        return const Color(0xFF3B82F6);
      default:
        return const Color(0xFFF59E0B);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final notifs = ref.watch(recentNotificationsProvider);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 32, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Recent Activity',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface.withOpacity(0.55),
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  context.go('/feeds?tab=alerts');
                },
                child: const Text(
                  'See all',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          notifs.when(
            data: (list) {
              if (list.isEmpty) {
                return Container(
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: theme.colorScheme.outline.withOpacity(0.15),
                    ),
                  ),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(
                          Icons.notifications_none_rounded,
                          size: 32,
                          color:
                              theme.colorScheme.onSurface.withOpacity(0.25),
                        ),
                        const SizedBox(height: 8),
                        Text("You're all caught up!",
                            style: theme.textTheme.bodyMedium),
                      ],
                    ),
                  ),
                );
              }
              return Column(
                children: list.take(5).map((n) {
                  return _RecentNotifTile(
                    item: n,
                    iconFor: _typeIcon,
                    colorFor: _typeColor,
                  );
                }).toList(),
              );
            },
            loading: () =>
                const SkeletonList(itemCount: 3, itemHeight: 72),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }
}

class _RecentNotifTile extends ConsumerWidget {
  final UnifiedFeedItem item;
  final IconData Function(String?) iconFor;
  final Color Function(String?, String) colorFor;

  const _RecentNotifTile({
    required this.item,
    required this.iconFor,
    required this.colorFor,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final read = item.read;
    final color = colorFor(item.rawType, item.priority);

    String timeStr = '';
    if (item.publishedAt != null) {
      try {
        timeStr = timeago.format(DateTime.parse(item.publishedAt!));
      } catch (_) {}
    }

    return GestureDetector(
      onTap: () => showBroadcastDetailSheet(context, item, ref: ref),
      behavior: HitTestBehavior.opaque,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: read
              ? theme.colorScheme.surface
              : AppColors.primary.withOpacity(0.03),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: read
                ? theme.colorScheme.outline.withOpacity(0.12)
                : AppColors.primary.withOpacity(0.12),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(iconFor(item.rawType), size: 16, color: color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (item.title.isNotEmpty)
                    Text(
                      item.title,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight:
                            read ? FontWeight.w500 : FontWeight.w700,
                        color: theme.colorScheme.onSurface,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  if (item.message.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 3),
                      child: Text(
                        item.message,
                        style: theme.textTheme.bodySmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  if (timeStr.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        timeStr,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                          color: theme.colorScheme.onSurface
                              .withOpacity(0.35),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            if (!read)
              Container(
                margin: const EdgeInsets.only(left: 8, top: 4),
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
