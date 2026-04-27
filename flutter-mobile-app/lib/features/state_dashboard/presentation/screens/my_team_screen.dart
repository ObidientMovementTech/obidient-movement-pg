import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/coordinator_models.dart';
import '../providers/dashboard_providers.dart';

// ── Designation filter options ────────────────────────────────
const _allDesignations = [
  'State Coordinator',
  'LGA Coordinator',
  'Ward Coordinator',
  'Polling Unit Agent',
  'Vote Defender',
];

List<String> _visibleDesignations(String? userDesignation, String? userRole) {
  if (userRole == 'admin' || userDesignation == 'National Coordinator') {
    return _allDesignations;
  }
  switch (userDesignation) {
    case 'State Coordinator':
      return _allDesignations.sublist(1);
    case 'LGA Coordinator':
      return _allDesignations.sublist(2);
    case 'Ward Coordinator':
      return _allDesignations.sublist(3);
    default:
      return _allDesignations;
  }
}

List<_GroupedSection> _groupSubordinates({
  required List<SearchedUser> members,
  required String? activeDesignation,
  required String? userLevel,
}) {
  if (members.isEmpty) return [];

  if (activeDesignation == null || activeDesignation.isEmpty) {
    final map = <String, List<SearchedUser>>{};
    for (final m in members) {
      final key = m.designation ?? 'Unknown';
      (map[key] ??= []).add(m);
    }
    return map.entries
        .map((e) => _GroupedSection(label: e.key, members: e.value))
        .toList();
  }

  String Function(SearchedUser) groupKeyFn;
  switch (userLevel) {
    case 'national':
      groupKeyFn = (m) => m.assignedState ?? 'No State';
    case 'state':
      groupKeyFn = (m) => m.assignedLGA ?? 'No LGA';
    case 'lga':
      groupKeyFn = (m) => m.assignedWard ?? 'No Ward';
    default:
      return [_GroupedSection(label: '', members: members)];
  }

  final map = <String, List<SearchedUser>>{};
  for (final m in members) {
    final key = groupKeyFn(m);
    (map[key] ??= []).add(m);
  }
  final sorted = map.entries.toList()..sort((a, b) => a.key.compareTo(b.key));
  return sorted
      .map((e) => _GroupedSection(label: e.key, members: e.value))
      .toList();
}

class _GroupedSection {
  final String label;
  final List<SearchedUser> members;
  const _GroupedSection({required this.label, required this.members});
}

// ═══════════════════════════════════════════════════════════════
// SCREEN
// ═══════════════════════════════════════════════════════════════

class MyTeamScreen extends ConsumerStatefulWidget {
  const MyTeamScreen({super.key});

  @override
  ConsumerState<MyTeamScreen> createState() => _MyTeamScreenState();
}

class _MyTeamScreenState extends ConsumerState<MyTeamScreen> {
  final _searchCtrl = TextEditingController();
  Timer? _debounce;

  int _page = 1;
  String _activeDesignation = '';
  String _debouncedSearch = '';
  final Set<String> _collapsedGroups = {};

  String? _userDesignation;
  String? _userRole;
  String? _userLevel;

  @override
  void initState() {
    super.initState();
    _loadUserLevel();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadUserLevel() async {
    final info = await ref.read(userLevelProvider.future);
    if (mounted) {
      setState(() {
        _userDesignation = info.designation;
        _userRole = info.role;
        _userLevel = info.userLevel;
      });
    }
  }

  SubordinatesParams get _params => (
        page: _page,
        designation: _activeDesignation.isEmpty ? null : _activeDesignation,
        q: _debouncedSearch.isEmpty ? null : _debouncedSearch,
      );

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      if (mounted) {
        setState(() {
          _debouncedSearch = value.trim();
          _page = 1;
        });
      }
    });
  }

  void _setDesignation(String designation) {
    HapticFeedback.lightImpact();
    setState(() {
      _activeDesignation =
          _activeDesignation == designation ? '' : designation;
      _page = 1;
      _collapsedGroups.clear();
    });
  }

  void _refresh() {
    HapticFeedback.mediumImpact();
    ref.invalidate(subordinatesProvider);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final subsAsync = ref.watch(subordinatesProvider(_params));

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ──────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.onSurface.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(Icons.arrow_back_rounded,
                          size: 20, color: theme.colorScheme.onSurface),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'My Team',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.4,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                        subsAsync.whenOrNull(
                              data: (result) => Text(
                                _buildSubtitle(result.total),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: theme.colorScheme.onSurface
                                      .withOpacity(0.4),
                                ),
                              ),
                            ) ??
                            const SizedBox.shrink(),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: _refresh,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.onSurface.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(Icons.refresh_rounded,
                          size: 20, color: theme.colorScheme.onSurface),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // ── Search bar ──────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                controller: _searchCtrl,
                onChanged: _onSearchChanged,
                style: TextStyle(
                    fontSize: 14, color: theme.colorScheme.onSurface),
                decoration: InputDecoration(
                  hintText: 'Search by name, email, or phone…',
                  hintStyle: TextStyle(
                      color: theme.colorScheme.onSurface.withOpacity(0.3)),
                  prefixIcon: Icon(Icons.search_rounded,
                      size: 18,
                      color: theme.colorScheme.onSurface.withOpacity(0.3)),
                  suffixIcon: _searchCtrl.text.isNotEmpty
                      ? GestureDetector(
                          onTap: () {
                            _searchCtrl.clear();
                            _onSearchChanged('');
                          },
                          child: Icon(Icons.close_rounded,
                              size: 18,
                              color: theme.colorScheme.onSurface
                                  .withOpacity(0.3)),
                        )
                      : null,
                  filled: true,
                  fillColor: theme.colorScheme.onSurface.withOpacity(0.05),
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),

            // ── Designation filter chips ─────────────────
            if (_userDesignation != null || _userRole != null)
              SizedBox(
                height: 36,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    _FilterChip(
                      label: 'All',
                      selected: _activeDesignation.isEmpty,
                      theme: theme,
                      onTap: () {
                        HapticFeedback.lightImpact();
                        setState(() {
                          _activeDesignation = '';
                          _page = 1;
                          _collapsedGroups.clear();
                        });
                      },
                    ),
                    const SizedBox(width: 6),
                    ..._visibleDesignations(_userDesignation, _userRole)
                        .map((d) => Padding(
                              padding: const EdgeInsets.only(right: 6),
                              child: _FilterChip(
                                label: _abbreviate(d),
                                selected: _activeDesignation == d,
                                theme: theme,
                                onTap: () => _setDesignation(d),
                              ),
                            )),
                  ],
                ),
              ),
            const SizedBox(height: 8),

            // ── Content ─────────────────────────────────
            Expanded(
              child: subsAsync.when(
                loading: () => _buildSkeleton(theme),
                error: (e, _) => _buildError(theme),
                data: (result) {
                  if (result.subordinates.isEmpty) {
                    return _buildEmpty(theme);
                  }
                  return _buildGroupedList(
                      theme, result.subordinates, result.total, result.pages);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _buildSubtitle(int total) {
    final parts = <String>['$total member${total != 1 ? 's' : ''}'];
    if (_activeDesignation.isNotEmpty) {
      parts.add(_abbreviate(_activeDesignation));
    }
    if (_debouncedSearch.isNotEmpty) {
      parts.add('"$_debouncedSearch"');
    }
    return parts.join(' · ');
  }

  static String _abbreviate(String d) {
    switch (d) {
      case 'State Coordinator':
        return 'State Coord';
      case 'LGA Coordinator':
        return 'LGA Coord';
      case 'Ward Coordinator':
        return 'Ward Coord';
      case 'Polling Unit Agent':
        return 'PU Agent';
      default:
        return d;
    }
  }

  // ── Grouped list with pagination ────────────────────────────

  Widget _buildGroupedList(
      ThemeData theme, List<SearchedUser> members, int total, int pages) {
    final groups = _groupSubordinates(
      members: members,
      activeDesignation:
          _activeDesignation.isEmpty ? null : _activeDesignation,
      userLevel: _userLevel,
    );

    final items = <_ListItem>[];
    for (final group in groups) {
      if (group.label.isNotEmpty) {
        items.add(_ListItem.header(group.label, group.members.length));
      }
      if (!_collapsedGroups.contains(group.label)) {
        for (final m in group.members) {
          items.add(_ListItem.member(m));
        }
      }
    }

    return Column(
      children: [
        Expanded(
          child: RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => _refresh(),
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              itemCount: items.length,
              itemBuilder: (_, i) {
                final item = items[i];
                if (item.isHeader) {
                  return _GroupHeader(
                    label: item.headerLabel!,
                    count: item.headerCount!,
                    collapsed: _collapsedGroups.contains(item.headerLabel),
                    theme: theme,
                    onTap: () {
                      HapticFeedback.lightImpact();
                      setState(() {
                        final label = item.headerLabel!;
                        if (_collapsedGroups.contains(label)) {
                          _collapsedGroups.remove(label);
                        } else {
                          _collapsedGroups.add(label);
                        }
                      });
                    },
                  );
                }
                return _TeamMemberCard(
                  user: item.user!,
                  theme: theme,
                  onEdit: () => _showEditSheet(item.user!),
                  onRemove: () => _confirmRemove(item.user!),
                );
              },
            ),
          ),
        ),
        if (pages > 1)
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            decoration: BoxDecoration(
              border: Border(
                  top: BorderSide(
                      color: theme.colorScheme.outline.withOpacity(0.08))),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _PageButton(
                  icon: Icons.chevron_left_rounded,
                  enabled: _page > 1,
                  theme: theme,
                  onTap: () => setState(() => _page--),
                ),
                const SizedBox(width: 16),
                Text(
                  'Page $_page of $pages',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface.withOpacity(0.5),
                  ),
                ),
                const SizedBox(width: 16),
                _PageButton(
                  icon: Icons.chevron_right_rounded,
                  enabled: _page < pages,
                  theme: theme,
                  onTap: () => setState(() => _page++),
                ),
              ],
            ),
          ),
      ],
    );
  }

  // ── Edit designation ────────────────────────────────────────

  void _showEditSheet(SearchedUser user) {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _EditDesignationSheet(
        user: user,
        onSaved: () {
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${user.name} designation updated'),
              backgroundColor: AppColors.success,
            ),
          );
          ref.invalidate(subordinatesProvider);
        },
      ),
    );
  }

  // ── Remove ──────────────────────────────────────────────────

  void _confirmRemove(SearchedUser user) {
    HapticFeedback.lightImpact();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove Designation'),
        content: Text(
            'Remove "${user.designation}" from ${user.name}? They will be set back to Community Member.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                final ds = ref.read(coordinatorDsProvider);
                await ds.removeDesignation(user.id);
                ref.invalidate(subordinatesProvider);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                          '${user.name} removed as ${user.designation}'),
                      backgroundColor: AppColors.warning,
                    ),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed: $e'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
            },
            child:
                const Text('Remove', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }

  // ── Skeleton / Error / Empty ────────────────────────────────

  Widget _buildSkeleton(ThemeData theme) {
    return Shimmer.fromColors(
      baseColor: theme.colorScheme.onSurface.withOpacity(0.06),
      highlightColor: theme.colorScheme.onSurface.withOpacity(0.02),
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 40),
        itemCount: 8,
        itemBuilder: (_, __) => Container(
          height: 68,
          margin: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  Widget _buildError(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline_rounded,
                size: 40,
                color: theme.colorScheme.onSurface.withOpacity(0.2)),
            const SizedBox(height: 12),
            Text('Could not load team',
                style: TextStyle(
                    fontSize: 14,
                    color: theme.colorScheme.onSurface.withOpacity(0.5))),
            const SizedBox(height: 14),
            OutlinedButton.icon(
              onPressed: _refresh,
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: const Text('Retry'),
              style: OutlinedButton.styleFrom(
                foregroundColor:
                    theme.colorScheme.onSurface.withOpacity(0.6),
                side: BorderSide(
                    color: theme.colorScheme.outline.withOpacity(0.2)),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.group_off_outlined,
                size: 48,
                color: theme.colorScheme.onSurface.withOpacity(0.12)),
            const SizedBox(height: 14),
            Text(
              _activeDesignation.isNotEmpty || _debouncedSearch.isNotEmpty
                  ? 'No matching members'
                  : 'No team members yet',
              style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface),
            ),
            const SizedBox(height: 6),
            Text(
              _activeDesignation.isNotEmpty || _debouncedSearch.isNotEmpty
                  ? 'Try adjusting your filters.'
                  : 'Assign leaders to see them here.',
              style: TextStyle(
                  fontSize: 13,
                  color: theme.colorScheme.onSurface.withOpacity(0.4)),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// List item union for interleaved headers + members
// ═══════════════════════════════════════════════════════════════

class _ListItem {
  final bool isHeader;
  final String? headerLabel;
  final int? headerCount;
  final SearchedUser? user;

  const _ListItem._({
    required this.isHeader,
    this.headerLabel,
    this.headerCount,
    this.user,
  });

  factory _ListItem.header(String label, int count) =>
      _ListItem._(isHeader: true, headerLabel: label, headerCount: count);

  factory _ListItem.member(SearchedUser user) =>
      _ListItem._(isHeader: false, user: user);
}

// ═══════════════════════════════════════════════════════════════
// FILTER CHIP
// ═══════════════════════════════════════════════════════════════

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final ThemeData theme;
  final VoidCallback onTap;
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.theme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primary.withOpacity(0.12)
              : theme.colorScheme.onSurface.withOpacity(0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected
                ? AppColors.primary.withOpacity(0.3)
                : Colors.transparent,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
            color: selected
                ? AppColors.primary
                : theme.colorScheme.onSurface.withOpacity(0.55),
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// GROUP HEADER
// ═══════════════════════════════════════════════════════════════

class _GroupHeader extends StatelessWidget {
  final String label;
  final int count;
  final bool collapsed;
  final ThemeData theme;
  final VoidCallback onTap;
  const _GroupHeader({
    required this.label,
    required this.count,
    required this.collapsed,
    required this.theme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.only(top: 12, bottom: 6),
        child: Row(
          children: [
            Icon(
              collapsed
                  ? Icons.chevron_right_rounded
                  : Icons.expand_more_rounded,
              size: 18,
              color: theme.colorScheme.onSurface.withOpacity(0.35),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.3,
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withOpacity(0.06),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '$count',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface.withOpacity(0.4),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// TEAM MEMBER CARD (with edit + remove)
// ═══════════════════════════════════════════════════════════════

class _TeamMemberCard extends StatelessWidget {
  final SearchedUser user;
  final ThemeData theme;
  final VoidCallback onEdit;
  final VoidCallback onRemove;
  const _TeamMemberCard({
    required this.user,
    required this.theme,
    required this.onEdit,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final location = [
      user.assignedState,
      user.assignedLGA,
      user.assignedWard,
    ].where((s) => s != null && s.isNotEmpty).join(' · ');

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: theme.colorScheme.onSurface.withOpacity(0.06),
            backgroundImage:
                user.profileImage != null ? NetworkImage(user.profileImage!) : null,
            child: user.profileImage == null
                ? Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface.withOpacity(0.4)))
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user.name,
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface)),
                const SizedBox(height: 2),
                if (user.designation != null)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(user.designation!,
                        style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary)),
                  ),
                if (location.isNotEmpty) ...[
                  const SizedBox(height: 3),
                  Text(location,
                      style: TextStyle(
                          fontSize: 11,
                          color: theme.colorScheme.onSurface.withOpacity(0.35))),
                ],
              ],
            ),
          ),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: onEdit,
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.edit_outlined,
                  size: 16, color: AppColors.primary),
            ),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: onRemove,
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.person_remove_outlined,
                  size: 16, color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// PAGE BUTTON (pagination)
// ═══════════════════════════════════════════════════════════════

class _PageButton extends StatelessWidget {
  final IconData icon;
  final bool enabled;
  final ThemeData theme;
  final VoidCallback onTap;
  const _PageButton({
    required this.icon,
    required this.enabled,
    required this.theme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: enabled
          ? () {
              HapticFeedback.lightImpact();
              onTap();
            }
          : null,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: enabled
              ? theme.colorScheme.onSurface.withOpacity(0.06)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          icon,
          size: 20,
          color: enabled
              ? theme.colorScheme.onSurface
              : theme.colorScheme.onSurface.withOpacity(0.15),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// EDIT DESIGNATION BOTTOM SHEET
// ═══════════════════════════════════════════════════════════════

class _EditDesignationSheet extends ConsumerStatefulWidget {
  final SearchedUser user;
  final VoidCallback onSaved;
  const _EditDesignationSheet({required this.user, required this.onSaved});

  @override
  ConsumerState<_EditDesignationSheet> createState() =>
      _EditDesignationSheetState();
}

class _EditDesignationSheetState
    extends ConsumerState<_EditDesignationSheet> {
  String? _selectedDesignation;
  NigeriaLocation? _selectedState;
  NigeriaLocation? _selectedLGA;
  NigeriaLocation? _selectedWard;
  bool _loading = false;
  String? _error;

  List<String> get _assignableDesignations {
    final userLevel = ref.read(userLevelProvider).valueOrNull;
    if (userLevel == null) return [];
    if (userLevel.role == 'admin') {
      return [
        'State Coordinator',
        'LGA Coordinator',
        'Ward Coordinator',
        'Polling Unit Agent',
      ];
    }
    switch (userLevel.designation) {
      case 'National Coordinator':
        return [
          'State Coordinator',
          'LGA Coordinator',
          'Ward Coordinator',
          'Polling Unit Agent',
        ];
      case 'State Coordinator':
        return ['LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent'];
      case 'LGA Coordinator':
        return ['Ward Coordinator', 'Polling Unit Agent'];
      case 'Ward Coordinator':
        return ['Polling Unit Agent'];
      default:
        return [];
    }
  }

  bool get _needsState =>
      _selectedDesignation != null &&
      _selectedDesignation != 'Community Member';
  bool get _needsLGA =>
      _selectedDesignation == 'LGA Coordinator' ||
      _selectedDesignation == 'Ward Coordinator' ||
      _selectedDesignation == 'Polling Unit Agent';
  bool get _needsWard =>
      _selectedDesignation == 'Ward Coordinator' ||
      _selectedDesignation == 'Polling Unit Agent';

  bool get _canSubmit {
    if (_selectedDesignation == null) return false;
    if (_selectedDesignation == 'State Coordinator' && _selectedState == null) {
      return false;
    }
    if (_needsLGA && _selectedLGA == null) return false;
    if (_needsWard && _selectedWard == null) return false;
    return true;
  }

  Future<void> _submit() async {
    if (!_canSubmit || _loading) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final ds = ref.read(coordinatorDsProvider);
      await ds.assignDesignation(
        userId: widget.user.id,
        designation: _selectedDesignation!,
        assignedState: _selectedState?.name,
        assignedLGA: _selectedLGA?.name,
        assignedWard: _selectedWard?.name,
        override: true,
      );
      if (mounted) widget.onSaved();
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.fromLTRB(
          20, 12, 20, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withOpacity(0.12),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor:
                    theme.colorScheme.onSurface.withOpacity(0.06),
                backgroundImage: widget.user.profileImage != null
                    ? NetworkImage(widget.user.profileImage!)
                    : null,
                child: widget.user.profileImage == null
                    ? Text(
                        widget.user.name.isNotEmpty
                            ? widget.user.name[0].toUpperCase()
                            : '?',
                        style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onSurface
                                .withOpacity(0.4)))
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.user.name,
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onSurface)),
                    if (widget.user.designation != null)
                      Text(
                        'Currently: ${widget.user.designation}',
                        style: TextStyle(
                            fontSize: 12,
                            color: theme.colorScheme.onSurface
                                .withOpacity(0.4)),
                      ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          Text('New Designation',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface.withOpacity(0.5))),
          const SizedBox(height: 6),
          _Dropdown<String>(
            value: _selectedDesignation,
            hint: 'Choose designation…',
            items: _assignableDesignations,
            labelBuilder: (d) => d,
            theme: theme,
            onChanged: (d) {
              setState(() {
                _selectedDesignation = d;
                _selectedState = null;
                _selectedLGA = null;
                _selectedWard = null;
              });
            },
          ),
          const SizedBox(height: 12),

          if (_needsState) ...[
            Text('State',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface.withOpacity(0.5))),
            const SizedBox(height: 6),
            _buildStatePicker(theme),
            const SizedBox(height: 12),
          ],

          if (_needsLGA && _selectedState != null) ...[
            Text('LGA',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface.withOpacity(0.5))),
            const SizedBox(height: 6),
            _buildLGAPicker(theme),
            const SizedBox(height: 12),
          ],

          if (_needsWard && _selectedLGA != null) ...[
            Text('Ward',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface.withOpacity(0.5))),
            const SizedBox(height: 6),
            _buildWardPicker(theme),
            const SizedBox(height: 12),
          ],

          if (_error != null) ...[
            Text(_error!,
                style:
                    const TextStyle(fontSize: 12, color: AppColors.error)),
            const SizedBox(height: 8),
          ],

          const SizedBox(height: 8),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _canSubmit && !_loading ? _submit : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                disabledBackgroundColor: AppColors.primary.withOpacity(0.3),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: _loading
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Text('Save Change',
                      style: TextStyle(
                          fontSize: 14, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatePicker(ThemeData theme) {
    final userLevel = ref.read(userLevelProvider).valueOrNull;
    if (userLevel != null &&
        userLevel.designation != 'National Coordinator' &&
        userLevel.role != 'admin') {
      final loc = userLevel.assignedLocation;
      final name =
          (loc?['stateName'] as String?) ?? (loc?['stateId'] as String?) ?? '';

      final statesAsync = ref.watch(nigeriaStatesProvider);
      statesAsync.whenData((states) {
        if (_selectedState == null || _selectedState!.id == 0) {
          final match = states.firstWhere(
            (s) => s.name.toLowerCase() == name.toLowerCase(),
            orElse: () => NigeriaLocation(id: 0, name: name),
          );
          if (match.id != 0) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted && (_selectedState == null || _selectedState!.id == 0)) {
                setState(() => _selectedState = match);
              }
            });
          }
        }
      });

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: theme.colorScheme.onSurface.withOpacity(0.04),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(name.isEmpty ? 'Your state' : name,
            style:
                TextStyle(fontSize: 14, color: theme.colorScheme.onSurface)),
      );
    }

    final statesAsync = ref.watch(nigeriaStatesProvider);
    return statesAsync.when(
      loading: () => _loadingBox(theme),
      error: (_, __) => const Text('Failed to load states',
          style: TextStyle(fontSize: 12, color: AppColors.error)),
      data: (states) => _Dropdown<NigeriaLocation>(
        value: _selectedState,
        hint: 'Select state…',
        items: states,
        labelBuilder: (s) => s.name,
        theme: theme,
        onChanged: (s) {
          setState(() {
            _selectedState = s;
            _selectedLGA = null;
            _selectedWard = null;
          });
        },
      ),
    );
  }

  Widget _buildLGAPicker(ThemeData theme) {
    final userLevel = ref.read(userLevelProvider).valueOrNull;
    if (userLevel != null &&
        (userLevel.designation == 'LGA Coordinator' ||
            userLevel.designation == 'Ward Coordinator')) {
      final loc = userLevel.assignedLocation;
      final name =
          (loc?['lgaName'] as String?) ?? (loc?['lgaId'] as String?) ?? '';

      if (_selectedState != null && _selectedState!.id != 0) {
        final lgasAsync = ref.watch(nigeriaLGAsProvider(_selectedState!.id));
        lgasAsync.whenData((lgas) {
          if (_selectedLGA == null || _selectedLGA!.id == 0) {
            final match = lgas.firstWhere(
              (l) => l.name.toLowerCase() == name.toLowerCase(),
              orElse: () => NigeriaLocation(id: 0, name: name),
            );
            if (match.id != 0) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted && (_selectedLGA == null || _selectedLGA!.id == 0)) {
                  setState(() => _selectedLGA = match);
                }
              });
            }
          }
        });
      }

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: theme.colorScheme.onSurface.withOpacity(0.04),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(name.isEmpty ? 'Your LGA' : name,
            style:
                TextStyle(fontSize: 14, color: theme.colorScheme.onSurface)),
      );
    }

    if (_selectedState == null || _selectedState!.id == 0) {
      return _loadingBox(theme);
    }

    final lgasAsync = ref.watch(nigeriaLGAsProvider(_selectedState!.id));
    return lgasAsync.when(
      loading: () => _loadingBox(theme),
      error: (_, __) => const Text('Failed to load LGAs',
          style: TextStyle(fontSize: 12, color: AppColors.error)),
      data: (lgas) => _Dropdown<NigeriaLocation>(
        value: _selectedLGA,
        hint: 'Select LGA…',
        items: lgas,
        labelBuilder: (l) => l.name,
        theme: theme,
        onChanged: (l) {
          setState(() {
            _selectedLGA = l;
            _selectedWard = null;
          });
        },
      ),
    );
  }

  Widget _buildWardPicker(ThemeData theme) {
    final userLevel = ref.read(userLevelProvider).valueOrNull;
    if (userLevel != null && userLevel.designation == 'Ward Coordinator') {
      final loc = userLevel.assignedLocation;
      final name =
          (loc?['wardName'] as String?) ?? (loc?['wardId'] as String?) ?? '';

      if (_selectedLGA != null && _selectedLGA!.id != 0) {
        final wardsAsync = ref.watch(nigeriaWardsProvider(_selectedLGA!.id));
        wardsAsync.whenData((wards) {
          if (_selectedWard == null || _selectedWard!.id == 0) {
            final match = wards.firstWhere(
              (w) => w.name.toLowerCase() == name.toLowerCase(),
              orElse: () => NigeriaLocation(id: 0, name: name),
            );
            if (match.id != 0) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted &&
                    (_selectedWard == null || _selectedWard!.id == 0)) {
                  setState(() => _selectedWard = match);
                }
              });
            }
          }
        });
      }

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: theme.colorScheme.onSurface.withOpacity(0.04),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(name.isEmpty ? 'Your Ward' : name,
            style:
                TextStyle(fontSize: 14, color: theme.colorScheme.onSurface)),
      );
    }

    if (_selectedLGA == null || _selectedLGA!.id == 0) {
      return _loadingBox(theme);
    }

    final wardsAsync = ref.watch(nigeriaWardsProvider(_selectedLGA!.id));
    return wardsAsync.when(
      loading: () => _loadingBox(theme),
      error: (_, __) => const Text('Failed to load wards',
          style: TextStyle(fontSize: 12, color: AppColors.error)),
      data: (wards) => _Dropdown<NigeriaLocation>(
        value: _selectedWard,
        hint: 'Select ward…',
        items: wards,
        labelBuilder: (w) => w.name,
        theme: theme,
        onChanged: (w) => setState(() => _selectedWard = w),
      ),
    );
  }

  Widget _loadingBox(ThemeData theme) {
    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: theme.colorScheme.onSurface.withOpacity(0.04),
        borderRadius: BorderRadius.circular(10),
      ),
      child: const Center(
          child: SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                  strokeWidth: 2, color: AppColors.primary))),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// GENERIC DROPDOWN
// ═══════════════════════════════════════════════════════════════

class _Dropdown<T> extends StatelessWidget {
  final T? value;
  final String hint;
  final List<T> items;
  final String Function(T) labelBuilder;
  final ThemeData theme;
  final ValueChanged<T?> onChanged;
  const _Dropdown({
    required this.value,
    required this.hint,
    required this.items,
    required this.labelBuilder,
    required this.theme,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: theme.colorScheme.onSurface.withOpacity(0.04),
        borderRadius: BorderRadius.circular(10),
        border:
            Border.all(color: theme.colorScheme.outline.withOpacity(0.1)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          isExpanded: true,
          value: value,
          hint: Text(hint,
              style: TextStyle(
                  fontSize: 14,
                  color: theme.colorScheme.onSurface.withOpacity(0.3))),
          dropdownColor: theme.colorScheme.surface,
          items: items
              .map((item) => DropdownMenuItem<T>(
                    value: item,
                    child: Text(labelBuilder(item),
                        style: TextStyle(
                            fontSize: 14,
                            color: theme.colorScheme.onSurface)),
                  ))
              .toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }
}
