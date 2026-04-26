import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../widgets/profile_overview_tab.dart';
import '../widgets/profile_security_tab.dart';
import '../widgets/profile_settings_tab.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final theme = Theme.of(context);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        body: SafeArea(
          child: NestedScrollView(
            headerSliverBuilder: (context, innerBoxScrolled) => [
              SliverToBoxAdapter(
                child: _ProfileHeader(user: user, theme: theme),
              ),
              SliverPersistentHeader(
                pinned: true,
                delegate: _TabBarDelegate(
                  TabBar(
                    labelColor: theme.colorScheme.onSurface,
                    unselectedLabelColor:
                        theme.colorScheme.onSurface.withOpacity(0.4),
                    indicatorColor: AppColors.primary,
                    indicatorWeight: 2,
                    indicatorSize: TabBarIndicatorSize.label,
                    labelStyle: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.2,
                    ),
                    unselectedLabelStyle: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                    dividerColor: theme.colorScheme.outline.withOpacity(0.15),
                    tabs: const [
                      Tab(text: 'Overview'),
                      Tab(text: 'Security'),
                      Tab(text: 'Settings'),
                    ],
                  ),
                  theme.scaffoldBackgroundColor,
                ),
              ),
            ],
            body: TabBarView(
              children: [
                ProfileOverviewTab(user: user),
                const ProfileSecurityTab(),
                const ProfileSettingsTab(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// PROFILE HEADER — avatar, name, email, badges
// ═══════════════════════════════════════════════════════════════════

class _ProfileHeader extends StatelessWidget {
  final dynamic user;
  final ThemeData theme;
  const _ProfileHeader({required this.user, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
      child: Column(
        children: [
          // Avatar with subtle ring + edit badge
          Stack(
            children: [
              Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.primaryLight.withOpacity(0.35),
                    width: 2,
                  ),
                ),
                child: CircleAvatar(
                  radius: 44,
                  backgroundColor:
                      theme.colorScheme.onSurface.withOpacity(0.06),
                  backgroundImage: user?.profileImage != null
                      ? CachedNetworkImageProvider(user!.profileImage!)
                      : null,
                  child: user?.profileImage == null
                      ? Text(
                          (user?.name ?? 'U')[0].toUpperCase(),
                          style: TextStyle(
                            color:
                                theme.colorScheme.onSurface.withOpacity(0.5),
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                          ),
                        )
                      : null,
                ),
              ),
              // Edit badge
              Positioned(
                bottom: 0,
                right: 0,
                child: GestureDetector(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    context.push('/profile/edit');
                  },
                  child: Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: theme.scaffoldBackgroundColor,
                        width: 2.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.edit_rounded,
                      size: 14,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Name
          Text(
            user?.name ?? 'Obidient Member',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.3,
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 4),

          // Email
          Text(
            user?.email ?? '',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w400,
              color: theme.colorScheme.onSurface.withOpacity(0.45),
            ),
          ),
          const SizedBox(height: 12),

          // Badges — subtle grey chips
          Wrap(
            spacing: 8,
            runSpacing: 6,
            alignment: WrapAlignment.center,
            children: [
              if (user?.kycStatus == 'approved')
                _Badge(
                  label: 'Verified',
                  icon: Icons.verified_user_outlined,
                  theme: theme,
                  accentColor: AppColors.primary,
                )
              else
                _Badge(
                  label: 'Not Verified',
                  icon: Icons.gpp_maybe_outlined,
                  theme: theme,
                ),
              if (user?.designation != null &&
                  user!.designation != 'Community Member')
                _Badge(
                  label: user!.designation!,
                  icon: Icons.shield_outlined,
                  theme: theme,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Badge — monochrome, not colored ──────────────────────────────

class _Badge extends StatelessWidget {
  final String label;
  final IconData icon;
  final ThemeData theme;
  final Color? accentColor;
  const _Badge({required this.label, required this.icon, required this.theme, this.accentColor});

  @override
  Widget build(BuildContext context) {
    final color = accentColor ?? theme.colorScheme.onSurface.withOpacity(0.5);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: color.withOpacity(0.15),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
              letterSpacing: 0.1,
            ),
          ),
        ],
      ),
    );
  }
}

// ── TabBar Delegate ──────────────────────────────────────────────

class _TabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  final Color backgroundColor;
  _TabBarDelegate(this.tabBar, this.backgroundColor);

  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(context, shrinkOffset, overlapsContent) {
    return Container(color: backgroundColor, child: tabBar);
  }

  @override
  bool shouldRebuild(covariant _TabBarDelegate old) =>
      tabBar != old.tabBar || backgroundColor != old.backgroundColor;
}
