import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:shimmer/shimmer.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/voting_bloc.dart';
import '../providers/voting_bloc_providers.dart';

class PollingUnitTab extends ConsumerWidget {
  final VotingBloc bloc;
  const PollingUnitTab({super.key, required this.bloc});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final puAsync = ref.watch(pollingUnitMembersProvider);

    return puAsync.when(
      loading: () => _PUSkeleton(),
      error: (err, _) => _ErrorView(
        onRetry: () => ref.invalidate(pollingUnitMembersProvider),
      ),
      data: (data) {
        final members = data.members;
        final pu = data.pollingUnit;

        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            HapticFeedback.mediumImpact();
            ref.invalidate(pollingUnitMembersProvider);
          },
          child: CustomScrollView(
            slivers: [
              // ── Location banner ────────────────────────────
              if (pu != null)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                    child: _LocationBanner(pu: pu, theme: theme),
                  ),
                ),

              // ── Stats bar ──────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '${data.total} Obidient${data.total == 1 ? '' : 's'} found in your polling unit',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
              ),

              // ── Members list ───────────────────────────────
              if (members.isEmpty)
                SliverFillRemaining(child: _EmptyView())
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
                  sliver: SliverList.builder(
                    itemCount: members.length,
                    itemBuilder: (context, index) {
                      final m = members[index];
                      return _PUMemberCard(member: m, theme: theme);
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

// ── Location Banner ──────────────────────────────────────────

class _LocationBanner extends StatelessWidget {
  final Map<String, dynamic> pu;
  final ThemeData theme;

  const _LocationBanner({required this.pu, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.success,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Your Polling Unit Location',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              if (pu['state'] != null)
                _LocationChip(label: '${pu['state']}', theme: theme),
              if (pu['lga'] != null)
                _LocationChip(label: '${pu['lga']}', theme: theme),
              if (pu['ward'] != null)
                _LocationChip(label: '${pu['ward']}', theme: theme),
              if (pu['code'] != null)
                _LocationChip(label: '${pu['code']}', theme: theme),
            ],
          ),
        ],
      ),
    );
  }
}

class _LocationChip extends StatelessWidget {
  final String label;
  final ThemeData theme;
  const _LocationChip({required this.label, required this.theme});

  @override
  Widget build(BuildContext context) {
    final color = theme.colorScheme.onSurface.withOpacity(0.55);
    final bg = theme.colorScheme.onSurface.withOpacity(0.05);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

// ── PU Member Card ───────────────────────────────────────────

class _PUMemberCard extends StatelessWidget {
  final Map<String, dynamic> member;
  final ThemeData theme;

  const _PUMemberCard({required this.member, required this.theme});

  @override
  Widget build(BuildContext context) {
    final name = member['fullName'] as String? ?? 'Unknown';
    final email = member['email'] as String?;
    final phone = member['phoneNumber'] as String?;
    final isCurrentUser = member['isCurrentUser'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: theme.colorScheme.onSurface.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              Icons.person_rounded,
              size: 20,
              color: theme.colorScheme.onSurface.withOpacity(0.4),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                    Row(
                  children: [
                    Flexible(
                      child: Text(
                        name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ),
                    if (isCurrentUser) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'You',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                if (email != null)
                  Text(
                    email,
                    style: TextStyle(
                      fontSize: 12,
                      color: theme.colorScheme.onSurface.withOpacity(0.4),
                    ),
                  ),
              ],
            ),
          ),
          if (phone != null && !isCurrentUser)
            GestureDetector(
              onTap: () {
                HapticFeedback.lightImpact();
                final cleaned = phone.replaceAll(RegExp(r'[^0-9]'), '');
                final intl = cleaned.startsWith('0')
                    ? '234${cleaned.substring(1)}'
                    : cleaned;
                final url = 'https://wa.me/$intl';
                launchUrl(
                  Uri.parse(url),
                  mode: LaunchMode.externalApplication,
                );
              },
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF25D366),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const FaIcon(
                  FontAwesomeIcons.whatsapp,
                  size: 16,
                  color: Colors.white,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Skeleton ─────────────────────────────────────────────────

class _PUSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final base = theme.colorScheme.onSurface.withOpacity(0.06);
    final highlight = theme.colorScheme.onSurface.withOpacity(0.02);

    return Shimmer.fromColors(
      baseColor: base,
      highlightColor: highlight,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
        physics: const NeverScrollableScrollPhysics(),
        children: [
          Container(
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          const SizedBox(height: 12),
          Container(
            height: 36,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const SizedBox(height: 12),
          for (int i = 0; i < 6; i++) ...[
            Container(
              height: 64,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

// ── Empty + Error ────────────────────────────────────────────

class _EmptyView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.location_off_outlined,
              size: 36,
              color: theme.colorScheme.onSurface.withOpacity(0.15),
            ),
            const SizedBox(height: 14),
            Text(
              'No members in your polling unit',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Complete your profile to see nearby Obidients.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: theme.colorScheme.onSurface.withOpacity(0.4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final VoidCallback onRetry;
  const _ErrorView({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.error_outline_rounded,
            size: 36,
            color: theme.colorScheme.onSurface.withOpacity(0.2),
          ),
          const SizedBox(height: 10),
          Text(
            'Could not load polling unit data',
            style: TextStyle(
              fontSize: 14,
              color: theme.colorScheme.onSurface.withOpacity(0.5),
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded, size: 16),
            label: const Text('Retry'),
            style: OutlinedButton.styleFrom(
              foregroundColor: theme.colorScheme.onSurface.withOpacity(0.6),
              side: BorderSide(
                color: theme.colorScheme.outline.withOpacity(0.2),
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
